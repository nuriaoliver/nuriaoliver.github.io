import requests
import json
import argparse
import re
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path

import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.bwriter import BibTexWriter

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

    """Enrich an ORCID publication with canonical Crossref metadata."""
    doi = pub.get("doi")
    if not doi:
        return pub
    try:
        r = requests.get(f"{CROSSREF_API}{doi}", headers={"Accept": "application/json"}, timeout=10)
        if r.status_code == 200:
            msg = r.json().get("message", {})
            crossref_journal = (msg.get("container-title") or [""])[0]
            crossref_title = (msg.get("title") or [""])[0]
            subtitle = (msg.get("subtitle") or [""])[0]
            if subtitle and subtitle.lower() not in crossref_title.lower():
                crossref_title = f"{crossref_title}: {subtitle}"
            pub["journal"] = crossref_journal or pub.get("journal")
            pub["title"] = crossref_title or pub.get("title")
            if not pub.get("authors"):
                pub["authors"] = [
                    " ".join(part for part in (author.get("given"), author.get("family")) if part)
                    for author in msg.get("author", [])
                ]
            date = msg.get("published") or msg.get("published-print") or msg.get("published-online")
            if not pub.get("date") and date:
                parts = date.get("date-parts", [[]])[0]
                pub["date"] = "-".join(str(p).zfill(2) for p in parts)
                if parts:
                    pub["year"] = int(parts[0])
            pub["crossref_type"] = msg.get("type", "")
            pub["publisher"] = msg.get("publisher", "")
            pub["volume"] = msg.get("volume", "")
            pub["number"] = msg.get("issue", "")
            pub["pages"] = msg.get("page") or msg.get("article-number", "")
    except Exception as e:
        print(f"⚠️ Crossref lookup failed for {doi}: {e}")
    return pub

def extract_publication(orcid, group, include_citations=False):
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
        if doi:
            pub["doi"] = doi


    # Enrich metadata if journal missing
    pub = enrich_with_crossref(pub)

    pub["citation_count"] = get_citation_count(pub["doi"]) if include_citations else 0

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
    orcid_authors = []
    for c in contributors:
        name = safe_get(c, "credit-name", "value") or safe_get(c, "contributor-orcid", "path")
        name = normalize_author(name)
        if name:
            if name.startswith("https://orcid.org/"):
                name = name.split("/")[-1]
            orcid_authors.append(name)
    if not pub["authors"]:
        pub["authors"] = orcid_authors

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

def fetch_orcid_publications(orcid, include_citations=False, workers=8):
    """Fetch all works for an ORCID ID."""
    print(f"Fetching works for ORCID {orcid} ...")
    url = f"{BASE}/{orcid}/works"
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    groups = data.get("group", [])
    print(f"Found {len(groups)} works")

    def extract(group):
        return extract_publication(orcid, group, include_citations=include_citations)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        publications = [pub for pub in executor.map(extract, groups) if pub]

    # Sort newest first
    # publications.sort(key=lambda p: p.get("sort_date", ""), reverse=True)
    return publications

def normalize_doi(value):
    """Normalize DOI values and DOI URLs for reliable matching."""
    value = (value or "").strip().lower()
    value = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", value)
    return value.rstrip(". ")

def normalize_title(value):
    """Normalize titles for fallback matching when a DOI is unavailable."""
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()

def load_bibliography(path):
    """Load a BibTeX database through bibtexparser."""
    parser = BibTexParser(ignore_nonstandard_types=False)
    with Path(path).open(encoding="utf-8") as bib_file:
        return bibtexparser.load(bib_file, parser=parser)

def author_families(authors):
    """Return normalized family names, excluding Nuria Oliver from overlap checks."""
    families = set()
    for author in authors or []:
        if isinstance(author, str):
            family = author.split(",", 1)[0] if "," in author else author.split()[-1]
            family = normalize_title(family).replace(" ", "")
            if family and family != "oliver":
                families.add(family)
    return families

def entry_authors(entry):
    """Split a BibTeX author field into individual names."""
    return [author.strip() for author in re.split(r"\s+and\s+", entry.get("author", "")) if author.strip()]

def has_nuria_author(authors):
    """Require an explicit Nuria Oliver credit rather than trusting ORCID ownership alone."""
    for author in authors or []:
        normalized = normalize_title(author)
        if normalized in {"nuria oliver", "oliver nuria", "n oliver", "oliver n"}:
            return True
    return False

