import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000"

def log_result(module_name, endpoint, status_code, details=""):
    print(f"[{module_name}] {endpoint} -> Status: {status_code} | {details}")

def run_tests():
    print("=== STARTING LIVE BACKEND API SMOKE TESTS ===")
    
    # 1. Health
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/health")
        log_result("System", "/api/health", req.status)
    except Exception as e:
        log_result("System", "/api/health", 500, str(e))

    # 2. Module 1: Auth (Register & Login)
    test_user = {
        "name": "Audit Test User",
        "email": "audit_test@example.com",
        "password": "Password123!",
        "role": "researcher"
    }
    
    # Try register
    token = None
    user_id = None
    try:
        data = json.dumps(test_user).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/api/auth/register", data=data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req) as resp:
            log_result("Module 1 Auth", "/api/auth/register", resp.status, "Registered")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            log_result("Module 1 Auth", "/api/auth/register", 200, "User already registered (expected)")
        else:
            log_result("Module 1 Auth", "/api/auth/register", e.code, e.read().decode())

    # Try login
    try:
        login_data = json.dumps({"email": test_user["email"], "password": test_user["password"]}).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=login_data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req) as resp:
            res_json = json.loads(resp.read().decode())
            token = res_json.get("access_token")
            user_id = res_json.get("user_id")
            log_result("Module 1 Auth", "/api/auth/login", resp.status, f"User ID: {user_id}")
    except Exception as e:
        log_result("Module 1 Auth", "/api/auth/login", 500, str(e))

    headers = {'Authorization': f'Bearer {token}'} if token else {}

    # 3. Module 2: Profile
    if user_id:
        try:
            req = urllib.request.Request(f"{BASE_URL}/api/profile/{user_id}")
            with urllib.request.urlopen(req) as resp:
                log_result("Module 2 Profile", f"/api/profile/{user_id}", resp.status)
        except Exception as e:
            log_result("Module 2 Profile", f"/api/profile/{user_id}", 500, str(e))

        try:
            prof_data = json.dumps({
                "affiliation": "MIT",
                "department": "AI Lab",
                "bio": "Researching AI",
                "research_interests": ["Machine Learning", "Quantum Computing"],
                "skills": ["Python", "FastAPI"],
                "orcid": "0000-0001-2345-6789"
            }).encode('utf-8')
            req = urllib.request.Request(f"{BASE_URL}/api/profile/{user_id}", data=prof_data, headers={'Content-Type': 'application/json'}, method='PUT')
            with urllib.request.urlopen(req) as resp:
                log_result("Module 2 Profile", f"PUT /api/profile/{user_id}", resp.status)
        except Exception as e:
            log_result("Module 2 Profile", f"PUT /api/profile/{user_id}", 500, str(e))

    # 4. Module 3: Research Intelligence
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/research/search?q=quantum")
        log_result("Module 3 Research", "/api/research/search?q=quantum", req.status)
    except Exception as e:
        log_result("Module 3 Research", "/api/research/search?q=quantum", 500, str(e))

    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/research/trending")
        log_result("Module 3 Research", "/api/research/trending", req.status)
    except Exception as e:
        log_result("Module 3 Research", "/api/research/trending", 500, str(e))

    # 5. Module 4: Funding Intelligence
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/funding/search?q=cancer")
        log_result("Module 4 Funding", "/api/funding/search?q=cancer", req.status)
    except Exception as e:
        log_result("Module 4 Funding", "/api/funding/search?q=cancer", 500, str(e))

    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/funding/statistics")
        log_result("Module 4 Funding", "/api/funding/statistics", req.status)
    except Exception as e:
        log_result("Module 4 Funding", "/api/funding/statistics", 500, str(e))

    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/funding/top-organizations")
        log_result("Module 4 Funding", "/api/funding/top-organizations", req.status)
    except Exception as e:
        log_result("Module 4 Funding", "/api/funding/top-organizations", 500, str(e))

    # 6. Module 5: Patent Intelligence
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/patents/search?q=quantum")
        log_result("Module 5 Patent", "/api/patents/search?q=quantum", req.status)
    except Exception as e:
        log_result("Module 5 Patent", "/api/patents/search?q=quantum", 500, str(e))

    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/patents/statistics")
        log_result("Module 5 Patent", "/api/patents/statistics", req.status)
    except Exception as e:
        log_result("Module 5 Patent", "/api/patents/statistics", 500, str(e))

    # 7. Module 6: Technology Intelligence
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/technology/dashboard")
        log_result("Module 6 Technology", "/api/technology/dashboard", req.status)
    except Exception as e:
        log_result("Module 6 Technology", "/api/technology/dashboard", 500, str(e))

    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/technology/emerging")
        log_result("Module 6 Technology", "/api/technology/emerging", req.status)
    except Exception as e:
        log_result("Module 6 Technology", "/api/technology/emerging", 500, str(e))

    # 8. Module 7: Innovation Scoring
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/innovation/dashboard")
        log_result("Module 7 Innovation", "/api/innovation/dashboard", req.status)
    except Exception as e:
        log_result("Module 7 Innovation", "/api/innovation/dashboard", 500, str(e))

    # 9. Module 8: Commercialization
    try:
        req = urllib.request.urlopen(f"{BASE_URL}/api/v1/commercialization/dashboard/quantum")
        log_result("Module 8 Commercialization", "/api/v1/commercialization/dashboard/quantum", req.status)
    except Exception as e:
        log_result("Module 8 Commercialization", "/api/v1/commercialization/dashboard/quantum", 500, str(e))

    # 10. Module 9: Role Dashboard
    if token:
        try:
            req = urllib.request.Request(f"{BASE_URL}/api/dashboard/me", headers=headers)
            with urllib.request.urlopen(req) as resp:
                log_result("Module 9 RoleDashboard", "/api/dashboard/me", resp.status)
        except Exception as e:
            log_result("Module 9 RoleDashboard", "/api/dashboard/me", 500, str(e))

    # 11. Module 10: Notifications
    if token:
        try:
            req = urllib.request.Request(f"{BASE_URL}/api/notifications", headers=headers)
            with urllib.request.urlopen(req) as resp:
                log_result("Module 10 Notifications", "/api/notifications", resp.status)
        except Exception as e:
            log_result("Module 10 Notifications", "/api/notifications", 500, str(e))

        try:
            req = urllib.request.Request(f"{BASE_URL}/api/notifications/unread", headers=headers)
            with urllib.request.urlopen(req) as resp:
                log_result("Module 10 Notifications", "/api/notifications/unread", resp.status)
        except Exception as e:
            log_result("Module 10 Notifications", "/api/notifications/unread", 500, str(e))

    # 12. Module 11: Reports
    if token:
        try:
            req = urllib.request.Request(f"{BASE_URL}/api/reports/funding", headers=headers)
            with urllib.request.urlopen(req) as resp:
                log_result("Module 11 Reports", "/api/reports/funding", resp.status)
        except Exception as e:
            log_result("Module 11 Reports", "/api/reports/funding", 500, str(e))

        try:
            req = urllib.request.Request(f"{BASE_URL}/api/reports/patents", headers=headers)
            with urllib.request.urlopen(req) as resp:
                log_result("Module 11 Reports", "/api/reports/patents", resp.status)
        except Exception as e:
            log_result("Module 11 Reports", "/api/reports/patents", 500, str(e))

    print("=== LIVE BACKEND API SMOKE TESTS COMPLETE ===")

if __name__ == "__main__":
    run_tests()
