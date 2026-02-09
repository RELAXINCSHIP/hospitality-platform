import requests
import json

BASE_URL = "http://localhost:8000/api/v1/integrations"

def check_endpoint(endpoint):
    try:
        url = f"{BASE_URL}/{endpoint}"
        print(f"Checking {url}...")
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Response:", json.dumps(response.json(), indent=2)[:200] + "...")
            return True
        else:
            print("Error:", response.text)
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

print("--- Checking Backend API ---")
tables_ok = check_endpoint("tables")
waitlist_ok = check_endpoint("waitlist")
queue_ok = check_endpoint("kitchen/queue")


print("--- Testing POST Waitlist ---")
guest = {
    "id": "test_w_99",
    "name": "Test Guest",
    "party": 2,
    "isVip": False,
    "source": "waitlist"
}
resp = requests.post(f"{BASE_URL}/waitlist", json=guest)
print(f"POST Status: {resp.status_code}")
print(resp.text)

# Check if present
resp2 = requests.get(f"{BASE_URL}/waitlist")
print("New Waitlist count:", len(resp2.json()))

if tables_ok and waitlist_ok and resp.status_code == 200:
    print("\nAPI seems operational.")
else:
    print("\nAPI issues detected.")