def automatic_add_blocker(pub):
    """Return why a record cannot be safely offered for automatic addition."""
    doi = normalize_doi(pub.get("doi"))
    repository_prefixes = (
        "10.1101/",
        "10.17605/osf.io/",
        "10.48550/arxiv.",
        "10.5281/zenodo.",
    )
    if not doi:
        return "no DOI; automatic duplicate validation is not reliable"
    if doi.startswith(repository_prefixes):
        return "repository or preprint DOI; a published version may exist"
    if not has_nuria_author(pub.get("authors")):
        return "Nuria Oliver is not explicitly present in the author metadata"

    publication_type = (pub.get("crossref_type") or pub.get("type") or "").lower()
    scholarly_types = {"journal-article", "journal_article", "proceedings-article", "conference-paper", "conference_paper", "book-chapter", "book_chapter"}
    if publication_type not in scholarly_types:
        return f"work type '{publication_type or 'unknown'}' is not an article, paper, or chapter"

    title = normalize_title(pub.get("title"))
    if re.search(r"\b(keynotes?|preface|session details|editorial)\b", title) or re.search(r"\bmessage from\b.*\bchairs?\b", title):
        return "title indicates editorial, session, or keynote metadata rather than a paper"
    return None

def possible_duplicate(pub, entries):
    """Find a likely preprint, renamed version, or duplicate venue publication."""
    candidate_title = normalize_title(pub.get("title"))
    candidate_authors = author_families(pub.get("authors"))
    candidate_words = set(candidate_title.split())
    if not candidate_title:
        return None

    for entry in entries:
        existing_title = normalize_title(entry.get("title"))
        if not existing_title:
            continue
        existing_words = set(existing_title.split())
        sequence_score = SequenceMatcher(None, candidate_title, existing_title).ratio()
        union = candidate_words | existing_words
        token_score = len(candidate_words & existing_words) / len(union) if union else 0
        smaller_title = min(len(candidate_words), len(existing_words))
        containment_score = len(candidate_words & existing_words) / smaller_title if smaller_title else 0
        shared_coauthors = candidate_authors & author_families(entry_authors(entry))
        if sequence_score >= 0.86 or token_score >= 0.78:
            return entry
        if shared_coauthors and (sequence_score >= 0.60 or token_score >= 0.50 or containment_score >= 0.80):
            return entry
    return None

def classify_publications(publications, bib_database):
    """Classify ORCID works as safe candidates, exact matches, or review-only duplicates."""
    entries = bib_database.entries
    dois = {normalize_doi(entry.get("doi")) for entry in entries if entry.get("doi")}
    titles = {normalize_title(entry.get("title")) for entry in entries if entry.get("title")}
    safe_candidates = []
    review_candidates = []
    seen = set()

    for pub in publications:
        doi = normalize_doi(pub.get("doi"))
        title = normalize_title(pub.get("title"))
        identity = doi or title
        if not identity or identity in seen:
            continue
        seen.add(identity)
        if doi and doi in dois:
            continue
        if title and title in titles:
            continue
        duplicate = possible_duplicate(pub, entries)
        if duplicate:
            review_candidates.append((pub, f"possible duplicate of {duplicate.get('ID')}: {duplicate.get('title')}"))
        else:
            blocker = automatic_add_blocker(pub)
            if blocker:
                review_candidates.append((pub, blocker))
            else:
                safe_candidates.append(pub)

    safe_candidates.sort(key=lambda pub: pub.get("sort_date", ""), reverse=True)
    review_candidates.sort(key=lambda item: item[0].get("sort_date", ""), reverse=True)
    return safe_candidates, review_candidates

def find_missing_publications(publications, bib_database):
    """Return only candidates that pass conservative duplicate checks."""
    safe_candidates, _ = classify_publications(publications, bib_database)
    return safe_candidates

def bibtex_type(pub):
    """Map ORCID/Crossref types to BibTeX entry types."""
    publication_type = (pub.get("crossref_type") or pub.get("type") or "").lower()
    if publication_type in {"journal-article", "journal_article"}:
        return "article"
    if publication_type in {"proceedings-article", "conference-paper", "conference_paper"}:
        return "inproceedings"
    if publication_type in {"book-chapter", "book_chapter"}:
        return "incollection"
    if publication_type in {"book", "edited-book", "monograph"}:
        return "book"
    return "misc"

def citation_key(pub, existing_keys):
    """Generate a readable, unique BibTeX citation key."""
    authors = pub.get("authors") or ["unknown"]
    family = authors[0].split()[-1]
    family = normalize_title(family).replace(" ", "") or "unknown"
    year = str(pub.get("year") or "nd")
    stop_words = {"a", "an", "and", "as", "for", "in", "of", "on", "the", "to", "with"}
    words = [word for word in normalize_title(pub.get("title")).split() if word not in stop_words]
    stem = f"{family}{year}{words[0] if words else 'work'}"
    key = stem
    suffix = 2
    while key in existing_keys:
        key = f"{stem}{suffix}"
        suffix += 1
    existing_keys.add(key)
    return key

