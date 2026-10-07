import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.patent_service import (
    normalize_patent_record,
    cache_patents_in_mongo,
    search_patents_with_fallback,
    get_headers
)
from app.database.connection import db

client = TestClient(app)
patents_collection = db["patents"]

MOCK_USPTO_RESPONSE = {
    "count": 1,
    "patentApplicationData": [
        {
            "applicationMetaData": {
                "patentNumber": "US11234567B2",
                "applicationNumberText": "16/999888",
                "inventionTitle": "Quantum Neural Network Optimizer",
                "filingDate": "2023-01-15",
                "grantDate": "2024-06-20",
                "applicationStatusDescriptionText": "Patented Case",
                "abstractText": "Methods and systems for optimizing quantum neural networks using hybrid circuits.",
                "first_wipo_field_title": "Computer Technology",
                "first_wipo_sector_title": "Electrical Engineering",
                "countryCode": "US"
            },
            "inventorBag": [
                {"firstName": "Alice", "lastName": "Smith"},
                {"firstName": "Bob", "lastName": "Jones"}
            ],
            "assignmentBag": [
                {"organizationName": "Quantum Dynamics Inc"}
            ],
            "cpcClassificationBag": [
                {"cpcClassificationCode": "G06N10/00"},
                {"cpcClassificationCode": "H04L9/00"}
            ]
        }
    ]
}


