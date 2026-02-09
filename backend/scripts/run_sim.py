#!/usr/bin/env python3
"""
HOSPITALITY PLATFORM - SMOOTH SIMULATION SCRIPT
================================================
A polished restaurant simulation that creates realistic guest flow.

Features:
- Smooth guest arrival patterns (burst + trickle)
- Realistic ordering with courses
- Kitchen ticket processing
- Guest checkout after food delivery
- Clean logging with colors

Usage:
    cd backend
    python scripts/run_sim.py
"""

import time
import random
import requests
from datetime import datetime
import sys

# ================= CONFIGURATION =================
API_BASE = "http://127.0.0.1:8000/api/v1/integrations"

# Timing (in seconds)
TICK_INTERVAL = 2.0          # How often the sim loop runs
INITIAL_BURST_SIZE = 20      # How many guests to seat at start
GUEST_ARRIVAL_CHANCE = 0.3   # Chance of new guest each tick
CHECKOUT_CHANCE = 0.15       # Chance guest leaves after food delivered
VIP_CHANCE = 0.2             # Chance of VIP guest

# ================= COLORS =================
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    GOLD = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

# ================= MENU DATA =================
MENU_ITEMS = [
    # Apps
    {"name": "Chicken Tenders", "price": 29.0, "id": "a1", "station": "Fry", "course": "Apps"},
    {"name": "Tuna Tartare", "price": 36.0, "id": "a2", "station": "Garde Manger", "course": "Apps"},
    {"name": "Shrimp Cocktail", "price": 33.0, "id": "a3", "station": "Garde Manger", "course": "Apps"},
    {"name": "Caviar Service", "price": 131.0, "id": "a6", "station": "Garde Manger", "course": "Apps"},
    
    # Mains
    {"name": "Filet Mignon 8oz", "price": 77.0, "id": "m1", "station": "Grill", "course": "Mains"},
    {"name": "Wagyu Tomahawk", "price": 225.0, "id": "m2", "station": "Grill", "course": "Mains"},
    {"name": "Lobster Cavatelli", "price": 58.0, "id": "m3", "station": "Sauté", "course": "Mains"},
    {"name": "Roasted Branzino", "price": 62.0, "id": "m4", "station": "Grill", "course": "Mains"},
    {"name": "Roasted Chicken", "price": 48.0, "id": "m6", "station": "Oven", "course": "Mains"},
    
    # Sides
    {"name": "Mac & Cheese", "price": 24.0, "id": "s1", "station": "Oven", "course": "Sides"},
    {"name": "Creamed Spinach", "price": 18.0, "id": "s2", "station": "Sauté", "course": "Sides"},
    
    # Desserts
    {"name": "Slutty Brownie", "price": 17.0, "id": "d1", "station": "Pastry", "course": "Dessert"},
    {"name": "Carrot Cake", "price": 16.0, "id": "d2", "station": "Pastry", "course": "Dessert"},
    
    # Drinks
    {"name": "Caymus Cab", "price": 45.0, "id": "dr1", "station": "Bar", "course": "Drinks"},
    {"name": "Espresso Martini", "price": 24.0, "id": "dr3", "station": "Bar", "course": "Drinks"},
]

FIRST_NAMES = ["James", "Olivia", "Liam", "Emma", "Noah", "Ava", "Mason", "Sophia", "Logan", "Isabella"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Garcia", "Miller", "Davis", "Martinez", "Lee", "Wilson", "Taylor"]

# ================= HELPER FUNCTIONS =================

def log(msg, color=Colors.END):
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f"{Colors.CYAN}[{timestamp}]{Colors.END} {color}{msg}{Colors.END}")

def log_success(msg):
    log(f"✓ {msg}", Colors.GREEN)

def log_info(msg):
    log(f"→ {msg}", Colors.BLUE)

def log_gold(msg):
    log(f"★ {msg}", Colors.GOLD)

def log_error(msg):
    log(f"✗ {msg}", Colors.RED)

def random_name():
    return f"{random.choice(LAST_NAMES)}, {random.choice(FIRST_NAMES)}"

def api_get(endpoint):
    try:
        res = requests.get(f"{API_BASE}/{endpoint}", timeout=5)
        return res.json() if res.status_code == 200 else None
    except Exception as e:
        log_error(f"API GET {endpoint}: {e}")
        return None

def api_post(endpoint, data=None):
    try:
        res = requests.post(f"{API_BASE}/{endpoint}", json=data, timeout=5)
        return res.json() if res.status_code == 200 else None
    except Exception as e:
        log_error(f"API POST {endpoint}: {e}")
        return None

# ================= SIMULATION ACTIONS =================

def is_system_running():
    """Check if the restaurant system is in RUN mode."""
    data = api_get("system/status")
    return data.get("running", False) if data else False

def add_guest_to_waitlist():
    """Add a random guest to the waitlist."""
    guest = {
        "id": f"sim-{int(time.time()*1000)}-{random.randint(100,999)}",
        "name": random_name(),
        "party": random.choices([2, 2, 3, 4, 4, 5, 6], weights=[3, 3, 2, 2, 1, 1, 1])[0],
        "isVip": random.random() < VIP_CHANCE,
        "source": "simulation"
    }
    result = api_post("waitlist", guest)
    if result:
        vip_tag = f" {Colors.GOLD}★VIP{Colors.END}" if guest["isVip"] else ""
        log_info(f"Waitlist: {guest['name']} (Party of {guest['party']}){vip_tag}")
    return result is not None

def auto_seat_guests():
    """Trigger auto-seating of waitlist guests."""
    result = api_post("system/auto-seat")
    if result and result.get("seated"):
        for msg in result["seated"]:
            log_success(msg)
    return result

