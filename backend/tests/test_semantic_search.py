import pytest
import numpy as np
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.semantic_search_service import (
    SemanticSearchService,
    get_semantic_service,
    MODEL_NAME,
    EMBEDDING_DIM
)

client = TestClient(app)


# ============================================================
# 1. Text Representation & Normalization Tests
# ============================================================

def test_build_searchable_text():
    record = {
        "title": "Deep Learning for IoT Intrusion Detection",
        "abstract": "We present an anomaly detection framework for edge connected devices.",
        "topics": ["Cybersecurity", "Internet of Things"],
        "keywords": ["Intrusion Detection", "Neural Networks"],
        "venue": "IEEE Transactions on Information Forensics and Security"
    }
    text = SemanticSearchService.build_searchable_text(record)
    assert "Deep Learning for IoT Intrusion Detection" in text
    assert "anomaly detection framework" in text
    assert "Cybersecurity" in text
    assert "IEEE Transactions" in text


def test_build_searchable_text_fallback_title():
    record = {"title": "Quantum Error Correction", "abstract": None}
    text = SemanticSearchService.build_searchable_text(record)
    assert text == "Title: Quantum Error Correction"


def test_build_searchable_text_empty():
    record = {}
    text = SemanticSearchService.build_searchable_text(record)
    assert text == "Untitled publication"


# ============================================================
# 2. Embedding Generation & Vector Normalization Tests
# ============================================================

def test_vector_normalization():
    service = SemanticSearchService()
    mock_model = MagicMock()
    # Mock model encode returning non-normalized vector [3.0, 4.0, 0.0, ...]
    fake_vec = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    fake_vec[0] = 3.0
    fake_vec[1] = 4.0
    mock_model.encode.return_value = fake_vec
    service.model = mock_model

    normalized_vec = service.encode_text("test query")
    norm = np.linalg.norm(normalized_vec)
    assert pytest.approx(norm, 0.0001) == 1.0
    assert pytest.approx(normalized_vec[0], 0.0001) == 0.6
    assert pytest.approx(normalized_vec[1], 0.0001) == 0.8


# ============================================================
# 3. Empty Query & Empty Index Handling Tests
# ============================================================

def test_empty_query_returns_empty():
    service = SemanticSearchService()
    service.is_available = True
    assert service.search("") == []
    assert service.search("   ") == []


def test_empty_index_returns_empty():
    service = SemanticSearchService()
    service.is_available = True
    service._create_empty_index()
    assert service.search("AI security") == []


# ============================================================
# 4. Vector Search & ID Mapping Tests
# ============================================================

def test_vector_search_and_id_mapping():
    service = SemanticSearchService()
    service.is_available = True
    service._create_empty_index()

    # Create dummy embeddings
    v1 = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    v1[0] = 1.0
    v2 = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    v2[1] = 1.0

    service.index.add(np.stack([v1, v2]))
    service.id_to_record_id = {0: "doc:iot_security", 1: "doc:quantum_computing"}
    service.record_id_to_id = {"doc:iot_security": 0, "doc:quantum_computing": 1}

    # Query vector close to v1
    q_vec = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    q_vec[0] = 0.95
    q_vec[1] = 0.05
    q_vec = q_vec / np.linalg.norm(q_vec)

    mock_model = MagicMock()
    mock_model.encode.return_value = q_vec
    service.model = mock_model

    with patch("app.services.semantic_search_service.research_collection.find") as mock_find:
        mock_find.return_value = [
            {"_id": "dummy1", "id": "doc:iot_security", "title": "IoT Security Methods"},
            {"_id": "dummy2", "id": "doc:quantum_computing", "title": "Quantum Algorithms"}
        ]
        results = service.search("network defense", top_k=2, threshold=0.1)

        assert len(results) >= 1
        # First match should be doc:iot_security due to higher inner product
        assert results[0]["id"] == "doc:iot_security"
        assert "similarity" in results[0]
        assert results[0]["similarity"] > 0.8


# ============================================================
# 5. Related Research Excludes Target Work Test
# ============================================================

def test_related_research_excludes_current_work():
    service = SemanticSearchService()
    service.is_available = True

    target_id = "doc:paper_alpha"
    target_doc = {
        "_id": "id_alpha",
        "id": target_id,
        "title": "Original Paper Alpha",
        "abstract": "Core publication on neural network architectures."
    }

    related_doc_beta = {
        "_id": "id_beta",
        "id": "doc:paper_beta",
        "title": "Related Paper Beta",
        "similarity": 0.89
    }

    with patch("app.services.semantic_search_service.research_collection.find_one", return_value=target_doc), \
         patch.object(service, "search") as mock_search:

        # Search returns both target paper itself and a related paper
        mock_search.return_value = [
            {"_id": "id_alpha", "id": target_id, "similarity": 1.0},
            related_doc_beta
        ]

        related = service.get_related_research(work_id=target_id, top_k=5)

        # Target paper Alpha must be filtered out!
        assert len(related) == 1
        assert related[0]["id"] == "doc:paper_beta"
        assert related[0]["similarity"] == 0.89


