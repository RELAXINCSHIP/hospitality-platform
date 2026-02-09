
import urllib.request
import json
import random
import time
from datetime import datetime

API_URL = "http://127.0.0.1:8000/api/v1/integrations"

NAMES_FIRST = ["James", "Sarah", "Michael", "Jessica", "David", "Emily", "Robert", "Jennifer", "William", "Elizabeth"]
NAMES_LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
NOTES = ["Anniversary", "Birthday", "Gluten Free", "Window Seat", "Quiet Table", "VIP", "Regular", "First Time"]

def generate_guest():
    first = random.choice(NAMES_FIRST)
    last = random.choice(NAMES_LAST)
    return {
        "id": f"g_{int(time.time() * 1000)}_{random.randint(100,999)}",
        "name": f"{last}, {first}",
        "party": random.choices([2, 3, 4, 5, 6], weights=[0.4, 0.2, 0.2, 0.1, 0.1])[0],
        "isVip": random.random() < 0.2,
        "notes": random.choice(NOTES) if random.random() < 0.3 else None,
        "source": "waitlist"
    }

def add_guest():
    guest = generate_guest()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Adding guest: {guest['name']} (Party of {guest['party']})")
    
    try:
        data = json.dumps(guest).encode('utf-8')
        req = urllib.request.Request(f"{API_URL}/waitlist", data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as f:
            if f.status == 200:
                print(f"  -> Success")
            else:
                print(f"  -> Failed: {f.status}")
    except Exception as e:
        print(f"  -> Error: {e}")

def run_simulation():
    print("Starting Guest Simulation (Robust Mode)...")
    print("Press Ctrl+C to stop.")
    
    while True:
        try:
            # Try to ping backend, but don't exit if fails, just wait
            try:
                urllib.request.urlopen("http://127.0.0.1:8000/docs", timeout=2)
                connected = True
            except:
                connected = False
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Backend not reachable. Retrying in 10s...")
            
            if connected:
                num_guests = random.randint(1, 3) # Add 1-3 guests each time
                for _ in range(num_guests):
                    add_guest()
                    time.sleep(2) # Small delay between batch adds
                
                # Trigger Auto-Seating
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Triggering Auto-Seating...")
                try:
                    req = urllib.request.Request(f"{API_URL}/system/auto-seat", method="POST")
                    with urllib.request.urlopen(req) as f:
                        print(f"  -> Auto-Seat Response: {f.status}")
                except Exception as e:
                    print(f"  -> Auto-Seat Failed: {e}")

                print("Waiting 30 seconds (simulation speed)...") # Speed up for demo? User said 30 mins.
                # User specifically asked for "every 30 minutes". I should respect that but maybe provide a config or comment.
                # Reverting to 30 mins as requested.
                print("Waiting 30 minutes...")
                time.sleep(1800) # 30 minutes
            else:
                time.sleep(10)

        except KeyboardInterrupt:
            print("Stopping simulation.")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    run_simulation()
