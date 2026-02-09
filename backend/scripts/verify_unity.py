import requests
import json
import sys

API_URL = "http://127.0.0.1:8000/api/v1/unity"

def run_test(name, func):
    try:
        print(f"Testing {name}...", end=" ")
        func()
        print("PASSED")
    except Exception as e:
        print(f"FAILED: {e}")

def test_config():
    res = requests.get(f"{API_URL}/config")
    assert res.status_code == 200
    data = res.json()
    assert "WYNN_INFRASTRUCTURE" in data["distros"]
    assert "XS Nightclub" in data["locations"]["WYNN"]

def test_valet():
    # Test 1: Late Arrival (Retail Steer)
    res = requests.post(f"{API_URL}/valet/handshake", json={"guest_id": "g123", "eta_minutes": 20})
    assert res.json()["intent"] == "STEER_TO_RETAIL"
    
    # Test 2: Early Arrival (Prep Table)
    res = requests.post(f"{API_URL}/valet/handshake", json={"guest_id": "g124", "eta_minutes": 5})
    assert res.json()["intent"] == "PREP_TABLE"

def test_vault_audit():
    # Mock logic: Even table IDs pass, Odd fail
    
    # Pass Case
    res = requests.post(f"{API_URL}/vault/audit", json={"table_id": "100", "staff_id": "s1"})
    assert res.status_code == 200
    assert "PASSED" in res.json()["message"]
    
    # Fail Case
    res = requests.post(f"{API_URL}/vault/audit", json={"table_id": "101", "staff_id": "s1"})
    assert res.status_code == 400
    assert "FAILED" in res.json()["detail"]

def test_seating():
    # Mock Logic: Rank = len(staff_id). Table Min: >500 is $15k (Needs Rank 4)
    
    # Pass: High Rank (s12345) on High Table (600)
    res = requests.post(f"{API_URL}/staff/assign-table", json={"server_id": "s12345", "table_id": "600"})
    assert res.status_code == 200
    
    # Fail: Low Rank (s1) on High Table (600)
    res = requests.post(f"{API_URL}/staff/assign-table", json={"server_id": "s1", "table_id": "600"})
    assert res.status_code == 403
    assert "DENIED" in res.json()["detail"]

if __name__ == "__main__":
    print("=== UNITY OS DIAGNOSTIC ===")
    run_test("Configuration", test_config)
    run_test("Valet Logic", test_valet)
    run_test("Vault Audit", test_vault_audit)
    run_test("Meritocracy Seating", test_seating)