# ============================================================
# 6. Fallback When Model/Index Unavailable Test
# ============================================================

def test_unavailable_model_graceful_handling():
    service = SemanticSearchService()
    service.is_available = False
    assert service.search("cybersecurity") == []
    assert service.get_related_research("any_id") == []


# ============================================================
# 7. Semantic Search API Endpoint Tests
# ============================================================

def test_semantic_search_api_endpoint():
    mock_results = [
        {
            "id": "doi:10.1109/test.1",
            "title": "AI Methods for IoT Attack Detection",
            "similarity": 0.88,
            "sources": ["OpenAlex", "Crossref"],
            "year": 2024
        }
    ]

    with patch("app.routes.search.get_semantic_service") as mock_get_svc:
        mock_svc = MagicMock()
        mock_svc.is_available = True
        mock_svc.search.return_value = mock_results
        mock_get_svc.return_value = mock_svc

        response = client.get("/api/search/semantic?q=AI%20IoT%20attacks")

        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "semantic"
        assert len(data["results"]) == 1
        assert data["results"][0]["title"] == "AI Methods for IoT Attack Detection"
        assert data["results"][0]["similarity"] == 0.88
        assert data["meta"]["model"] == "all-MiniLM-L6-v2"


def test_semantic_search_fallback_on_unavailable():
    with patch("app.routes.search.get_semantic_service") as mock_get_svc, \
         patch("app.routes.search.aggregate_research", new_callable=AsyncMock) as mock_agg:

        mock_svc = MagicMock()
        mock_svc.is_available = False
        mock_get_svc.return_value = mock_svc

        mock_agg.return_value = {
            "results": [{"id": "fallback:1", "title": "Keyword Fallback Title"}],
            "meta": {}
        }

        response = client.get("/api/search/semantic?q=threat%20defense")

        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "fallback_keyword"
        assert "temporarily unavailable" in data["meta"]["notice"]
        assert len(data["results"]) == 1


# ============================================================
# 8. Related Research API Endpoint Tests
# ============================================================

def test_related_research_endpoints():
    mock_related = [
        {
            "id": "doi:10.1145/related1",
            "title": "Conceptually Related Publication",
            "similarity": 0.82,
            "sources": ["Semantic Scholar"]
        }
    ]

    with patch("app.routes.research.get_semantic_service") as mock_get_svc:
        mock_svc = MagicMock()
        mock_svc.get_related_research.return_value = mock_related
        mock_get_svc.return_value = mock_svc

        # 1. Test via query param /api/research/related?work_id=...
        resp1 = client.get("/api/research/related?work_id=doi:10.1145/test")
        assert resp1.status_code == 200
        assert resp1.json()["count"] == 1
        assert resp1.json()["results"][0]["title"] == "Conceptually Related Publication"

        # 2. Test via path suffix /api/research/{work_id}/related
        resp2 = client.get("/api/research/doi:10.1145/test/related")
        assert resp2.status_code == 200
        assert resp2.json()["count"] == 1


# ============================================================
# 9. Global Search Hybrid Mode Tests
# ============================================================

def test_global_search_hybrid_mode():
    mock_agg = {
        "results": [
            {"id": "paper:1", "title": "IoT Security Systems", "citation_count": 50}
        ],
        "meta": {"sources": ["OpenAlex"], "source_status": {}}
    }
    mock_sem = [
        {"id": "paper:1", "title": "IoT Security Systems", "similarity": 0.91},
        {"id": "paper:2", "title": "Anomaly Detection at Edge", "similarity": 0.85}
    ]

    with patch("app.routes.search.aggregate_research", new_callable=AsyncMock) as m_agg, \
         patch("app.routes.search.get_semantic_service") as m_get_svc:

        m_agg.return_value = mock_agg
        mock_svc = MagicMock()
        mock_svc.is_available = True
        mock_svc.search.return_value = mock_sem
        m_get_svc.return_value = mock_svc

        response = client.get("/api/search?q=IoT%20security&mode=all")
        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "all"
        assert len(data["research"]) == 2
        # paper:1 should have similarity attached
        assert data["research"][0]["id"] == "paper:1"
        assert data["research"][0]["similarity"] == 0.91


