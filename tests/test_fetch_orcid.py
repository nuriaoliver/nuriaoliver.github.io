from pathlib import Path

import bibtexparser

from fetch_orcid import (
    add_candidates,
    classify_publications,
    load_bibliography,
    normalize_doi,
    parse_selection,
)


ROOT = Path(__file__).resolve().parents[1]
BIB_PATH = ROOT / "data" / "nuriabib.bib"


def test_normalize_doi_removes_url_prefix():
    assert normalize_doi("https://doi.org/10.1000/Example") == "10.1000/example"


def test_preprint_of_published_article_is_withheld():
    preprint = {
        "title": "Between Help and Harm: An Evaluation of Mental Health Crisis Handling by LLMs",
        "doi": "10.48550/arXiv.2509.24857",
        "authors": ["Adrian Arnaiz-Rodriguez", "Marina Baidal", "Erik Derner", "Nuria Oliver"],
        "year": 2025,
        "sort_date": "2025-09-29",
    }

    safe, review = classify_publications([preprint], load_bibliography(BIB_PATH))

    assert safe == []
    assert len(review) == 1
    assert "possible duplicate of arnaiz2026mental" in review[0][1]


def test_published_chapter_with_extended_preprint_title_is_withheld():
    published = {
        "title": "Racial Bias in the Beautyverse: Evaluation of Augmented-Reality Beauty Filters",
        "doi": "10.1007/978-3-031-25066-8_43",
        "authors": ["Piera Riccio", "Nuria Oliver"],
        "year": 2023,
        "crossref_type": "book-chapter",
    }

    safe, review = classify_publications([published], load_bibliography(BIB_PATH))

    assert safe == []
    assert len(review) == 1
    assert "possible duplicate of riccio2022racial" in review[0][1]


def test_doi_less_record_is_withheld():
    publication = {
        "title": "A New and Otherwise Unique Work",
        "authors": ["Example Author", "Nuria Oliver"],
        "year": 2026,
    }

    safe, review = classify_publications([publication], load_bibliography(BIB_PATH))

    assert safe == []
    assert review[0][1].startswith("no DOI")


def test_repository_doi_is_withheld_even_for_conference_paper():
    publication = {
        "title": "A Distinct Conference Paper",
        "authors": ["Example Author", "Nuria Oliver"],
        "year": 2026,
        "doi": "10.5281/zenodo.1234567",
        "type": "conference-paper",
    }

    safe, review = classify_publications([publication], load_bibliography(BIB_PATH))

    assert safe == []
    assert "repository or preprint DOI" in review[0][1]


def test_record_without_explicit_nuria_authorship_is_withheld():
    publication = {
        "title": "A Distinct Journal Article",
        "authors": ["Example Author"],
        "year": 2026,
        "doi": "10.1000/distinct-authorship",
        "crossref_type": "journal-article",
    }

    safe, review = classify_publications([publication], load_bibliography(BIB_PATH))

    assert safe == []
    assert "not explicitly present" in review[0][1]


def test_bulk_add_is_disabled():
    try:
        parse_selection("all", 3)
    except ValueError as error:
        assert "individually validated" in str(error)
    else:
        raise AssertionError("Bulk addition must remain disabled")


def test_bibtex_api_round_trip_preserves_patents(tmp_path):
    source = tmp_path / "publications.bib"
    source.write_text(
        "@patent{existing,\n  author = {Nuria Oliver},\n  title = {Existing Patent},\n  year = {2020}\n}\n",
        encoding="utf-8",
    )
    database = load_bibliography(source)
    candidate = {
        "title": "Distinct Published Article",
        "authors": ["Example Author", "Nuria Oliver"],
        "year": 2026,
        "doi": "10.1000/distinct",
        "crossref_type": "journal-article",
        "journal": "Example Journal",
    }

    add_candidates(source, database, [candidate], [0])

    parser = bibtexparser.bparser.BibTexParser(ignore_nonstandard_types=False)
    reparsed = bibtexparser.loads(source.read_text(encoding="utf-8"), parser=parser)
    assert {entry["ENTRYTYPE"] for entry in reparsed.entries} == {"patent", "article"}
    assert {entry["ID"] for entry in reparsed.entries} == {"existing", "author2026distinct"}