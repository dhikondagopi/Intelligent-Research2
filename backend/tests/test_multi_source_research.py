import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.openalex_service import (
    normalize_doi,
    reconstruct_openalex_abstract,
    normalize_openalex_work,
    search_openalex_normalized
)
from app.services.crossref_service import (
    clean_crossref_abstract,
    extract_crossref_date,
    normalize_crossref_work,
    search_crossref_normalized
)
from app.services.semantic_scholar_service import (
    normalize_semantic_scholar_work,
    search_semantic_scholar_normalized
)
from app.services.research_aggregator_service import (
    normalize_title_for_matching,
    are_records_duplicates,
    merge_two_records,
    deduplicate_records,
    aggregate_research
)
from app.core.security import create_access_token


client = TestClient(app)


# ============================================================
# 1. OpenAlex Adapter & Normalization Tests
# ============================================================

def test_normalize_doi():
    assert normalize_doi("https://doi.org/10.1038/s41586-020-2649-2") == "10.1038/s41586-020-2649-2"
    assert normalize_doi("http://dx.doi.org/10.1109/5.771073") == "10.1109/5.771073"
    assert normalize_doi("doi:10.1145/12345") == "10.1145/12345"
    assert normalize_doi("10.1016/j.cell.2021.01.001") == "10.1016/j.cell.2021.01.001"
    assert normalize_doi(None) is None


def test_reconstruct_openalex_abstract():
    inverted_index = {
        "This": [0],
        "is": [1],
        "a": [2],
        "breakthrough": [3],
        "paper.": [4]
    }
    abstract = reconstruct_openalex_abstract(inverted_index)
    assert abstract == "This is a breakthrough paper."


def test_openalex_normalization():
    mock_work = {
        "id": "https://openalex.org/W12345678",
        "doi": "https://doi.org/10.1145/3318464.3389700",
        "title": "Quantum Supremacy Using a Programmable Superconducting Processor",
        "publication_year": 2020,
        "publication_date": "2020-03-15",
        "cited_by_count": 842,
        "referenced_works_count": 45,
        "abstract_inverted_index": {"Quantum": [0], "computing": [1], "advancement": [2]},
        "authorships": [
            {
                "author": {"display_name": "John Martinis", "orcid": "0000-0002-1234-5678"},
                "institutions": [{"display_name": "Google Quantum AI", "ror": "https://ror.org/0123"}]
            }
        ],
        "concepts": [{"display_name": "Quantum computing"}],
        "topics": [{"display_name": "Superconducting Qubits"}],
        "primary_location": {
            "source": {"display_name": "Nature", "host_organization_name": "Springer Nature"}
        },
        "open_access": {"is_oa": True}
    }

    record = normalize_openalex_work(mock_work)

    assert record["source"] == "OpenAlex"
    assert "OpenAlex" in record["sources"]
    assert record["doi"] == "10.1145/3318464.3389700"
    assert record["title"] == "Quantum Supremacy Using a Programmable Superconducting Processor"
    assert record["year"] == 2020
    assert record["citation_count"] == 842
    assert "John Martinis" in record["authors"]
    assert "Google Quantum AI" in record["institutions"]
    assert "Quantum computing" in record["concepts"]
    assert record["abstract"] == "Quantum computing advancement"
    assert record["venue"] == "Nature"
    assert record["publisher"] == "Springer Nature"
    assert record["open_access"] is True


