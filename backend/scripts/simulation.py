
import time
import random
import requests
import json
from datetime import datetime

# Configuration
API_URL = "http://127.0.0.1:8000/api/v1/integrations"
TABLES_URL = f"{API_URL}/tables"
ORDERS_URL = f"{API_URL}/orders"
WAITLIST_URL = f"{API_URL}/waitlist"
AUTO_SEAT_URL = f"{API_URL}/system/auto-seat"
STATUS_URL = f"{API_URL}/system/status"
KITCHEN_QUEUE_URL = f"{API_URL}/kitchen/queue"

def is_system_running():
    try:
        res = requests.get(STATUS_URL)
        if res.status_code == 200:
            return res.json().get("running", False)
    except Exception:
        return False
    return False

# Delilah's Menu Items (id must match frontend or be unique for sim)
MENU_ITEMS = [
    # Apps
    {"name": "Chicken Tenders (App)", "price": 29.0, "id": "a1", "station": "Fry", "course": "Apps"},
    {"name": "Tuna Tartare (App)", "price": 36.0, "id": "a2", "station": "Garde Manger", "course": "Apps"},
    {"name": "Shrimp Cocktail (App)", "price": 33.0, "id": "a3", "station": "Garde Manger", "course": "Apps"},
    {"name": "Pigs In A Blanket (App)", "price": 26.0, "id": "a5", "station": "Oven", "course": "Apps"},
    {"name": "Caviar Service (App)", "price": 131.0, "id": "a6", "station": "Garde Manger", "course": "Apps"},
    
    # Mains
    {"name": "Filet Mignon 8oz (Main)", "price": 77.0, "id": "m1", "station": "Grill", "course": "Mains"},
    {"name": "Wagyu Tomahawk (Main)", "price": 225.0, "id": "m2", "station": "Grill", "course": "Mains"},
    {"name": "Lobster Cavatelli (Main)", "price": 58.0, "id": "m3", "station": "Sauté", "course": "Mains"},
    {"name": "Roasted Branzino (Main)", "price": 62.0, "id": "m4", "station": "Grill", "course": "Mains"},
    {"name": "Roasted Chicken (Main)", "price": 48.0, "id": "m6", "station": "Oven", "course": "Mains"},
    
    # Sides
    {"name": "Macaroni Gratinée (Side)", "price": 24.0, "id": "s1", "station": "Oven", "course": "Sides"},
    {"name": "Carrot Soufflé (Side)", "price": 18.0, "id": "s2", "station": "Pastry", "course": "Sides"},
    
    # Desserts
    {"name": "Slutty Brownie (Dessert)", "price": 17.0, "id": "d1", "station": "Pastry", "course": "Dessert"},
    {"name": "Carrot Cake (Dessert)", "price": 16.0, "id": "d2", "station": "Pastry", "course": "Dessert"},
    
    # Drinks
    {"name": "Caymus Cabernet (Drink)", "price": 45.0, "id": "dr1", "station": "Bar", "course": "Drinks"},
    {"name": "Clase Azul Marg (Drink)", "price": 42.0, "id": "dr2", "station": "Bar", "course": "Drinks"},
    {"name": "Delilah Martini (Drink)", "price": 24.0, "id": "dr3", "station": "Bar", "course": "Drinks"},
]

FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]

def get_random_name():
    return f"{random.choice(LAST_NAMES)}, {random.choice(FIRST_NAMES)}"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def add_guest(vip_chance=0.2):
    name = get_random_name()
    party = random.choice([2, 2, 2, 3, 4, 4, 5, 6]) # Weighted towards 2-4
    is_vip = random.random() < vip_chance
    
    guest = {
        "id": f"sim-g-{int(time.time()*1000)}-{random.randint(100,999)}",
        "name": name,
        "party": party,
        "isVip": is_vip,
        "source": "simulation"
    }
    
    try:
        requests.post(WAITLIST_URL, json=guest)
        # log(f"Added Waitlist: {name} (Party of {party})")
        return True
    except Exception as e:
        log(f"Error adding guest: {e}")
        return False

def trigger_auto_seat():
    try:
        res = requests.post(AUTO_SEAT_URL)
        if res.status_code == 200:
            data = res.json()
            if data.get("seated"):
                for seat_msg in data["seated"]:
                    log(f"  -> {seat_msg}")
    except Exception as e:
        log(f"Error auto-seating: {e}")

def simulate_ordering():
    try:
        # Get tables
        res = requests.get(TABLES_URL)
        tables = res.json()
        
        for table in tables:
            if table['status'] == 'occupied':
                # Logic: If orderTotal is 0, they just sat down. Order immediately.
                if table.get('orderTotal', 0) == 0:
                    place_order(table)
                    
    except Exception as e:
        log(f"Error in ordering loop: {e}")

