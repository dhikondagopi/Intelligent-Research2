import os
import json
import threading
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple

import numpy as np

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    SEMANTIC_DEPS_AVAILABLE = True
except ImportError:
    faiss = None
    SentenceTransformer = None
    SEMANTIC_DEPS_AVAILABLE = False

from app.database.connection import db

research_collection = db["research_works"]

MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

# Directory for persisting FAISS vector index outside Git tracking
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VECTOR_INDEX_DIR = os.path.join(BASE_DIR, "data", "vector_index")
INDEX_FILE_PATH = os.path.join(VECTOR_INDEX_DIR, "research.index")
METADATA_FILE_PATH = os.path.join(VECTOR_INDEX_DIR, "research_metadata.json")


class SemanticSearchService:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.model: Optional[Any] = None
        self.index: Optional[Any] = None
        self.id_to_record_id: Dict[int, str] = {}
        self.record_id_to_id: Dict[str, int] = {}
        self.is_initialized = False
        self.is_available = SEMANTIC_DEPS_AVAILABLE
        self.init_error: Optional[str] = None

    @classmethod
    def get_instance(cls) -> "SemanticSearchService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
                    cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize the embedding model and load or create the FAISS index."""
        if not SEMANTIC_DEPS_AVAILABLE:
            self.init_error = "Required packages (sentence-transformers, faiss-cpu) not available."
            self.is_available = False
            return

        try:
            # 1. Load Sentence Transformer model (Singleton)
            print(f"[SemanticSearch] Loading embedding model: {MODEL_NAME}...")
            self.model = SentenceTransformer(MODEL_NAME)
            print("[SemanticSearch] Embedding model loaded successfully.")

            # 2. Ensure storage directory exists
            os.makedirs(VECTOR_INDEX_DIR, exist_ok=True)

            # 3. Load or create empty index
            if os.path.exists(INDEX_FILE_PATH) and os.path.exists(METADATA_FILE_PATH):
                self._load_index_from_disk()
            else:
                self._create_empty_index()
                self._save_index_to_disk()

            self.is_initialized = True
            self.is_available = True
        except Exception as exc:
            self.init_error = str(exc)
            self.is_available = False
            print(f"[SemanticSearch Initialization Error] {exc}")

    def _create_empty_index(self):
        """Create a fresh empty FAISS IndexFlatIP."""
        if faiss:
            self.index = faiss.IndexFlatIP(EMBEDDING_DIM)
        self.id_to_record_id = {}
        self.record_id_to_id = {}

    def _load_index_from_disk(self):
        """Load persisted FAISS index and id mapping metadata."""
        try:
            print(f"[SemanticSearch] Loading index from {INDEX_FILE_PATH}...")
            self.index = faiss.read_index(INDEX_FILE_PATH)
            with open(METADATA_FILE_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
                self.id_to_record_id = {int(k): v for k, v in meta.get("id_to_record_id", {}).items()}
                self.record_id_to_id = {v: int(k) for k, v in self.id_to_record_id.items()}
            print(f"[SemanticSearch] Index loaded with {self.index.ntotal} vectors.")
        except Exception as exc:
            print(f"[SemanticSearch Load Warning] Could not load persisted index: {exc}. Starting fresh.")
            self._create_empty_index()

    def _save_index_to_disk(self):
        """Persist FAISS index and id mapping to disk."""
        if not self.index:
            return
        try:
            os.makedirs(VECTOR_INDEX_DIR, exist_ok=True)
            faiss.write_index(self.index, INDEX_FILE_PATH)
            meta = {
                "model": MODEL_NAME,
                "dimension": EMBEDDING_DIM,
                "total_vectors": self.index.ntotal,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "id_to_record_id": {str(k): v for k, v in self.id_to_record_id.items()}
            }
            with open(METADATA_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2)
            print(f"[SemanticSearch] Index saved to disk ({self.index.ntotal} vectors).")
        except Exception as exc:
            print(f"[SemanticSearch Save Error] Failed to persist index: {exc}")

    @staticmethod
    def build_searchable_text(record: Dict[str, Any]) -> str:
        """Create a clean, rich text representation of a research work for embedding."""
        title = (record.get("title") or "").strip()
        abstract = (record.get("abstract") or "").strip()
        topics = " ".join([str(t) for t in (record.get("topics") or []) if t])
        concepts = " ".join([str(c) for c in (record.get("concepts") or []) if c])
        keywords = " ".join([str(k) for k in (record.get("keywords") or []) if k])
        venue = (record.get("venue") or "").strip()

        # Combine text fields prioritized by semantic importance
        parts = []
        if title:
            parts.append(f"Title: {title}")
        if abstract:
            parts.append(f"Abstract: {abstract}")
        if topics:
            parts.append(f"Topics: {topics}")
        if concepts and concepts != topics:
            parts.append(f"Concepts: {concepts}")
        if keywords:
            parts.append(f"Keywords: {keywords}")
        if venue:
            parts.append(f"Venue: {venue}")

        text = " ".join(parts).strip()
        # Truncate to reasonable word boundary (approx 450 words) to prevent excessive compute
        tokens = text.split()
        if len(tokens) > 450:
            text = " ".join(tokens[:450])
        return text or title or "Untitled publication"

    def encode_text(self, text: str) -> np.ndarray:
        """Encode a text query or document, returning an L2-normalized float32 vector."""
        if not self.model:
            raise RuntimeError("SentenceTransformer model is not loaded")
        embedding = self.model.encode(text, convert_to_numpy=True, show_progress_bar=False)
        embedding = np.array(embedding, dtype=np.float32)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """Encode a batch of texts, returning an L2-normalized float32 matrix."""
        if not self.model:
            raise RuntimeError("SentenceTransformer model is not loaded")
        embeddings = self.model.encode(texts, batch_size=32, convert_to_numpy=True, show_progress_bar=False)
        embeddings = np.array(embeddings, dtype=np.float32)
        # L2-normalize each vector for inner product (cosine similarity)
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        embeddings = embeddings / norms
        return embeddings

    def add_records(self, records: List[Dict[str, Any]]):
        """Add new research records into the FAISS index without full rebuilding."""
        if not self.is_available or not self.index or not records:
            return

        with self._lock:
            new_records = []
            for r in records:
                rec_id = r.get("id") or r.get("doi") or r.get("openalex_id")
                if rec_id and rec_id not in self.record_id_to_id:
                    new_records.append((rec_id, r))

            if not new_records:
                return

            texts = [self.build_searchable_text(r[1]) for r in new_records]
            try:
                embeddings = self.encode_batch(texts)
                start_id = self.index.ntotal
                self.index.add(embeddings)

                for offset, (rec_id, _) in enumerate(new_records):
                    vector_id = start_id + offset
                    self.id_to_record_id[vector_id] = rec_id
                    self.record_id_to_id[rec_id] = vector_id

                self._save_index_to_disk()
            except Exception as exc:
                print(f"[SemanticSearch Add Error] Failed adding records: {exc}")

    def rebuild_index(self, limit: int = 1500) -> Dict[str, Any]:
        """Fetch records from MongoDB, generate embeddings, and build fresh FAISS index."""
        if not self.is_available:
            return {"status": "error", "message": "Semantic search dependencies unavailable"}

        with self._lock:
            try:
                cursor = research_collection.find({}).sort("cited_by_count", -1).limit(limit)
                records = list(cursor)
                if not records:
                    self._create_empty_index()
                    self._save_index_to_disk()
                    return {"status": "empty", "indexed_count": 0}

                valid_records = []
                texts = []
                for doc in records:
                    rec_id = doc.get("id") or doc.get("doi") or doc.get("openalex_id") or str(doc["_id"])
                    text = self.build_searchable_text(doc)
                    if text:
                        valid_records.append(rec_id)
                        texts.append(text)

                if not texts:
                    self._create_empty_index()
                    return {"status": "empty", "indexed_count": 0}

                print(f"[SemanticSearch] Generating embeddings for {len(texts)} works...")
                embeddings = self.encode_batch(texts)

                new_index = faiss.IndexFlatIP(EMBEDDING_DIM)
                new_index.add(embeddings)

                new_id_to_rec = {}
                new_rec_to_id = {}
                for idx, rec_id in enumerate(valid_records):
                    new_id_to_rec[idx] = rec_id
                    new_rec_to_id[rec_id] = idx

                self.index = new_index
                self.id_to_record_id = new_id_to_rec
                self.record_id_to_id = new_rec_to_id
                self._save_index_to_disk()

                return {
                    "status": "success",
                    "indexed_count": len(valid_records),
                    "model": MODEL_NAME,
                    "dimension": EMBEDDING_DIM
                }
            except Exception as exc:
                print(f"[SemanticSearch Rebuild Error] {exc}")
                return {"status": "error", "message": str(exc)}

    def search(
        self,
        query: str,
        top_k: int = 20,
        threshold: float = 0.15
    ) -> List[Dict[str, Any]]:
        """
        Execute semantic vector similarity search using the FAISS index.
        Returns ranked list of MongoDB research records with similarity score.
        """
        clean_q = query.strip()
        if not clean_q or not self.is_available or not self.index or self.index.ntotal == 0:
            return []

        try:
            # 1. Encode query
            query_vec = self.encode_text(clean_q).reshape(1, -1)

            # 2. Search FAISS index
            search_k = min(top_k * 2, self.index.ntotal)
            scores, indices = self.index.search(query_vec, search_k)

            scores = scores[0]
            indices = indices[0]

            matched_candidates: List[Tuple[str, float]] = []
            for score, vector_id in zip(scores, indices):
                if vector_id == -1 or vector_id not in self.id_to_record_id:
                    continue
                # Cosine similarity threshold
                if float(score) >= threshold:
                    rec_id = self.id_to_record_id[vector_id]
                    matched_candidates.append((rec_id, float(score)))

            if not matched_candidates:
                return []

            # 3. Retrieve actual records from MongoDB
            rec_ids = [c[0] for c in matched_candidates[:top_k]]
            docs_cursor = research_collection.find({
                "$or": [
                    {"id": {"$in": rec_ids}},
                    {"doi": {"$in": rec_ids}},
                    {"openalex_id": {"$in": rec_ids}}
                ]
            })

            docs_map: Dict[str, Dict[str, Any]] = {}
            for doc in docs_cursor:
                doc["_id"] = str(doc["_id"])
                # Key by multiple possible identifiers
                if doc.get("id"):
                    docs_map[doc["id"]] = doc
                if doc.get("doi"):
                    docs_map[doc["doi"]] = doc
                if doc.get("openalex_id"):
                    docs_map[doc["openalex_id"]] = doc

            # 4. Assemble ordered results with similarity score and robust deduplication
            results: List[Dict[str, Any]] = []
            seen_ids = set()

            for rec_id, sim_score in matched_candidates:
                doc = docs_map.get(rec_id)
                if not doc:
                    continue

                # Collect all canonical identification keys for the candidate
                doc_keys = set()
                if doc.get("id"):
                    doc_keys.add(f"id:{str(doc['id']).strip()}")
                if doc.get("doi"):
                    doc_keys.add(f"doi:{str(doc['doi']).lower().strip()}")
                if doc.get("openalex_id"):
                    doc_keys.add(f"oa:{str(doc['openalex_id']).strip()}")
                if doc.get("title") and len(str(doc["title"]).strip()) > 5:
                    doc_keys.add(f"title:{str(doc['title']).lower().strip()}")
                if not doc_keys:
                    doc_keys.add(f"rec:{rec_id}")

                if doc_keys.intersection(seen_ids):
                    continue
                seen_ids.update(doc_keys)

                result_item = dict(doc)
                result_item["similarity"] = round(sim_score, 4)
                results.append(result_item)

                if len(results) >= top_k:
                    break

            return results
        except Exception as exc:
            print(f"[SemanticSearch Search Error] {exc}")
            return []

    def get_related_research(
        self,
        work_id: str,
        top_k: int = 6,
        threshold: float = 0.20
    ) -> List[Dict[str, Any]]:
        """
        Find semantically similar research for a given publication,
        excluding the target publication itself.
        """
        clean_id = work_id.strip()
        if not clean_id or not self.is_available:
            return []

        # Find target publication in MongoDB
        target_doc = research_collection.find_one({
            "$or": [
                {"id": clean_id},
                {"doi": clean_id},
                {"openalex_id": clean_id}
            ]
        })

        if not target_doc:
            return []

        # Build embedding for the target paper
        target_text = self.build_searchable_text(target_doc)
        if not target_text:
            return []

        # Search for top candidates (asking for top_k + 5 to filter out self)
        all_candidates = self.search(target_text, top_k=top_k + 5, threshold=threshold)

        # Exclude target work itself (filter out None values)
        target_keys = {
            k for k in [
                target_doc.get("id"),
                target_doc.get("doi"),
                target_doc.get("openalex_id"),
                str(target_doc.get("_id")) if target_doc.get("_id") else None
            ] if k
        }

        related_results = []
        for cand in all_candidates:
            cand_keys = {
                k for k in [
                    cand.get("id"),
                    cand.get("doi"),
                    cand.get("openalex_id"),
                    str(cand.get("_id")) if cand.get("_id") else None
                ] if k
            }
            if cand_keys.intersection(target_keys):
                continue
            related_results.append(cand)
            if len(related_results) >= top_k:
                break

        return related_results


def get_semantic_service() -> SemanticSearchService:
    return SemanticSearchService.get_instance()
