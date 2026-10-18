import base64
import json
import time
import unittest
from unittest.mock import patch

from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import users_collection
from app.core.security import hash_password, create_access_token
from app.services.google_oauth_service import (
    create_oauth_state,
    get_google_client_id,
    get_google_redirect_uri,
    verify_oauth_state
)

client = TestClient(app)


class TestGoogleOAuthSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_tag = f"test_google_{ObjectId()}"

    def tearDown(self):
        # Clean up users created during tests
        users_collection.delete_many({"email": {"$regex": f"^{self.test_tag}"}})

    @classmethod
    def tearDownClass(cls):
        users_collection.delete_many({"email": {"$regex": f"^{cls.test_tag}"}})

    # ----------------------------------------------------
    # 1. URL Generation & Direct Route Match
    # ----------------------------------------------------
    def test_01_google_auth_url_and_callback_route_match(self):
        # Check /api/auth/google/url
        res = client.get("/api/auth/google/url")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("authorization_url", data)
        self.assertIn("state", data)
        auth_url = data["authorization_url"]
        self.assertIn("accounts.google.com", auth_url)
        self.assertIn("client_id=", auth_url)
        self.assertIn("response_type=code", auth_url)
        self.assertIn("scope=openid+email+profile", auth_url)

        # Confirm the callback route matches http://localhost:8000/auth/google/callback
        redirect_uri = get_google_redirect_uri()
        self.assertEqual(redirect_uri, "http://localhost:8000/auth/google/callback")
        self.assertIn("http%3A%2F%2Flocalhost%3A8000%2Fauth%2Fgoogle%2Fcallback", auth_url)

        # Test direct initiate route /auth/google/login returns redirect
        login_res = client.get("/auth/google/login", follow_redirects=False)
        self.assertEqual(login_res.status_code, 303)
        self.assertIn("accounts.google.com", login_res.headers.get("location", ""))

    # ----------------------------------------------------
    # 2. Success: New User Creation & Re-login
    # ----------------------------------------------------
    @patch("app.routes.auth.exchange_code_for_tokens")
    @patch("app.routes.auth.verify_id_token")
    def test_02_google_login_success_new_user(self, mock_verify, mock_exchange):
        email = f"{self.test_tag}_new@example.com"
        google_id = f"gid_{ObjectId()}"
        mock_exchange.return_value = {"id_token": "mock.jwt.token", "access_token": "mock_at"}
        mock_verify.return_value = {
            "sub": google_id,
            "email": email,
            "name": "Dr. Google Scientist",
            "aud": get_google_client_id(),
            "iss": "https://accounts.google.com",
            "email_verified": True
        }

        state = create_oauth_state()

        # Execute callback directly on /auth/google/callback with Accept: application/json
        res = client.get(
            f"/auth/google/callback?code=mock_code&state={state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["email"], email)
        self.assertEqual(data["role"], "researcher")

        # Verify DB entry
        user = users_collection.find_one({"email": email})
        self.assertIsNotNone(user)
        self.assertEqual(user["google_id"], google_id)
        self.assertEqual(user["auth_provider"], "google")
        self.assertEqual(user["role"], "researcher")

    @patch("app.routes.auth.exchange_code_for_tokens")
    @patch("app.routes.auth.verify_id_token")
    def test_03_google_login_success_existing_google_user_no_duplicate(self, mock_verify, mock_exchange):
        email = f"{self.test_tag}_existing@example.com"
        google_id = f"gid_{ObjectId()}"

        # Seed existing Google user
        users_collection.insert_one({
            "name": "Returning Google User",
            "email": email,
            "google_id": google_id,
            "auth_provider": "google",
            "role": "researcher"
        })

        initial_count = users_collection.count_documents({"email": email})
        self.assertEqual(initial_count, 1)

        mock_exchange.return_value = {"id_token": "mock.jwt.token", "access_token": "mock_at"}
        mock_verify.return_value = {
            "sub": google_id,
            "email": email,
            "name": "Returning Google User",
            "aud": get_google_client_id(),
            "iss": "https://accounts.google.com",
            "email_verified": True
        }

        state = create_oauth_state()
        res = client.get(
            f"/auth/google/callback?code=mock_code&state={state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["email"], email)

        # Confirm no duplicate was inserted
        final_count = users_collection.count_documents({"email": email})
        self.assertEqual(final_count, 1)

    # ----------------------------------------------------
    # 3. Invalid State Handling (CSRF & Replay Protection)
    # ----------------------------------------------------
    def test_04_invalid_state_missing_or_tampered(self):
        # Missing state
        res_missing = client.get(
            "/auth/google/callback?code=mock_code",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res_missing.status_code, 400)
        self.assertIn("state", res_missing.json().get("detail", "").lower())

        # Tampered state signature
        valid_state = create_oauth_state()
        tampered_state = valid_state[:-4] + "XXXX"
        res_tampered = client.get(
            f"/auth/google/callback?code=mock_code&state={tampered_state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res_tampered.status_code, 400)
        self.assertIn("signature", res_tampered.json().get("detail", "").lower())

    def test_05_expired_and_replayed_state(self):
        # Expired state
        past_time = int(time.time()) - 100
        payload_dict = {"nonce": "expired_nonce_123", "exp": past_time, "frontend_url": "http://localhost:5173"}
        payload_json = json.dumps(payload_dict)
        payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8").rstrip("=")
        import hmac, hashlib
        from app.core.security import SECRET_KEY
        sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).digest()
        sig_b64 = base64.urlsafe_b64encode(sig).decode("utf-8").rstrip("=")
        expired_state = f"{payload_b64}.{sig_b64}"

        res_expired = client.get(
            f"/auth/google/callback?code=mock_code&state={expired_state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res_expired.status_code, 400)
        self.assertIn("expired", res_expired.json().get("detail", "").lower())

        # Replay: consume a state once, then attempt to use it again
        fresh_state = create_oauth_state()
        # First verification succeeds
        verify_oauth_state(fresh_state)
        # Second verification with same state must fail replay check
        res_replay = client.get(
            f"/auth/google/callback?code=mock_code&state={fresh_state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res_replay.status_code, 400)
        self.assertIn("already been used", res_replay.json().get("detail", "").lower())

    # ----------------------------------------------------
    # 4. Invalid Token Handling
    # ----------------------------------------------------
    @patch("app.routes.auth.exchange_code_for_tokens")
    @patch("app.routes.auth.verify_id_token")
    def test_06_invalid_token_rejected(self, mock_verify, mock_exchange):
        from fastapi import HTTPException
        mock_exchange.return_value = {"id_token": "tampered_token"}
        mock_verify.side_effect = HTTPException(status_code=400, detail="Google ID token audience mismatch")

        state = create_oauth_state()
        res = client.get(
            f"/auth/google/callback?code=mock_code&state={state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("audience mismatch", res.json().get("detail", ""))

    # ----------------------------------------------------
    # 5. Duplicate Accounts / No Automatic Linking by Email
    # ----------------------------------------------------
    @patch("app.routes.auth.exchange_code_for_tokens")
    @patch("app.routes.auth.verify_id_token")
    def test_07_duplicate_account_no_auto_link_rejected(self, mock_verify, mock_exchange):
        """
        Critical security test:
        If a user registered with email/password, and an unlinked Google sign-in
        comes in with the same email, it must NOT auto-link or duplicate the user.
        It must reject with 409 Conflict.
        """
        email = f"{self.test_tag}_pwduser@example.com"
        users_collection.insert_one({
            "name": "Password User",
            "email": email,
            "password": hash_password("SuperSecret123!"),
            "role": "researcher"
            # note: no google_id
        })

        mock_exchange.return_value = {"id_token": "mock.jwt.token", "access_token": "mock_at"}
        mock_verify.return_value = {
            "sub": "different_google_sub_999",
            "email": email,
            "name": "Google Impostor",
            "aud": get_google_client_id(),
            "iss": "https://accounts.google.com",
            "email_verified": True
        }

        state = create_oauth_state()
        res = client.get(
            f"/auth/google/callback?code=mock_code&state={state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res.status_code, 409)
        self.assertIn("already exists", res.json().get("detail", ""))

        # Verify DB integrity: only 1 user exists, still has NO google_id attached
        matching_users = list(users_collection.find({"email": email}))
        self.assertEqual(len(matching_users), 1)
        self.assertNotIn("google_id", matching_users[0])

    # ----------------------------------------------------
    # 6. Role Preservation and Protected Routes
    # ----------------------------------------------------
    @patch("app.routes.auth.exchange_code_for_tokens")
    @patch("app.routes.auth.verify_id_token")
    def test_08_role_preservation_and_protected_routes(self, mock_verify, mock_exchange):
        founder_email = f"{self.test_tag}_founder@example.com"
        google_id = f"gid_{ObjectId()}"

        # Seed existing user with 'founder' role
        seed_result = users_collection.insert_one({
            "name": "Startup Founder",
            "email": founder_email,
            "google_id": google_id,
            "auth_provider": "google",
            "role": "founder"
        })
        user_id = str(seed_result.inserted_id)

        mock_exchange.return_value = {"id_token": "mock.jwt.token", "access_token": "mock_at"}
        mock_verify.return_value = {
            "sub": google_id,
            "email": founder_email,
            "name": "Startup Founder",
            "aud": get_google_client_id(),
            "iss": "https://accounts.google.com",
            "email_verified": True
        }

        state = create_oauth_state()
        res = client.get(
            f"/auth/google/callback?code=mock_code&state={state}",
            headers={"Accept": "application/json"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        token = data.get("access_token")
        self.assertEqual(data.get("role"), "founder")

        # Test role-protected endpoint /api/dashboard/{role}
        auth_headers = {"Authorization": f"Bearer {token}"}
        founder_dash_res = client.get("/api/dashboard/founder", headers={**auth_headers})
        self.assertEqual(founder_dash_res.status_code, 200)

        # Cross-role rejection: 'founder' cannot access 'manager' dashboard
        mismatch_res = client.get("/api/dashboard/manager", headers={**auth_headers})
        self.assertEqual(mismatch_res.status_code, 403)

        # Protected reports endpoint with Bearer token works
        reports_res = client.get("/api/reports/funding", headers={**auth_headers})
        self.assertEqual(reports_res.status_code, 200)

        # Unauthenticated request rejected
        unauth_res = client.get("/api/reports/funding")
        self.assertEqual(unauth_res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