def publication_to_bibtex(pub, existing_keys):
    """Convert a fetched publication to a bibtexparser entry dictionary."""
    entry_type = bibtex_type(pub)
    entry = {
        "ENTRYTYPE": entry_type,
        "ID": citation_key(pub, existing_keys),
        "author": " and ".join(pub.get("authors") or []),
        "title": pub.get("title") or "",
        "year": str(pub.get("year") or ""),
    }
    if pub.get("doi"):
        entry["doi"] = normalize_doi(pub["doi"])
    if pub.get("full_text_url"):
        entry["url"] = pub["full_text_url"]
    if pub.get("publisher"):
        entry["publisher"] = pub["publisher"]
    if pub.get("volume"):
        entry["volume"] = str(pub["volume"])
    if pub.get("number"):
        entry["number"] = str(pub["number"])
    if pub.get("pages"):
        entry["pages"] = str(pub["pages"]).replace("-", "--")
    if pub.get("journal"):
        if entry_type == "article":
            entry["journal"] = pub["journal"]
        elif entry_type in {"inproceedings", "incollection"}:
            entry["booktitle"] = pub["journal"]
    return {key: value for key, value in entry.items() if value != ""}

def parse_selection(value, candidate_count):
    """Parse explicitly reviewed, comma-separated candidate numbers."""
    if not value:
        return []
    if value.lower() == "all":
        raise ValueError("'all' is disabled; select individually validated candidate numbers")
    selected = []
    for item in value.split(","):
        index = int(item.strip()) - 1
        if index < 0 or index >= candidate_count:
            raise ValueError(f"Candidate {index + 1} is outside the range 1-{candidate_count}")
        selected.append(index)
    return list(dict.fromkeys(selected))

def add_candidates(bib_path, bib_database, candidates, selected_indexes):
    """Add selected candidates and serialize with bibtexparser's writer API."""
    existing_keys = {entry["ID"] for entry in bib_database.entries}
    entries = [publication_to_bibtex(candidates[index], existing_keys) for index in selected_indexes]
    bib_database.entries.extend(entries)
    writer = BibTexWriter()
    writer.indent = "  "
    writer.order_entries_by = ("ID",)
    with Path(bib_path).open("w", encoding="utf-8", newline="\n") as bib_file:
        bibtexparser.dump(bib_database, bib_file, writer=writer)
    return entries

def print_candidates(candidates):
    """Present missing ORCID publications as numbered candidates."""
    if not candidates:
        print("No missing ORCID publications found.")
        return
    print(f"\nFound {len(candidates)} candidate publication(s) missing from the BibTeX file:\n")
    for index, pub in enumerate(candidates, 1):
        authors = "; ".join(pub.get("authors") or []) or "Authors unavailable"
        identifier = f"doi:{normalize_doi(pub.get('doi'))}" if pub.get("doi") else "no DOI"
        print(f"[{index}] {pub.get('title') or 'Untitled'}")
        print(f"    {pub.get('year') or 'Unknown year'} | {pub.get('journal') or pub.get('type') or 'Unknown venue'} | {identifier}")
        print(f"    {authors}")

def print_review_candidates(review_candidates):
    """Present records withheld because they may duplicate existing publications."""
    if not review_candidates:
        return
    print(f"\nWithheld {len(review_candidates)} record(s) for manual duplicate review:\n")
    for pub, reason in review_candidates:
        print(f"- {pub.get('title') or 'Untitled'}")
        print(f"  Reason: {reason}")

def main():
    parser = argparse.ArgumentParser(description="Compare ORCID publications with a BibTeX bibliography.")
    parser.add_argument("--orcid", default="0000-0001-5985-691X", help="ORCID ID")
    parser.add_argument("--output", default="data/publications.json", help="Output JSON file path")
    parser.add_argument("--bib", default="data/nuriabib.bib", help="BibTeX file to compare and update")
    parser.add_argument("--add", metavar="IDS", help="Add explicitly reviewed candidate numbers, such as 1,3")
    parser.add_argument("--include-citations", action="store_true", help="Fetch slower OpenCitations counts")
    parser.add_argument("--workers", type=int, default=8, help="Concurrent ORCID requests (default: 8)")
    args = parser.parse_args()

    if args.workers < 1:
        parser.error("--workers must be at least 1")
    pubs = fetch_orcid_publications(
        args.orcid,
        include_citations=args.include_citations,
        workers=args.workers,
    )

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(pubs, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved {len(pubs)} publications to {args.output}")

    bib_database = load_bibliography(args.bib)
    candidates, review_candidates = classify_publications(pubs, bib_database)
    print_candidates(candidates)
    print_review_candidates(review_candidates)

    try:
        selected = parse_selection(args.add, len(candidates))
    except ValueError as error:
        parser.error(str(error))
    if selected:
        added = add_candidates(args.bib, bib_database, candidates, selected)
        print(f"\nAdded {len(added)} publication(s) to {args.bib} using bibtexparser.")
    elif candidates:
        print("\nValidate candidates against possible preprints and alternate venues, then rerun with --add 1,3.")

if __name__ == "__main__":
    main()