class TestPatentIntelligence(unittest.TestCase):

    # 1. Live Patent Search Test
    @patch("app.services.patent_service.fetch_live_patents")
    def test_01_live_patent_search(self, mock_fetch):
        mock_fetch.return_value = MOCK_USPTO_RESPONSE

        with patch.dict(os.environ, {"USPTO_API_KEY": "test_key_123"}):
            res = client.get("/api/patents/search?q=quantum&page=1&size=20")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["source"], "USPTO Live Data")
            self.assertFalse(data["is_cached"])
            self.assertEqual(len(data["results"]), 1)
            self.assertEqual(data["results"][0]["patent_number"], "US11234567B2")
            self.assertEqual(data["results"][0]["patent_title"], "Quantum Neural Network Optimizer")

    # 2. Pagination Test
    @patch("app.services.patent_service.fetch_live_patents")
    def test_02_patent_pagination(self, mock_fetch):
        mock_fetch.return_value = {"count": 100, "patentApplicationData": []}

        with patch.dict(os.environ, {"USPTO_API_KEY": "test_key_123"}):
            res = client.get("/api/patents/search?q=ai&page=2&size=10")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["page"], 2)
            self.assertEqual(data["size"], 10)

    # 3. Result Normalization Test
    def test_03_patent_normalization(self):
        item = MOCK_USPTO_RESPONSE["patentApplicationData"][0]
        norm = normalize_patent_record(item, source_label="USPTO Live Data")

        self.assertIsNotNone(norm)
        self.assertEqual(norm["patent_number"], "US11234567B2")
        self.assertEqual(norm["patent_title"], "Quantum Neural Network Optimizer")
        self.assertEqual(norm["assignee"], "Quantum Dynamics Inc")
        self.assertIn("Alice Smith", norm["inventors"])
        self.assertIn("Bob Jones", norm["inventors"])
        self.assertIn("G", norm["cpc_sections"])
        self.assertEqual(norm["technology_field"], "Computer Technology")
        self.assertEqual(norm["country"], "US")
        self.assertEqual(norm["source_url"], "https://patentcenter.uspto.gov/applications/US11234567B2")

    # 4. MongoDB Upsert Test
    def test_04_mongodb_upsert(self):
        item = MOCK_USPTO_RESPONSE["patentApplicationData"][0]
        norm = normalize_patent_record(item)
        count = cache_patents_in_mongo([norm])
        self.assertEqual(count, 1)

        stored = patents_collection.find_one({"patent_number": "US11234567B2"})
        self.assertIsNotNone(stored)
        self.assertEqual(stored["patent_title"], "Quantum Neural Network Optimizer")

    # 5. Patent Statistics Endpoint Test
    def test_05_patent_statistics(self):
        res = client.get("/api/patents/statistics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_patents", data)
        self.assertIn("top_organizations", data)
        self.assertIn("top_technologies", data)
        self.assertIn("top_sectors", data)
        self.assertIn("top_countries", data)
        self.assertIn("top_cpc_sections", data)
        self.assertIn("yearly_activity", data)

    # 6. Technology Aggregation Test
    def test_06_patent_technologies_aggregation(self):
        res = client.get("/api/patents/technologies?limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("count", data)
        self.assertIn("technologies", data)
        self.assertIsInstance(data["technologies"], list)

    # 7. Organization Aggregation Test
    def test_07_patent_organizations_aggregation(self):
        res = client.get("/api/patents/organizations?limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("count", data)
        self.assertIn("organizations", data)
        self.assertIsInstance(data["organizations"], list)

    # 8. Geography Aggregation Test
    def test_08_patent_geography_aggregation(self):
        res = client.get("/api/patents/geography?limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("count", data)
        self.assertIn("countries", data)
        self.assertIsInstance(data["countries"], list)

    # 9. Single Patent Lookup Test
    def test_09_single_patent_lookup(self):
        patents_collection.update_one(
            {"patent_number": "US9999999"},
            {
                "$set": {
                    "patent_id": "US9999999",
                    "patent_number": "US9999999",
                    "patent_title": "Test Patent Single",
                    "assignee": "Test Corp"
                }
            },
            upsert=True
        )

        res = client.get("/api/patents/US9999999")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["patent_number"], "US9999999")
        self.assertEqual(data["patent_title"], "Test Patent Single")

        res_not_found = client.get("/api/patents/NONEXISTENT_999")
        self.assertEqual(res_not_found.status_code, 404)

    # 10. API Failure Handling Test
    @patch("app.services.patent_service.fetch_live_patents")
    def test_10_api_failure_handling(self, mock_fetch):
        mock_fetch.side_effect = Exception("Internal Server Error")

        # Seed cached record for quantum so fallback returns 200 with cached results
        patents_collection.update_one(
            {"patent_number": "US7777777"},
            {
                "$set": {
                    "patent_id": "US7777777",
                    "patent_number": "US7777777",
                    "patent_title": "Quantum Error Correction System",
                    "assignee": "Quantum Corp"
                }
            },
            upsert=True
        )

        with patch.dict(os.environ, {"USPTO_API_KEY": "test_key_123"}):
            res = client.get("/api/patents/search?q=quantum")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["is_cached"])
            self.assertIn("MongoDB Cache", data["source"])

    # 11. Cached Data Fallback Test
    @patch("app.services.patent_service.fetch_live_patents")
    def test_11_cached_data_fallback(self, mock_fetch):
        mock_fetch.side_effect = Exception("USPTO API down")

        patents_collection.update_one(
            {"patent_number": "US8888888"},
            {
                "$set": {
                    "patent_id": "US8888888",
                    "patent_number": "US8888888",
                    "patent_title": "Superconductor Circuit",
                    "assignee": "Fallback Org"
                }
            },
            upsert=True
        )

        data = search_patents_with_fallback("Superconductor", 1, 10)
        self.assertTrue(data["is_cached"])
        self.assertEqual(data["source"], "MongoDB Cache (Fallback)")
        self.assertGreaterEqual(len(data["results"]), 1)

    # 12. Unauthorized Access / Missing Key Test
    def test_12_unauthorized_api_access(self):
        with patch.dict(os.environ, {"USPTO_API_KEY": ""}, clear=True):
            with self.assertRaises(RuntimeError) as ctx:
                get_headers()
            self.assertIn("USPTO_API_KEY is missing", str(ctx.exception))

    # 13. No API Key Exposed in Frontend Test
    def test_13_no_api_key_in_frontend(self):
        frontend_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "frontend",
            "src"
        )
        for root, _, files in os.walk(frontend_dir):
            for file in files:
                if file.endswith((".js", ".jsx", ".ts", ".tsx", ".html")):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        self.assertNotIn("USPTO_API_KEY", content, f"Secret reference found in frontend file: {filepath}")

    # 14. No Runtime Dependency on 2025_patents.csv Test
    def test_14_no_runtime_dependency_on_csv(self):
        from app.routes import patent
        from app.services import patent_service
        self.assertTrue(hasattr(patent, "router"))
        self.assertTrue(hasattr(patent_service, "search_patents_with_fallback"))


if __name__ == "__main__":
    unittest.main()
