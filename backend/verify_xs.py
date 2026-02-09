import requests
import json

BASE_URL = "http://localhost:8000/api/v1/xs"

def test_xs_flow():
    print("1. Seeding XS Data...")
    try:
        res = requests.post(f"{BASE_URL}/setup")
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
    except Exception as e:
        print(f"Setup failed: {e}")
        if 'res' in locals():
            print(f"Response Body: {res.text}")

    print("\n2. Fetching Menu...")
    try:
        res = requests.get(f"{BASE_URL}/menu")
        print(f"Status: {res.status_code}")
        menu = res.json()
        print(f"Items found: {len(menu)}")
        print(json.dumps(menu[:1], indent=2))
    except Exception as e:
        print(f"Menu fetch failed: {e}")

    print("\n3. Fetching Layout...")
    try:
        res = requests.get(f"{BASE_URL}/layout")
        print(f"Status: {res.status_code}")
        layout = res.json()
        print(f"Sections found: {len(layout)}")
        print(json.dumps(layout[:1], indent=2))
    except Exception as e:
        print(f"Layout fetch failed: {e}")

if __name__ == "__main__":
    test_xs_flow()