def process_orders():
    """Place orders for tables that just sat down."""
    tables = api_get("tables")
    if not tables:
        return
    
    for table in tables:
        if table.get("status") == "occupied" and table.get("orderTotal", 0) == 0:
            place_order_for_table(table)

def place_order_for_table(table):
    """Generate and place a realistic order for a table."""
    guest_count = table.get("guestCount", 2)
    items = []
    total = 0.0
    
    # Drinks (80% chance per guest)
    drinks = [i for i in MENU_ITEMS if i["course"] == "Drinks"]
    for _ in range(guest_count):
        if random.random() < 0.8 and drinks:
            item = random.choice(drinks)
            items.append({"item_id": item["id"], "name": item["name"], "quantity": 1, 
                         "price": item["price"], "station": item["station"], "course": "Drinks"})
            total += item["price"]
    
    # Apps (1-2 per table)
    apps = [i for i in MENU_ITEMS if i["course"] == "Apps"]
    for _ in range(random.randint(1, 2)):
        if apps:
            item = random.choice(apps)
            items.append({"item_id": item["id"], "name": item["name"], "quantity": 1,
                         "price": item["price"], "station": item["station"], "course": "Apps"})
            total += item["price"]
    
    # Mains (1 per guest)
    mains = [i for i in MENU_ITEMS if i["course"] == "Mains"]
    for _ in range(guest_count):
        if mains:
            item = random.choice(mains)
            items.append({"item_id": item["id"], "name": item["name"], "quantity": 1,
                         "price": item["price"], "station": item["station"], "course": "Mains"})
            total += item["price"]
    
    # Sides (1-2 per table)
    sides = [i for i in MENU_ITEMS if i["course"] == "Sides"]
    for _ in range(random.randint(1, 2)):
        if sides:
            item = random.choice(sides)
            items.append({"item_id": item["id"], "name": item["name"], "quantity": 1,
                         "price": item["price"], "station": item["station"], "course": "Sides"})
            total += item["price"]
    
    order = {
        "id": f"ord-{int(time.time()*1000)}-{table['number']}",
        "source": "simulation",
        "table_number": table["number"],
        "guest_count": guest_count,
        "items": items,
        "total_amount": total,
        "status": "new",
        "server": table.get("server", "Staff")
    }
    
    result = api_post("orders", order)
    if result:
        log_gold(f"Order: Table {table['number']} - ${total:.2f} ({len(items)} items)")

def process_checkouts():
    """Check out tables that have finished their meal."""
    # Get kitchen queue to see which tables are still waiting for food
    queue = api_get("kitchen/queue") or []
    active_tables = {t.get("table") for t in queue}
    
    # Get all tables
    tables = api_get("tables") or []
    
    for table in tables:
        # Only checkout occupied tables with orders that are not waiting for food
        if (table.get("status") == "occupied" and 
            table.get("orderTotal", 0) > 0 and 
            table.get("number") not in active_tables):
            
            # Random chance to checkout (simulates finishing meal)
            if random.random() < CHECKOUT_CHANCE:
                result = api_post(f"tables/{table['id']}/clear")
                if result:
                    log_success(f"Checkout: Table {table['number']} cleared (${table.get('orderTotal', 0):.2f})")

# ================= MAIN SIMULATION LOOP =================

def run_burst_mode():
    """Initial burst to fill the restaurant."""
    print(f"\n{Colors.BOLD}{Colors.GOLD}{'='*50}")
    print("   BURST MODE: OPENING SHIFT")
    print(f"{'='*50}{Colors.END}\n")
    
    log_info(f"Adding {INITIAL_BURST_SIZE} guests to start the shift...")
    
    for i in range(INITIAL_BURST_SIZE):
        add_guest_to_waitlist()
        # Seat every 5 guests
        if (i + 1) % 5 == 0:
            auto_seat_guests()
            time.sleep(0.3)
    
    # Final seat
    auto_seat_guests()
    print(f"\n{Colors.GREEN}Burst mode complete. Switching to steady state.{Colors.END}\n")

def run_simulation():
    """Main simulation loop."""
    print(f"""
{Colors.BOLD}{Colors.GOLD}
╔══════════════════════════════════════════════════╗
║     HOSPITALITY PLATFORM - RESTAURANT SIM        ║
║              [SMOOTH MODE]                       ║
╚══════════════════════════════════════════════════╝
{Colors.END}
Press Ctrl+C to stop.
Waiting for system to be in RUN mode...
""")

    first_run = True
    tick_count = 0
    
    while True:
        try:
            # Wait for system to be running
            if not is_system_running():
                log_info("System PAUSED. Click 'Run Service' in Dashboard...")
                while not is_system_running():
                    time.sleep(2)
                log_success("System ACTIVE! Starting simulation...")
            
            # First run burst
            if first_run:
                run_burst_mode()
                first_run = False
            
            # Regular tick operations
            tick_count += 1
            
            # 1. Add new guests (trickle)
            if random.random() < GUEST_ARRIVAL_CHANCE:
                add_guest_to_waitlist()
            
            # 2. Auto-seat waitlist
            auto_seat_guests()
            
            # 3. Process orders for new tables
            process_orders()
            
            # 4. Process checkouts
            process_checkouts()
            
            # Status update every 10 ticks
            if tick_count % 10 == 0:
                tables = api_get("tables") or []
                occupied = len([t for t in tables if t.get("status") == "occupied"])
                revenue = sum(t.get("orderTotal", 0) for t in tables)
                log(f"📊 Status: {occupied} tables occupied, ${revenue:.2f} revenue", Colors.CYAN)
            
            time.sleep(TICK_INTERVAL)
            
        except KeyboardInterrupt:
            print(f"\n{Colors.GOLD}Simulation stopped.{Colors.END}")
            break
        except Exception as e:
            log_error(f"Loop error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_simulation()