@pytest.mark.anyio
async def test_openalex_adapter_mocked():
    fake_api_response = {
        "results": [
            {
                "id": "https://openalex.org/W999",
                "doi": "https://doi.org/10.1000/182",
                "title": "Semiconductor Advances in 2nm Nodes",
                "publication_year": 2024,
                "cited_by_count": 12,
                "authorships": []
            }
        ]
    }
    with patch("app.services.openalex_service.search_openalex", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = fake_api_response
        results = await search_openalex_normalized("semiconductor")
        assert len(results) == 1
        assert results[0]["title"] == "Semiconductor Advances in 2nm Nodes"
        assert results[0]["doi"] == "10.1000/182"


# ============================================================
# 2. Crossref Adapter & Normalization Tests
# ============================================================

def test_clean_crossref_abstract():
    raw_xml = "<jats:p>This study demonstrates <jats:bold>nanoscale</jats:bold> efficiency &amp; power.</jats:p>"
    cleaned = clean_crossref_abstract(raw_xml)
    assert cleaned == "This study demonstrates nanoscale efficiency & power."


def test_extract_crossref_date():
    item = {
        "published-print": {
            "date-parts": [[2023, 11, 4]]
        }
    }
    year, date_str = extract_crossref_date(item)
    assert year == 2023
    assert date_str == "2023-11-04"


def test_crossref_normalization():
    mock_item = {
        "DOI": "10.1145/3318464.3389700",
        "title": ["Quantum Supremacy Using a Programmable Superconducting Processor"],
        "author": [
            {
                "given": "John",
                "family": "Martinis",
                "ORCID": "https://orcid.org/0000-0002-1234-5678",
                "affiliation": [{"name": "Google Quantum AI"}]
            }
        ],
        "container-title": ["Nature"],
        "publisher": "Springer Nature",
        "is-referenced-by-count": 890,
        "references-count": 48,
        "published-online": {"date-parts": [[2020, 3, 15]]},
        "subject": ["Physics", "Quantum Computing"],
        "abstract": "<jats:p>Quantum computing breakthrough demonstration.</jats:p>",
        "URL": "https://doi.org/10.1145/3318464.3389700",
        "funder": [{"name": "National Science Foundation"}]
    }

    record = normalize_crossref_work(mock_item)

    assert record["source"] == "Crossref"
    assert "Crossref" in record["sources"]
    assert record["doi"] == "10.1145/3318464.3389700"
    assert record["title"] == "Quantum Supremacy Using a Programmable Superconducting Processor"
    assert record["year"] == 2020
    assert record["citation_count"] == 890
    assert "John Martinis" in record["authors"]
    assert "Google Quantum AI" in record["institutions"]
    assert "0000-0002-1234-5678" in record["orcid_ids"]
    assert "National Science Foundation" in record["funders"]
    assert record["abstract"] == "Quantum computing breakthrough demonstration."


@pytest.mark.anyio
async def test_crossref_adapter_mocked():
    fake_api_response = {
        "message": {
            "items": [
                {
                    "DOI": "10.1000/182",
                    "title": ["Semiconductor Advances in 2nm Nodes"],
                    "author": [{"given": "Alice", "family": "Smith"}],
                    "is-referenced-by-count": 15
                }
            ]
        }
    }
    with patch("app.services.crossref_service.search_crossref", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = fake_api_response
        results = await search_crossref_normalized("semiconductor")
        assert len(results) == 1
        assert results[0]["title"] == "Semiconductor Advances in 2nm Nodes"
        assert "Alice Smith" in results[0]["authors"]


# ============================================================
# 3. Semantic Scholar Adapter & Normalization Tests
# ============================================================

def test_semantic_scholar_normalization():
    mock_item = {
        "paperId": "64943797437849",
        "title": "Quantum Supremacy Using a Programmable Superconducting Processor",
        "abstract": "We report the use of a processor with programmable superconducting qubits.",
        "authors": [{"authorId": "123", "name": "John Martinis"}],
        "year": 2020,
        "publicationDate": "2020-03-15",
        "venue": "Nature",
        "citationCount": 915,
        "referenceCount": 50,
        "isOpenAccess": True,
        "fieldsOfStudy": ["Physics", "Computer Science"],
        "externalIds": {"DOI": "10.1145/3318464.3389700"},
        "url": "https://www.semanticscholar.org/paper/64943797437849"
    }

    record = normalize_semantic_scholar_work(mock_item)

    assert record["source"] == "Semantic Scholar"
    assert "Semantic Scholar" in record["sources"]
    assert record["doi"] == "10.1145/3318464.3389700"
    assert record["title"] == "Quantum Supremacy Using a Programmable Superconducting Processor"
    assert record["citation_count"] == 915
    assert "John Martinis" in record["authors"]
    assert record["open_access"] is True
    assert "Computer Science" in record["topics"]


@pytest.mark.anyio
async def test_semantic_scholar_adapter_mocked():
    fake_api_response = {
        "data": [
            {
                "paperId": "abc12345",
                "title": "Semiconductor Advances in 2nm Nodes",
                "year": 2024,
                "citationCount": 20,
                "externalIds": {"DOI": "10.1000/182"}
            }
        ]
    }
    with patch("app.services.semantic_scholar_service.search_semantic_scholar", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = fake_api_response
        results = await search_semantic_scholar_normalized("semiconductor")
        assert len(results) == 1
        assert results[0]["title"] == "Semiconductor Advances in 2nm Nodes"
        assert results[0]["citation_count"] == 20


# ============================================================
# 4. Deduplication & Merging Tests
# ============================================================

def test_doi_deduplication():
    record_openalex = {
        "id": "openalex:W1",
        "source": "OpenAlex",
        "sources": ["OpenAlex"],
        "source_id": {"openalex": "W1"},
        "doi": "10.1038/s41586-020-2649-2",
        "title": "The Future of AI",
        "abstract": "Short abstract",
        "authors": ["Alice Smith"],
        "citation_count": 50,
        "year": 2021,
        "source_urls": {"OpenAlex": "https://openalex.org/W1"}
    }
    record_crossref = {
        "id": "crossref:10.1038/s41586-020-2649-2",
        "source": "Crossref",
        "sources": ["Crossref"],
        "source_id": {"crossref": "10.1038/s41586-020-2649-2"},
        "doi": "10.1038/s41586-020-2649-2",
        "title": "The Future of AI",
        "abstract": "Longer and richer abstract from publisher.",
        "authors": ["Alice Smith", "Bob Jones"],
        "citation_count": 65,
        "year": 2021,
        "source_urls": {"Crossref": "https://doi.org/10.1038/s41586-020-2649-2"}
    }
    record_s2 = {
        "id": "s2:99999",
        "source": "Semantic Scholar",
        "sources": ["Semantic Scholar"],
        "source_id": {"semantic_scholar": "99999"},
        "doi": "10.1038/s41586-020-2649-2",
        "title": "The Future of AI",
        "abstract": "Medium abstract",
        "authors": ["Alice Smith"],
        "citation_count": 72,
        "year": 2021,
        "source_urls": {"Semantic Scholar": "https://semanticscholar.org/paper/99999"}
    }

    merged = deduplicate_records([record_openalex, record_crossref, record_s2])

    assert len(merged) == 1
    unified = merged[0]
    assert set(unified["sources"]) == {"OpenAlex", "Crossref", "Semantic Scholar"}
    assert unified["citation_count"] == 72
    assert "Bob Jones" in unified["authors"]
    assert "Longer and richer abstract" in unified["abstract"]
    assert len(unified["source_urls"]) == 3


def test_title_fallback_deduplication():
    # Two records without DOI but matching title and author
    rec1 = {
        "id": "openalex:W55",
        "source": "OpenAlex",
        "sources": ["OpenAlex"],
        "doi": None,
        "title": "Deep Reinforcement Learning in Heterogeneous Networks!",
        "authors": ["John Doe", "Carol White"],
        "year": 2022,
        "citation_count": 10
    }
    rec2 = {
        "id": "s2:paper88",
        "source": "Semantic Scholar",
        "sources": ["Semantic Scholar"],
        "doi": None,
        "title": "deep reinforcement learning in heterogeneous networks",
        "authors": ["John Doe"],
        "year": 2022,
        "citation_count": 18
    }

    merged = deduplicate_records([rec1, rec2])
    assert len(merged) == 1
    assert set(merged[0]["sources"]) == {"OpenAlex", "Semantic Scholar"}
    assert merged[0]["citation_count"] == 18


# ============================================================
# 5. Provider Failure & Graceful Degradation Tests
# ============================================================

@pytest.mark.anyio
async def test_partial_provider_failure_handling():
    # Simulate Crossref failing while OpenAlex and Semantic Scholar succeed
    fake_openalex = [
        {
            "id": "openalex:W1",
            "source": "OpenAlex",
            "sources": ["OpenAlex"],
            "title": "Advances in Microelectronics",
            "doi": "10.1109/test.1",
            "citation_count": 40
        }
    ]
    fake_s2 = [
        {
            "id": "s2:S1",
            "source": "Semantic Scholar",
            "sources": ["Semantic Scholar"],
            "title": "Advances in Microelectronics",
            "doi": "10.1109/test.1",
            "citation_count": 45
        }
    ]

    with patch("app.services.research_aggregator_service.search_openalex_normalized", new_callable=AsyncMock) as m_oa, \
         patch("app.services.research_aggregator_service.search_crossref_normalized", new_callable=AsyncMock) as m_cr, \
         patch("app.services.research_aggregator_service.search_semantic_scholar_normalized", new_callable=AsyncMock) as m_s2, \
         patch("app.services.research_aggregator_service.cache_records_in_mongo") as m_cache:

        m_oa.return_value = fake_openalex
        m_cr.side_effect = Exception("Crossref 504 Gateway Timeout")
        m_s2.return_value = fake_s2

        data = await aggregate_research("microelectronics")

        assert data["meta"]["source_status"]["OpenAlex"] == "LIVE"
        assert data["meta"]["source_status"]["Semantic Scholar"] == "LIVE"
        assert data["meta"]["source_status"]["Crossref"] == "UNAVAILABLE"
        assert "Crossref temporarily unavailable" in data["meta"]["errors"]["Crossref"]
        # Results should still be returned from working providers and deduplicated
        assert len(data["results"]) == 1
        assert "OpenAlex" in data["results"][0]["sources"]
        assert "Semantic Scholar" in data["results"][0]["sources"]


# ============================================================
# 6. MongoDB Caching Fallback Test
# ============================================================

@pytest.mark.anyio
async def test_mongodb_cache_fallback_when_all_fail():
    cached_docs = [
        {
            "_id": "dummy_mongo_id",
            "id": "cached:1",
            "title": "Lithography for Semiconductor Devices",
            "sources": ["Cached"],
            "citation_count": 35
        }
    ]

    with patch("app.services.research_aggregator_service.search_openalex_normalized", new_callable=AsyncMock) as m_oa, \
         patch("app.services.research_aggregator_service.search_crossref_normalized", new_callable=AsyncMock) as m_cr, \
         patch("app.services.research_aggregator_service.search_semantic_scholar_normalized", new_callable=AsyncMock) as m_s2, \
         patch("app.services.research_aggregator_service.get_cached_records") as m_get_cache:

        m_oa.side_effect = Exception("Network down")
        m_cr.side_effect = Exception("Network down")
        m_s2.side_effect = Exception("Network down")
        m_get_cache.return_value = cached_docs

        data = await aggregate_research("lithography")

        assert len(data["results"]) == 1
        assert data["meta"]["source_status"]["OpenAlex"] == "CACHED"
        assert data["results"][0]["title"] == "Lithography for Semiconductor Devices"


# ============================================================
# 7. Global Search Endpoint Tests
# ============================================================

def test_global_search_api_structure():
    mock_agg = {
        "query": "semiconductor",
        "total": 1,
        "page": 1,
        "per_page": 15,
        "results": [
            {
                "id": "doi:10.1109/test",
                "title": "Semiconductor Novel Architectures",
                "sources": ["OpenAlex", "Crossref"],
                "citation_count": 28
            }
        ],
        "meta": {
            "sources": ["OpenAlex", "Crossref"],
            "source_status": {"OpenAlex": "LIVE", "Crossref": "LIVE", "Semantic Scholar": "UNAVAILABLE"},
            "counts": {"OpenAlex": 1, "Crossref": 1, "Semantic Scholar": 0, "total_merged": 1},
            "retrieved_at": "2026-10-08T00:00:00Z",
            "errors": {}
        }
    }

    with patch("app.routes.search.aggregate_research", new_callable=AsyncMock) as m_agg, \
         patch("app.routes.search.search_patents_with_fallback") as m_pat, \
         patch("app.routes.search.search_funding", new_callable=AsyncMock) as m_fun:

        m_agg.return_value = mock_agg
        m_pat.return_value = {"patents": [{"patent_number": "US101010", "title": "Semiconductor Chip"}], "total": 1}
        m_fun.return_value = {"projects": []}

        response = client.get("/api/search?q=semiconductor")

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "semiconductor"
        assert "research" in data
        assert "patents" in data
        assert "funding" in data
        assert "technologies" in data
        assert "organizations" in data
        assert "researchers" in data
        assert "meta" in data
        assert "counts" in data["meta"]
        assert "source_status" in data["meta"]


def test_global_search_with_auth_token():
    # Valid token should be accepted and user extracted
    valid_token = create_access_token({"user_id": "60d5ec49f1b2c8b1f8e4e1a1", "role": "researcher"})
    headers = {"Authorization": f"Bearer {valid_token}"}

    with patch("app.routes.search.aggregate_research", new_callable=AsyncMock) as m_agg:
        m_agg.return_value = {"results": [], "meta": {}}
        response = client.get("/api/search?q=quantum", headers=headers)
        assert response.status_code == 200