# ============================================================
# 10. Multi-Domain Ranking Quality & Score Order Tests
# ============================================================

def test_semantic_search_ranking_order_and_multi_domain():
    service = SemanticSearchService()
    service.is_available = True
    service._create_empty_index()

    # Create distinct vectors for 4 different domains:
    # Dimension 0: IoT / Cybersecurity
    # Dimension 1: Semiconductor Manufacturing
    # Dimension 2: Quantum Computing
    # Dimension 3: Genomics / Oncology
    domain_records = [
        {"id": "doc:iot:high", "title": "Advanced Threat Detection in IoT", "topics": ["IoT", "Security"]},
        {"id": "doc:iot:med", "title": "Overview of Connected Sensor Networks", "topics": ["IoT"]},
        {"id": "doc:semi:1", "title": "Silicon Wafer Fabrication Techniques", "topics": ["Semiconductor"]},
        {"id": "doc:quantum:1", "title": "Fault-Tolerant Quantum Algorithms", "topics": ["Quantum"]},
        {"id": "doc:cancer:1", "title": "CRISPR Targeted Oncology Therapy", "topics": ["Genomics"]}
    ]

    # Mock embeddings corresponding to domain dimensions
    embeddings_map = {
        "doc:iot:high": [1.0, 0.0, 0.0, 0.0],
        "doc:iot:med": [0.6, 0.8, 0.0, 0.0],
        "doc:semi:1": [0.0, 1.0, 0.0, 0.0],
        "doc:quantum:1": [0.0, 0.0, 1.0, 0.0],
        "doc:cancer:1": [0.0, 0.0, 0.0, 1.0],
    }

    raw_mat = np.zeros((len(domain_records), EMBEDDING_DIM), dtype=np.float32)
    for idx, r in enumerate(domain_records):
        weights = embeddings_map[r["id"]]
        for d_idx, w in enumerate(weights):
            raw_mat[idx, d_idx] = w

    # Normalize vectors
    norms = np.linalg.norm(raw_mat, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    norm_mat = raw_mat / norms

    service.index.add(norm_mat)
    for idx, r in enumerate(domain_records):
        service.id_to_record_id[idx] = r["id"]
        service.record_id_to_id[r["id"]] = idx

    # Mock encode_text to return IoT query vector [1.0, 0.0, 0.0, ...]
    mock_model = MagicMock()
    q_vec = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    q_vec[0] = 1.0
    mock_model.encode.return_value = q_vec
    service.model = mock_model

    with patch("app.services.semantic_search_service.research_collection") as mock_coll:
        mock_coll.find.return_value = [
            {"_id": "1", "id": "doc:iot:high", "title": "Advanced Threat Detection in IoT"},
            {"_id": "2", "id": "doc:iot:med", "title": "Overview of Connected Sensor Networks"}
        ]

        results = service.search("detecting network attacks in IoT devices", top_k=5, threshold=0.10)
        assert len(results) >= 2
        # Check strict descending similarity ranking order
        similarities = [r["similarity"] for r in results]
        assert similarities == sorted(similarities, reverse=True)
        assert results[0]["id"] == "doc:iot:high"
        assert results[0]["similarity"] == 1.0


# ============================================================
# 11. Duplicate Publication Suppression & Punctuation Robustness
# ============================================================

def test_semantic_search_deduplication_and_query_robustness():
    service = SemanticSearchService()
    service.is_available = True
    service._create_empty_index()

    v1 = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    v1[0] = 1.0
    v2 = np.zeros(EMBEDDING_DIM, dtype=np.float32)
    v2[0] = 0.95

    service.index.add(np.vstack([v1, v2]))
    service.id_to_record_id[0] = "work:dup:1"
    service.id_to_record_id[1] = "work:dup:2"

    mock_model = MagicMock()
    mock_model.encode.return_value = v1
    service.model = mock_model

    # Both vector IDs resolve to the same canonical DOI in MongoDB
    with patch("app.services.semantic_search_service.research_collection") as mock_coll:
        mock_coll.find.return_value = [
            {"_id": "1", "id": "work:dup:1", "doi": "10.1000/shared_doi", "title": "Identical Paper 1"},
            {"_id": "2", "id": "work:dup:2", "doi": "10.1000/shared_doi", "title": "Identical Paper 2"}
        ]

        # Raw query with odd punctuation, extra whitespace, tabs
        dirty_query = "   \t  quantum ???  computing !! & Cryptography \n "
        results = service.search(dirty_query, top_k=5, threshold=0.10)

        # Deduplication must collapse results sharing the same DOI to 1
        assert len(results) == 1
        assert results[0]["doi"] == "10.1000/shared_doi"

