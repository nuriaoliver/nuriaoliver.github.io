import requests
import json
import argparse
import re
from datetime import datetime

BASE = "https://pub.orcid.org/v3.0"
HEADERS = {"Accept": "application/json"}

def safe_get(obj, *keys, default=None):
    """Safely navigate nested dicts/lists with fallback."""
    for key in keys:
        if isinstance(obj, dict):
            obj = obj.get(key)
        elif isinstance(obj, list):
            if not obj:
                return default
            obj = obj[0]
        else:
            return default
        if obj is None:
            return default
    return obj

def normalize_date(date_obj):
    """Convert ORCID date dict (year/month/day) to ISO string and normalized sort_date."""
    if not isinstance(date_obj, dict):
        return None, None, None
    year = safe_get(date_obj, "year", "value")
    month = safe_get(date_obj, "month", "value")
    day = safe_get(date_obj, "day", "value")
    if not year:
        return None, None, None

    # Fill in missing month/day
    month = month or "01"
    day = day or "01"

    try:
        sort_date = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d").strftime("%Y-%m-%d")
        date_str = "-".join([p for p in [year, safe_get(date_obj, "month", "value"), safe_get(date_obj, "day", "value")] if p])
        return date_str, sort_date, int(year)
    except Exception:
        return year, f"{year}-01-01", int(year)

def normalize_author(name):
    """Normalize author name so it's always 'Firstname Lastname'."""
    if not name:
        return None
    name = name.strip()
    if "," in name:
        parts = [p.strip() for p in name.split(",", 1)]
        if len(parts) == 2:
            name = f"{parts[1]} {parts[0]}"
    return name

def clean_html(text):
    """Strip HTML tags and normalize whitespace."""
    if not text:
        return text
    text = re.sub(r"<[^>]+>", "", text)  # Remove tags
    text = re.sub(r"\s+", " ", text)     # Collapse whitespace
    return text.strip()

def find_doi_in_citation(citation_text):
    """Try to extract a DOI from citation text."""
    if not citation_text:
        return ""
    match = re.search(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", citation_text, re.I)
    return match.group(0) if match else ""

def enrich_with_crossref(pub):
    CROSSREF_API = "https://api.crossref.org/works/"

    """If journal missing, try to fetch from Crossref using DOI."""
    doi = pub.get("doi")
    if not doi or pub.get("journal"):
        return pub
    try:
        r = requests.get(f"{CROSSREF_API}{doi}", headers={"Accept": "application/json"}, timeout=10)
        if r.status_code == 200:
            msg = r.json().get("message", {})
            pub["journal"] = (msg.get("container-title") or [""])[0]
            if not pub.get("title"):
                pub["title"] = (msg.get("title") or [""])[0]
            if not pub.get("date") and "published-print" in msg:
                parts = msg["published-print"].get("date-parts", [[]])[0]
                pub["date"] = "-".join(str(p).zfill(2) for p in parts)
    except Exception as e:
        print(f"⚠️ Crossref lookup failed for {doi}: {e}")
    return pub

def extract_publication(orcid, group):
    """Extract one canonical publication record from an ORCID group."""
    works = safe_get(group, "work-summary", default=[])
    if not works:
        return None

    summary = works[0]
    put_code = safe_get(summary, "put-code")
    if not put_code:
        return None

    # Fetch full work record
    try:
        r = requests.get(f"{BASE}/{orcid}/work/{put_code}", headers=HEADERS)
        r.raise_for_status()
        work = r.json()
    except requests.RequestException as e:
        print(f"⚠️  Skipping work {put_code}: {e}")
        return None

    pub = {}
    title = safe_get(work, "title", "title", "value") or safe_get(summary, "title", "title", "value")
    pub["title"] = clean_html(title)
    pub["journal"] = clean_html(safe_get(work, "journal-title", "value"))
    pub["type"] = safe_get(work, "type")
    pub["doi"] = ""
    pub["authors"] = []

    # DOI or patent number
    for eid in safe_get(work, "external-ids", "external-id", default=[]):
        eid_type = safe_get(eid, "external-id-type")
        if not eid_type:
            continue
        eid_type = str(eid_type).lower()

        if eid_type in ("doi", "doi_id", "digital-object-identifier"):
            pub["doi"] = safe_get(eid, "external-id-value")
        elif eid_type in ("pat", "patent"):
            pub["patent_number"] = safe_get(eid, "external-id-value")

    if not pub["doi"]:
        citation_text = safe_get(work, "citation", "citation-value")
        doi = find_doi_in_citation(citation_text)


    # Enrich metadata if journal missing
    pub = enrich_with_crossref(pub)

    pub["citation_count"] = get_citation_count(pub["doi"])

    # Full text URL
    full_text = safe_get(work, "url", "value")
    if not full_text:
        for eid in safe_get(work, "external-ids", "external-id", default=[]):
            t = safe_get(eid, "external-id-type", "")
            if t and str(t).lower() in ("uri", "url", "link"):
                full_text = safe_get(eid, "external-id-value")
                break

    pub["full_text_url"] = full_text

    # Date normalization
    date_dict = safe_get(work, "publication-date") or safe_get(summary, "publication-date")
    date_str, sort_date, year = normalize_date(date_dict)
    if date_str: 
        pub["date"] = date_str

    if sort_date:
        pub["sort_date"] = sort_date

    if year:
        pub["year"] = year

    # Contributors (authors)
    contributors = safe_get(work, "contributors", "contributor", default=[])
    for c in contributors:
        name = safe_get(c, "credit-name", "value") or safe_get(c, "contributor-orcid", "path")
        name = normalize_author(name)
        if name:
            if name.startswith("https://orcid.org/"):
                name = name.split("/")[-1]
            pub["authors"].append(name)

    # Fallback
    if not pub["authors"]:
        creators = safe_get(summary, "contributors", "contributor", default=[])
        for c in creators:
            name = normalize_author(safe_get(c, "credit-name", "value"))
            if name:
                pub["authors"].append(name)

    return pub

def get_citation_count(doi):
    """Query OpenCitations COCI API for citation count."""
    if not doi:
        return 0
    url = f"https://opencitations.net/index/coci/api/v1/citation-count/{doi}"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200 and r.json():
            return r.json()[0].get("count", 0)
    except Exception as e:
        print(f"⚠️ Citation lookup failed for {doi}: {e}")
    return 0

def fetch_orcid_publications(orcid):
    """Fetch all works for an ORCID ID."""
    print(f"Fetching works for ORCID {orcid} ...")
    url = f"{BASE}/{orcid}/works"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    groups = data.get("group", [])
    print(f"Found {len(groups)} works")

    publications = []
    for g in groups:
        pub = extract_publication(orcid, g)
        if pub:
            publications.append(pub)

    # Sort newest first
    # publications.sort(key=lambda p: p.get("sort_date", ""), reverse=True)
    return publications

def main():
    parser = argparse.ArgumentParser(description="Fetch ORCID publication records.")
    parser.add_argument("--orcid", required=True, help="ORCID ID (e.g. 0000-0001-5985-691X)")
    parser.add_argument("--output", default="data/publications.json", help="Output JSON file path")
    args = parser.parse_args()

    pubs = fetch_orcid_publications(args.orcid)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(pubs, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(pubs)} publications to {args.output}")

if __name__ == "__main__":
    main()