def simulate_turnover():
    """
    Randomly clear occupied tables IF they have no active orders in KDS.
    This simulates guests finishing their meal and checking out.
    """
    try:
        # 1. Get active kitchen queue to see which tables are still waiting for food
        res_queue = requests.get(KITCHEN_QUEUE_URL)
        queue = res_queue.json()
        active_table_numbers = {t['table'] for t in queue}

        # 2. Get all tables
        res_tables = requests.get(TABLES_URL)
        tables = res_tables.json()
        
        for table in tables:
            if table['status'] == 'occupied' and table.get('orderTotal', 0) > 0:
                # If table has no active orders in KDS, it means they have been delivered
                if table['number'] not in active_table_numbers:
                    # 10% chance to finish meal each simulation tick after food delivery
                    # This allows them to stay for a while (approx 30s - 2min)
                    if random.random() < 0.1:
                        table_id = table['id']
                        res = requests.post(f"{TABLES_URL}/{table_id}/clear")
                        if res.status_code == 200:
                            log(f"Guest Checkout: Table {table['number']} cleared.")
    except Exception as e:
        log(f"Error in turnover loop: {e}")

def place_order(table):
    # Generate random order
    # Heuristic: 1 main per person, 0.5 apps per person, 1 drink per person
    guest_count = table.get('guestCount', 2)
    items = []
    total = 0.0
    
    # Drinks
    drink_items = [i for i in MENU_ITEMS if "(Drink)" in str(i.get("name", ""))]
    for _ in range(guest_count):
        if random.random() > 0.2 and drink_items:
            item = random.choice(drink_items)
            items.append({"item_id": item['id'], "name": item['name'], "quantity": 1, "price": float(item['price']), "station": item['station'], "course": item['course']})
            total += float(item['price'])

    # Apps
    app_items = [i for i in MENU_ITEMS if "(App)" in str(i.get("name", "")) or "(Side)" in str(i.get("name", ""))]
    num_apps = random.randint(0, guest_count)
    for _ in range(num_apps):
        if app_items:
            item = random.choice(app_items)
            items.append({"item_id": item['id'], "name": item['name'], "quantity": 1, "price": float(item['price']), "station": item['station'], "course": item['course']})
            total += float(item['price'])

    # Mains
    main_items = [i for i in MENU_ITEMS if "(Main)" in str(i.get("name", ""))]
    for _ in range(guest_count):
        if main_items:
            item = random.choice(main_items)
            items.append({"item_id": item['id'], "name": item['name'], "quantity": 1, "price": float(item['price']), "station": item['station'], "course": item['course']})
            total += float(item['price'])
        
    order = {
        "id": f"ord-{int(time.time()*1000)}-{table['number']}",
        "source": "simulation",
        "table_number": table['number'],
        "guest_count": guest_count,
        "items": items,
        "total_amount": total,
        "status": "new",
        "server": table.get('server', 'Staff')
    }
    
    try:
        requests.post(ORDERS_URL, json=order)
        log(f"Order Placed: Table {table['number']} (${total:.2f})")
    except Exception as e:
        log(f"Error placing order for Table {table['number']}: {e}")

def run_simulation():
    log("Starting Full Restaurant Simulation [DELILAH'S MODE]...")
    log("Press Ctrl+C to stop.")
    
    first_run = True

    while True:
        try:
            # Check if system is running
            if not is_system_running():
                log("System is PAUSED. Waiting for 'RUN' command in Dashboard...")
                while not is_system_running():
                    time.sleep(2)
                log("System is ACTIVE. Starting/Resuming Service...")

            # If it's the first time we go ACTIVE, run burst mode
            if first_run:
                log("=== BURST MODE: STARTING SHIFT ===")
                log("Seating 25 initial parties...")
                for i in range(25):
                    added = add_guest(vip_chance=0.3)
                    if added and i % 5 == 0:
                         trigger_auto_seat()
                         time.sleep(0.5)
                trigger_auto_seat()
                log("=== BURST MODE COMPLETE ===")
                first_run = False

            # 1. Add Guests (Trickle)
            if random.random() > 0.7:
                add_guest()
            
            # 2. Seat Guests
            trigger_auto_seat()
            
            # 3. Place Orders
            simulate_ordering()

            # 4. Guest Turnover (Checkout)
            simulate_turnover()
            
            # Sleep (accelerated time)
            time.sleep(3) 
            
        except KeyboardInterrupt:
            log("Stopping simulation.")
            break
        except Exception as e:
            log(f"Critical Loop Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_simulation()
