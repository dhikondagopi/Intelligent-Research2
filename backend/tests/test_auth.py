import unittest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import users_collection

client = TestClient(app)


class TestAuthRegressionSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_tag = f"test_auth_{ObjectId()}"

    def tearDown(self):
        # Clean up any test users
        users_collection.delete_many({"email": {"$regex": f"^{self.test_tag}"}})

    @classmethod
    def tearDownClass(cls):
        users_collection.delete_many({"email": {"$regex": f"^{cls.test_tag}"}})

    def test_01_normal_registration_researcher(self):
        email = f"{self.test_tag}_res@example.com"
        payload = {
            "name": "Dr. Researcher",
            "email": email,
            "password": "SecurePassword123!",
            "role": "researcher"
        }
        res = client.post("/api/auth/register", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("user_id", data)
        self.assertNotIn("access_token", data, "Registration must not issue an access token")
        self.assertNotIn("token_type", data)

        # Verify DB entry
        user = users_collection.find_one({"email": email})
        self.assertIsNotNone(user)
        self.assertEqual(user["role"], "researcher")
        self.assertNotEqual(user["password"], "SecurePassword123!") # Must be hashed

    def test_02_normal_registration_founder_and_manager(self):
        roles_to_test = ["founder", "manager"]
        for role in roles_to_test:
            email = f"{self.test_tag}_{role}@example.com"
            payload = {
                "name": f"User {role.capitalize()}",
                "email": email,
                "password": "Password123!",
                "role": role
            }
            res = client.post("/api/auth/register", json=payload)
            self.assertEqual(res.status_code, 200)
            user = users_collection.find_one({"email": email})
            self.assertIsNotNone(user)
            self.assertEqual(user["role"], role)

    def test_03_admin_self_elevation_blocked(self):
        """
        Critical security test: public registration attempting role 'admin',
        'administrator', or 'system_admin' must NOT be granted admin privileges.
        It must be safely mapped to 'researcher'.
        """
        forbidden_roles = ["admin", "administrator", "system_admin", "ADMIN", " Administrator "]
        for idx, forbidden_role in enumerate(forbidden_roles):
            email = f"{self.test_tag}_hack_{idx}@example.com"
            payload = {
                "name": "Attacker",
                "email": email,
                "password": "HackerPassword123!",
                "role": forbidden_role
            }
            res = client.post("/api/auth/register", json=payload)
            self.assertEqual(res.status_code, 200)

            user = users_collection.find_one({"email": email})
            self.assertIsNotNone(user)
            self.assertEqual(
                user["role"], "researcher",
                f"Security breach: public registration assigned forbidden role '{forbidden_role}' instead of 'researcher'"
            )

    def test_04_duplicate_email_registration_rejected(self):
        email = f"{self.test_tag}_dup@example.com"
        payload = {
            "name": "First User",
            "email": email,
            "password": "Password123!",
            "role": "researcher"
        }
        res1 = client.post("/api/auth/register", json=payload)
        self.assertEqual(res1.status_code, 200)

        # Duplicate attempt
        res2 = client.post("/api/auth/register", json=payload)
        self.assertEqual(res2.status_code, 400)
        self.assertIn("already registered", res2.json().get("detail", ""))

    def test_05_login_success(self):
        email = f"{self.test_tag}_login@example.com"
        reg_payload = {
            "name": "Login User",
            "email": email,
            "password": "MyLoginPassword456!",
            "role": "researcher"
        }
        client.post("/api/auth/register", json=reg_payload)

        login_payload = {
            "email": email,
            "password": "MyLoginPassword456!"
        }
        res = client.post("/api/auth/login", json=login_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data.get("token_type"), "bearer")
        self.assertEqual(data.get("email"), email)
        self.assertEqual(data.get("role"), "researcher")
        self.assertIn("user_id", data)

    def test_06_login_invalid_password(self):
        email = f"{self.test_tag}_badpwd@example.com"
        reg_payload = {
            "name": "User",
            "email": email,
            "password": "CorrectPassword123!",
            "role": "researcher"
        }
        client.post("/api/auth/register", json=reg_payload)

        res = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword"})
        self.assertEqual(res.status_code, 401)
        self.assertIn("Invalid", res.json().get("detail", ""))

    def test_07_login_nonexistent_email(self):
        res = client.post("/api/auth/login", json={
            "email": f"{self.test_tag}_nonexistent@example.com",
            "password": "AnyPassword"
        })
        self.assertEqual(res.status_code, 401)

    def test_08_registration_does_not_authenticate(self):
        email = f"{self.test_tag}_noauto@example.com"
        reg_payload = {
            "name": "No Auto Login",
            "email": email,
            "password": "ValidPassword999!",
            "role": "researcher"
        }
        res = client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertNotIn("access_token", data)
        self.assertNotIn("token", data)

        # Confirm unauthenticated request to protected reports endpoint is rejected (401)
        unauth_res = client.get("/api/reports/funding")
        self.assertEqual(unauth_res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
