import unittest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.core.auth import get_current_user
from app.services.notification_service import (
    notifications_collection,
    create_notification,
    create_funding_alert,
    create_patent_alert,
    create_technology_alert,
    create_research_trend_alert,
    create_commercialization_alert,
    serialize_notification,
    get_user_notifications,
    get_unread_notifications,
    get_notification_by_id,
    mark_as_read,
    mark_all_as_read,
    generate_user_alerts
)


class TestNotificationsSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.user_a_id = f"test_user_a_{ObjectId()}"
        cls.user_b_id = f"test_user_b_{ObjectId()}"
        cls.user_a = {
            "user_id": cls.user_a_id,
            "email": "user_a@test.com",
            "role": "researcher",
            "name": "User Alpha"
        }
        cls.user_b = {
            "user_id": cls.user_b_id,
            "email": "user_b@test.com",
            "role": "startup",
            "name": "User Beta"
        }

    def setUp(self):
        # Default override to User A
        app.dependency_overrides[get_current_user] = lambda: self.user_a

    def tearDown(self):
        # Clean up any test notifications created for user A and user B
        notifications_collection.delete_many({"user_id": {"$in": [self.user_a_id, self.user_b_id]}})
        app.dependency_overrides.clear()

    @classmethod
    def tearDownClass(cls):
        notifications_collection.delete_many({"user_id": {"$in": [cls.user_a_id, cls.user_b_id]}})
        app.dependency_overrides.clear()

    # --------------------------------------------------------------------------
    # 1. Authentication & Authorization Enforcement
    # --------------------------------------------------------------------------
    def test_01_authentication_enforcement(self):
        app.dependency_overrides.clear() # No user logged in

        endpoints = [
            ("GET", "/api/notifications"),
            ("GET", "/api/notifications/unread"),
            ("POST", "/api/notifications/generate-alerts"),
            ("PATCH", "/api/notifications/read-all"),
            ("GET", "/api/notifications/650000000000000000000001"),
            ("PATCH", "/api/notifications/650000000000000000000001/read"),
        ]

        for method, endpoint in endpoints:
            if method == "GET":
                res = self.client.get(endpoint)
            elif method == "POST":
                res = self.client.post(endpoint)
            elif method == "PATCH":
                res = self.client.patch(endpoint)
            self.assertEqual(
                res.status_code, 401,
                f"Expected 401 Unauthorized for unauthenticated {method} {endpoint}, got {res.status_code}"
            )

    # --------------------------------------------------------------------------
    # 2. Empty Notification Lists
    # --------------------------------------------------------------------------
    def test_02_empty_notifications_list(self):
        # User A has 0 notifications
        res = self.client.get("/api/notifications")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total"], 0)
        self.assertEqual(data["unread_count"], 0)
        self.assertEqual(data["notifications"], [])

        res_unread = self.client.get("/api/notifications/unread")
        self.assertEqual(res_unread.status_code, 200)
        unread_data = res_unread.json()
        self.assertEqual(unread_data["unread_count"], 0)
        self.assertEqual(unread_data["notifications"], [])

    # --------------------------------------------------------------------------
    # 3. Notification Creation & Deduplication
    # --------------------------------------------------------------------------
    def test_03_notification_creation_and_deduplication(self):
        notif1 = create_funding_alert(
            user_id=self.user_a_id,
            title="NIH Grant: Quantum Algorithms",
            message="Matching research interest in quantum computing",
            project_id="PROJ_1001",
            priority="high"
        )
        self.assertIsNotNone(notif1)
        self.assertEqual(notif1["user_id"], self.user_a_id)
        self.assertEqual(notif1["notification_type"], "FUNDING")
        self.assertFalse(notif1["is_read"])
        self.assertEqual(notif1["priority"], "high")

        # Attempt to insert identical notification with duplicate key
        notif2 = create_funding_alert(
            user_id=self.user_a_id,
            title="NIH Grant: Quantum Algorithms",
            message="Duplicate attempt",
            project_id="PROJ_1001"
        )
        self.assertIsNotNone(notif2)
        self.assertEqual(notif1["id"], notif2["id"])

        # Count in DB should be exactly 1
        count = notifications_collection.count_documents({"user_id": self.user_a_id})
        self.assertEqual(count, 1)

    # --------------------------------------------------------------------------
    # 4. Listing, Pagination and Unread Counts
    # --------------------------------------------------------------------------
    def test_04_listing_and_unread_counts(self):
        create_funding_alert(self.user_a_id, "F1", "Funding 1", "P1")
        create_patent_alert(self.user_a_id, "P1", "Patent 1", "PAT1")
        notif3 = create_technology_alert(self.user_a_id, "T1", "Tech 1", "AI")

        # Mark notif3 as read in DB directly
        notifications_collection.update_one({"_id": ObjectId(notif3["id"])}, {"$set": {"is_read": True}})

        res = self.client.get("/api/notifications?page=1&limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total"], 3)
        self.assertEqual(data["unread_count"], 2)
        self.assertEqual(len(data["notifications"]), 3)

        # Check /unread endpoint
        res_unread = self.client.get("/api/notifications/unread")
        self.assertEqual(res_unread.status_code, 200)
        unread_data = res_unread.json()
        self.assertEqual(unread_data["unread_count"], 2)
        self.assertEqual(len(unread_data["notifications"]), 2)
        for n in unread_data["notifications"]:
            self.assertFalse(n["is_read"])

    # --------------------------------------------------------------------------
    # 5. Type Filtering
    # --------------------------------------------------------------------------
    def test_05_type_filtering(self):
        create_funding_alert(self.user_a_id, "Fund 1", "Msg", "F1")
        create_patent_alert(self.user_a_id, "Pat 1", "Msg", "P1")
        create_technology_alert(self.user_a_id, "Tech 1", "Msg", "T1")
        create_research_trend_alert(self.user_a_id, "Trend 1", "Msg", "R1")
        create_commercialization_alert(self.user_a_id, "Comm 1", "Msg", "C1")

        # Filter FUNDING
        res_fund = self.client.get("/api/notifications?type=FUNDING")
        self.assertEqual(res_fund.status_code, 200)
        self.assertEqual(res_fund.json()["total"], 1)
        self.assertEqual(res_fund.json()["notifications"][0]["notification_type"], "FUNDING")

        # Filter PATENT
        res_pat = self.client.get("/api/notifications?type=PATENT")
        self.assertEqual(res_pat.status_code, 200)
        self.assertEqual(res_pat.json()["total"], 1)
        self.assertEqual(res_pat.json()["notifications"][0]["notification_type"], "PATENT")

        # Filter ALL
        res_all = self.client.get("/api/notifications?type=ALL")
        self.assertEqual(res_all.status_code, 200)
        self.assertEqual(res_all.json()["total"], 5)

    # --------------------------------------------------------------------------
    # 6. Mark Single Notification as Read
    # --------------------------------------------------------------------------
    def test_06_mark_single_as_read(self):
        notif = create_funding_alert(self.user_a_id, "Fund Test", "Msg", "F99")
        notif_id = notif["id"]

        # Call PATCH /api/notifications/{id}/read
        res = self.client.patch(f"/api/notifications/{notif_id}/read")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_read"])
        self.assertEqual(data["id"], notif_id)

        # Verify DB and unread count
        unread = self.client.get("/api/notifications/unread").json()
        self.assertEqual(unread["unread_count"], 0)

    # --------------------------------------------------------------------------
    # 7. Mark All Notifications as Read
    # --------------------------------------------------------------------------
    def test_07_mark_all_as_read(self):
        create_funding_alert(self.user_a_id, "F1", "Msg", "F1")
        create_funding_alert(self.user_a_id, "F2", "Msg", "F2")
        create_funding_alert(self.user_a_id, "F3", "Msg", "F3")

        unread_before = self.client.get("/api/notifications/unread").json()
        self.assertEqual(unread_before["unread_count"], 3)

        res = self.client.patch("/api/notifications/read-all")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["modified_count"], 3)

        unread_after = self.client.get("/api/notifications/unread").json()
        self.assertEqual(unread_after["unread_count"], 0)

    # --------------------------------------------------------------------------
    # 8. User-Specific Access & Isolation (Multi-Tenancy)
    # --------------------------------------------------------------------------
    def test_08_user_isolation(self):
        # Create notification for User A
        notif_a = create_funding_alert(self.user_a_id, "User A Secret Grant", "Msg", "SECA")
        # Create notification for User B
        notif_b = create_patent_alert(self.user_b_id, "User B Secret Patent", "Msg", "SECB")

        # Now switch authentication context to User B
        app.dependency_overrides[get_current_user] = lambda: self.user_b

        # 1. User B listing should only show User B's notification
        res_b = self.client.get("/api/notifications")
        self.assertEqual(res_b.status_code, 200)
        b_ids = [n["id"] for n in res_b.json()["notifications"]]
        self.assertIn(notif_b["id"], b_ids)
        self.assertNotIn(notif_a["id"], b_ids)

        # 2. User B attempting to view User A's notification directly -> 404
        res_get_a = self.client.get(f"/api/notifications/{notif_a['id']}")
        self.assertEqual(res_get_a.status_code, 404)

        # 3. User B attempting to mark User A's notification as read -> 404
        res_patch_a = self.client.patch(f"/api/notifications/{notif_a['id']}/read")
        self.assertEqual(res_patch_a.status_code, 404)

        # 4. User B marking all as read must NOT mark User A's notification as read
        self.client.patch("/api/notifications/read-all")
        doc_a = notifications_collection.find_one({"_id": ObjectId(notif_a["id"])})
        self.assertFalse(doc_a["is_read"], "User A notification was modified by User B!")

    # --------------------------------------------------------------------------
    # 9. Invalid IDs and Missing Records
    # --------------------------------------------------------------------------
    def test_09_invalid_ids_and_missing_records(self):
        # Malformed ID
        res_malformed = self.client.get("/api/notifications/not-a-valid-id")
        self.assertEqual(res_malformed.status_code, 404)

        # Non-existent valid ObjectId
        missing_id = "650000000000000000000099"
        res_missing = self.client.get(f"/api/notifications/{missing_id}")
        self.assertEqual(res_missing.status_code, 404)

        # Non-existent patch
        res_patch = self.client.patch(f"/api/notifications/{missing_id}/read")
        self.assertEqual(res_patch.status_code, 404)

    # --------------------------------------------------------------------------
    # 10. GET Endpoints Idempotency (No Unexpected Side Effects)
    # --------------------------------------------------------------------------
    def test_10_get_endpoints_idempotent(self):
        create_funding_alert(self.user_a_id, "Idempotent Check", "Msg", "IDEM1")
        initial_count = notifications_collection.count_documents({"user_id": self.user_a_id})

        # Multiple GET calls
        for _ in range(5):
            self.client.get("/api/notifications")
            self.client.get("/api/notifications/unread")
            self.client.get("?type=FUNDING")

        final_count = notifications_collection.count_documents({"user_id": self.user_a_id})
        self.assertEqual(initial_count, final_count, "GET endpoints unexpectedly created alerts!")

    # --------------------------------------------------------------------------
    # 11. Automated Alert Generation Trigger
    # --------------------------------------------------------------------------
    def test_11_alert_generation_trigger(self):
        res = self.client.post("/api/notifications/generate-alerts")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("message", data)
        self.assertIn("generated_count", data)
        self.assertIn("alerts", data)
        self.assertIsInstance(data["alerts"], list)

        # Re-triggering generate-alerts immediately should not generate duplicates
        res2 = self.client.post("/api/notifications/generate-alerts")
        self.assertEqual(res2.status_code, 200)
        # Deduplication keys prevent duplicate inserts
        data2 = res2.json()
        self.assertEqual(data2["generated_count"], 0)

    # --------------------------------------------------------------------------
    # 12. Serialization & Robust Null-Handling
    # --------------------------------------------------------------------------
    def test_12_serialization_null_handling(self):
        # Empty doc
        self.assertEqual(serialize_notification({}), {})
        # Doc with missing fields
        partial_doc = {
            "_id": ObjectId(),
            "user_id": self.user_a_id,
            "title": "Minimal",
            "created_at": None,
            "metadata": None
        }
        serialized = serialize_notification(partial_doc)
        self.assertEqual(serialized["id"], str(partial_doc["_id"]))
        self.assertEqual(serialized["title"], "Minimal")
        self.assertEqual(serialized["metadata"], {})
        self.assertIsNotNone(serialized["created_at"])


if __name__ == "__main__":
    unittest.main()
