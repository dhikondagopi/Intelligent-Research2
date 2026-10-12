"""
Tests for Research Trend Intelligence and Emerging Topic Detection.

Tests:
- Publication counts by year and month
- Duplicate removal across sources
- Period-over-period growth calculations
- Incomplete current-year handling
- Minimum sample thresholds
- Emerging-topic ranking
- Missing dates and missing citation values
- Insufficient-data responses
- Source outages
- Cache behavior
- API filters and response schemas
- Topic explorer and cross-module connections
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.services.research_trend_service import (
    ResearchTrendService,
    get_research_trend_service,
    clear_trends_cache,
    _extract_year_and_date,
    _extract_citations,
    _extract_topics_and_concepts,
    _extract_sources
)

client = TestClient(app)


# Sample controlled mock historical publications
MOCK_PUBLICATIONS = [
    {
        "id": "openalex:W101",
        "title": "Deep Learning for Quantum Computing",
        "doi": "10.1000/182",
        "publication_year": 2024,
        "publication_date": "2024-03-15",
        "cited_by_count": 45,
        "citation_count": 45,
        "topics": ["Quantum Computing", "Deep Learning"],
        "concepts": ["Computer Science", "Artificial Intelligence"],
        "authors": ["Alice Smith", "Bob Jones"],
        "institutions": ["MIT", "Stanford"],
        "sources": ["OpenAlex"]
    },
    {
        "id": "crossref:doi:10.1000/182",  # Duplicate of W101 by DOI
        "title": "Deep Learning for Quantum Computing",
        "doi": "10.1000/182",
        "publication_year": 2024,
        "publication_date": "2024-03-15",
        "cited_by_count": 45,
        "topics": ["Quantum Computing"],
        "authors": ["Alice Smith"],
        "sources": ["Crossref"]
    },
    {
        "id": "openalex:W102",
        "title": "Fault-Tolerant Quantum Gates",
        "doi": "10.1000/183",
        "publication_year": 2025,
        "publication_date": "2025-06-20",
        "cited_by_count": 12,
        "citation_count": 12,
        "topics": ["Quantum Computing"],
        "concepts": ["Physics"],
        "authors": ["Carol White"],
        "institutions": ["Harvard"],
        "sources": ["OpenAlex"]
    },
    {
        "id": "s2:S103",
        "title": "Quantum Error Mitigation Algorithms",
        "doi": "10.1000/184",
        "publication_year": 2025,
        "publication_date": "2025-08-11",
        "cited_by_count": 8,
        "topics": ["Quantum Computing", "Error Correction"],
        "authors": ["David Green"],
        "institutions": ["Oxford"],
        "sources": ["Semantic Scholar"]
    },
    {
        "id": "openalex:W104",
        "title": "Neural Quantum Chemistry",
        "doi": "10.1000/185",
        "publication_year": 2025,
        "publication_date": "2025-11-05",
        "cited_by_count": 20,
        "topics": ["Quantum Computing", "Neural Chemistry"],
        "authors": ["Alice Smith"],
        "institutions": ["MIT"],
        "sources": ["OpenAlex", "Semantic Scholar"]
    },
    {
        "id": "openalex:W105",
        "title": "Quantum Advantage Benchmark Update",
        "doi": "10.1000/186",
        "publication_year": 2026,  # Incomplete current year
        "publication_date": "2026-02-14",
        "cited_by_count": 1,
        "topics": ["Quantum Computing"],
        "authors": ["Bob Jones"],
        "sources": ["OpenAlex"]
    },
    {
        "id": "openalex:W106",
        "title": "Early Study on Solid State Physics",
        "doi": "10.1000/187",
        "publication_year": 2020,
        "publication_date": None,  # Missing date string, has year
        "cited_by_count": None,    # Missing citation data
        "citation_count": None,
        "topics": ["Physics"],
        "authors": ["Eve Adams"],
        "sources": ["Crossref"]
    }
]


@pytest.fixture(autouse=True)
def reset_cache():
    clear_trends_cache()
    yield
    clear_trends_cache()


# ============================================================
# 1. Extraction & Helper Function Tests
# ============================================================

def test_extract_year_and_date():
    rec1 = {"publication_date": "2024-05-12", "publication_year": 2024}
    y, m, full_d = _extract_year_and_date(rec1)
    assert y == 2024
    assert m == "2024-05"
    assert full_d == "2024-05-12"

    rec2 = {"publication_year": 2019}
    y2, m2, full_d2 = _extract_year_and_date(rec2)
    assert y2 == 2019
    assert m2 is None
    assert full_d2 == "2019"

    rec3 = {"publication_date": "invalid"}
    y3, m3, full_d3 = _extract_year_and_date(rec3)
    assert y3 is None


def test_extract_citations_distinguishes_missing_from_zero():
    # Present zero citations
    rec_zero = {"cited_by_count": 0}
    has_cit, count = _extract_citations(rec_zero)
    assert has_cit is True
    assert count == 0

    # Missing citation metadata
    rec_missing = {"title": "Test Paper"}
    has_cit_m, count_m = _extract_citations(rec_missing)
    assert has_cit_m is False
    assert count_m == 0

    # Present positive citations
    rec_pos = {"citation_count": 42}
    has_cit_p, count_p = _extract_citations(rec_pos)
    assert has_cit_p is True
    assert count_p == 42


def test_extract_topics_and_concepts():
    rec = {
        "topics": ["Quantum Computing", "Deep Learning"],
        "concepts": [{"display_name": "Artificial Intelligence"}, "Computer Science"],
        "keywords": ["qubit", ""]
    }
    topics = _extract_topics_and_concepts(rec)
    assert "Quantum Computing" in topics
    assert "Deep Learning" in topics
    assert "Artificial Intelligence" in topics
    assert "Computer Science" in topics
    assert "qubit" in topics
    assert "" not in topics


# ============================================================
# 2. Duplicate Removal Across Providers
# ============================================================

def test_duplicate_removal_in_trend_analytics():
    service = ResearchTrendService()
    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = list(MOCK_PUBLICATIONS)

        trends = service.get_publication_trends()
        # Original has 7 records, but DOI 10.1000/182 is present twice (OpenAlex & Crossref)
        # Deduplicated total should be 6
        assert trends["meta"]["records_analyzed"] == 6


# ============================================================
# 3. Time Series & Growth Calculations
# ============================================================

def test_publication_counts_by_year_and_growth():
    service = ResearchTrendService()
    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = list(MOCK_PUBLICATIONS)

        trends = service.get_publication_trends()
        timeline = {item["year"]: item for item in trends["timeline"]}

        # 2024 has 1 deduplicated record (W101 merged with crossref)
        assert timeline[2024]["publication_count"] == 1
        # 2025 has 3 records (W102, S103, W104)
        assert timeline[2025]["publication_count"] == 3
        # 2026 has 1 record and is marked partial
        assert timeline[2026]["is_partial_year"] is True
        assert "Year-to-Date" in timeline[2026]["label"]

        # Growth analysis compares complete years: 2025 (3) vs 2024 (1)
        growth = trends["period_growth"]
        assert growth["recent_period"] == "2025"
        assert growth["prior_period"] == "2024"
        assert growth["recent_volume"] == 3
        assert growth["prior_volume"] == 1
        # Baseline is 1 < min_threshold (3), so it explains insufficient baseline rather than false growth
        assert growth["status"] == "INSUFFICIENT_DATA"


def test_growth_calculation_with_sufficient_baseline():
    service = ResearchTrendService()
    # Controlled records with 4 in 2024 and 8 in 2025 (100% growth)
    records = []
    for i in range(4):
        records.append({
            "id": f"y24_{i}",
            "publication_year": 2024,
            "doi": f"10.1000/24_{i}",
            "topics": ["AI"],
            "cited_by_count": 5
        })
    for i in range(8):
        records.append({
            "id": f"y25_{i}",
            "publication_year": 2025,
            "doi": f"10.1000/25_{i}",
            "topics": ["AI"],
            "cited_by_count": 10
        })

    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = records

        trends = service.get_publication_trends()
        growth = trends["period_growth"]
        assert growth["is_statistically_sufficient"] is True
        assert growth["growth_rate_pct"] == 100.0
        assert growth["status"] == "GROWING"
        assert "increased by 100.0%" in growth["explanation"]


# ============================================================
# 4. Emerging Topic Detection & Minimum Thresholds
# ============================================================

def test_emerging_topic_detection_ranking():
    service = ResearchTrendService()
    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = list(MOCK_PUBLICATIONS)

        emerging = service.get_emerging_topics(min_volume=2)
        topics = emerging["emerging_topics"]

        # Quantum Computing has 1 in 2024 and 3 in 2025 (+200% growth)
        qc_topic = next((t for t in topics if t["topic"] == "Quantum Computing"), None)
        assert qc_topic is not None
        assert qc_topic["classification"] == "EMERGING"
        assert qc_topic["growth_rate_pct"] == 200.0
        assert qc_topic["recent_period_volume"] == 3
        assert qc_topic["prior_period_volume"] == 1
        assert "Demonstrated 200.0% growth" in qc_topic["evidence_rationale"]

        # Methodology documentation is present
        assert "formula" in emerging["methodology"]
        assert "ranking_formula" in emerging["methodology"]
        assert "thresholds" in emerging["methodology"]


def test_emerging_topic_insufficient_data():
    service = ResearchTrendService()
    # Topic with only 1 publication total
    single_record = [{
        "id": "single_1",
        "title": "Obscure Topic Study",
        "publication_year": 2025,
        "topics": ["Obscure Topic"],
        "cited_by_count": 0
    }]

    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = single_record

        emerging = service.get_emerging_topics(min_volume=3)
        # Should not be classified as emerging because total < min_volume (3)
        assert len(emerging["emerging_topics"]) == 0
        assert emerging["insufficient_data_topics_count"] >= 1


# ============================================================
# 5. Research Hotspots Identification
# ============================================================

def test_research_hotspots():
    service = ResearchTrendService()
    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = list(MOCK_PUBLICATIONS)

        hotspots = service.get_research_hotspots()
        assert len(hotspots["hotspots"]) > 0

        # Quantum Computing is the top hotspot
        top_hotspot = hotspots["hotspots"][0]
        assert top_hotspot["topic"] == "Quantum Computing"
        assert top_hotspot["publication_volume"] >= 4
        assert len(top_hotspot["leading_organizations"]) > 0
        assert len(top_hotspot["leading_researchers"]) > 0
        assert "OpenAlex" in top_hotspot["sources_used"]


# ============================================================
# 6. Topic Deep-Dive Analytics & Cross-Module Connections
# ============================================================

def test_topic_analysis_with_cross_module_connections():
    service = ResearchTrendService()
    with patch("app.services.research_trend_service.research_collection") as mock_res_coll, \
         patch("app.services.research_trend_service.patents_collection") as mock_pat_coll, \
         patch("app.services.research_trend_service.funding_collection") as mock_fund_coll:

        mock_res_coll.find.return_value.limit.return_value = list(MOCK_PUBLICATIONS)

        mock_pat_coll.find.return_value.limit.return_value = [
            {
                "patent_number": "US11223344",
                "patent_title": "Quantum Gate Device",
                "assignee": "IBM Corp",
                "technology_field": "Quantum Computing",
                "grant_year": 2025
            }
        ]

        mock_fund_coll.find.return_value.limit.return_value = [
            {
                "project_number": "NSF-2025-01",
                "title": "Quantum Error Mitigated Architecture",
                "award_amount": 500000,
                "fiscal_year": 2025
            }
        ]

        analysis = service.get_topic_analysis("Quantum Computing")
        assert analysis["found"] is True
        assert analysis["topic"] == "Quantum Computing"
        assert len(analysis["supporting_publications"]) > 0
        assert len(analysis["related_topics"]) > 0

        # Cross-module links
        cross = analysis["cross_module_connections"]
        assert cross["patents_count"] == 1
        assert cross["patents"][0]["patent_number"] == "US11223344"
        assert cross["funding_count"] == 1
        assert cross["funding"][0]["project_number"] == "NSF-2025-01"


# ============================================================
# 7. Cache Behavior
# ============================================================

def test_trends_cache_behavior():
    service = ResearchTrendService()
    with patch("app.services.research_trend_service.research_collection") as mock_coll:
        mock_coll.find.return_value.limit.return_value = list(MOCK_PUBLICATIONS)

        res1 = service.get_publication_trends(topic="Quantum Computing")
        # Second call should return cached object without hitting mongo find again
        mock_coll.find.reset_mock()
        res2 = service.get_publication_trends(topic="Quantum Computing")

        assert res1["timeline"] == res2["timeline"]
        mock_coll.find.assert_not_called()


# ============================================================
# 8. API Endpoints Integration Tests
# ============================================================

def test_api_trends_endpoint():
    response = client.get("/api/research/trends")
    assert response.status_code == 200
    data = response.json()
    assert "timeline" in data
    assert "period_growth" in data
    assert "citation_metrics" in data
    assert "meta" in data


def test_api_trends_emerging_endpoint():
    response = client.get("/api/research/trends/emerging?min_volume=2&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "emerging_topics" in data
    assert "methodology" in data
    assert "analysis_window" in data


def test_api_trends_hotspots_endpoint():
    response = client.get("/api/research/trends/hotspots?limit=6")
    assert response.status_code == 200
    data = response.json()
    assert "hotspots" in data
    assert "total_topics_analyzed" in data


def test_api_trends_topic_detail_endpoint():
    # Use topic existing in database
    response = client.get("/api/research/trends/topics/Artificial intelligence")
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert "timeline" in data
    assert "supporting_publications" in data
    assert "cross_module_connections" in data


def test_api_trends_topic_not_found():
    response = client.get("/api/research/trends/topics/NonexistentTopicXYZ987654321")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
