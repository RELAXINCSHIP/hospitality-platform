from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4
import time
from app.integrations.models import Order, GuestProfile, TableData, GuestToSeat
from app.integrations.logic import reconciler
from app.ai.engine import ai_engine
from app.integrations.toast_client import toast_client
from app.ai.kitchen import kitchen_optimizer

router = APIRouter()

# Mocked Data Store (in-memory for now)
orders_db: List[Order] = []
guests_db: List[GuestProfile] = []

@router.post("/webhook/toast", response_model=Order)
def receive_toast_order(order: Order):
    """
    Webhook endpoint to receive orders from Toast POS.
    Normalization happens here.
    """
    # Simulate extracting guest info from order (mocked)
    guest_data = {
        "name": f"Guest {order.table_number}", 
        "spend": order.total_amount,
        "preferences": {"last_order": [i.name for i in order.items]}
    }
    reconciler.reconcile(guest_data)
    
    orders_db.append(order)
    return order

@router.post("/orders", response_model=Order)
async def create_manual_order(order: Order):
    """
    Manually create an order (Server Tablet).
    """
    # Normalize guest data immediately
    guest_data = {
        "name": f"Guest {order.table_number}", 
        "spend": order.total_amount,
        "preferences": {"last_order": [i.name for i in order.items]}
    }
    reconciler.reconcile(guest_data)
    
    # Add to "Toast" (mock)
    toast_client.add_order(order)
    
    # Sync with Table Data (for frontend display)
    if order.table_number:
        for i, t in enumerate(tables_db):
            if t.number == order.table_number:
                # Update table
                updated_items = t.items + [item.name for item in order.items]
                updated_total = (t.orderTotal or 0.0) + order.total_amount
                
                # Determine course based on items
                current_course = t.currentCourse
                item_names = [i.name.lower() for i in order.items]
                if any('dessert' in n or 'cake' in n for n in item_names):
                    current_course = 'dessert'
                elif any('steak' in n or 'main' in n for n in item_names):
                    current_course = 'mains'
                elif any('salad' in n or 'app' in n for n in item_names):
                    current_course = 'apps'
                elif any('drink' in n or 'wine' in n for n in item_names) and current_course == 'seated':
                    current_course = 'drinks'

                tables_db[i] = t.copy(update={
                    "items": updated_items,
                    "orderTotal": updated_total,
                    "currentCourse": current_course
                })
                break

    return order


@router.get("/orders", response_model=List[Order])
async def get_recent_orders():
    """
    Get all active orders (for Kitchen Display or Manager Dash).
    Fetches fresh data from Toast.
    """
    # specific logic to fetch from toast
    toast_orders = await toast_client.get_orders()
    
    # Reconcile all fetched orders
    for order in toast_orders:
        guest_data = {
            "name": f"Guest {order.table_number}", 
            "spend": order.total_amount,
            "preferences": {"last_order": [i.name for i in order.items]}
        }
        reconciler.reconcile(guest_data)
        
    return toast_orders

@router.get("/insights")
async def get_dashboard_insights():
    """
    Get AI-generated insights for the dashboard.
    """
    return [await ai_engine.generate_insight("general") for _ in range(3)]

@router.get("/guests/{guest_id}", response_model=GuestProfile)
def get_guest_profile(guest_id: str):
    """
    Retrieve unified guest profile.
    """
    # Mock return
    return GuestProfile(
        name="James Bond",
        vip_status=True,
        dietary_restrictions=["Gluten Free", "Shaken not stirred"],
        preferences={"wine": "Bollinger", "table": "Corner backend"}
    )


@router.get("/kitchen/queue")
async def get_kitchen_queue():
    """
    Get the optimized kitchen queue (KDS View).
    Returns orders with 'fire_at' times and station assignments.
    """
    # 1. Fetch active orders
    toast_orders: List[Order] = await toast_client.get_orders()
    print(f"DEBUG: Fetched {len(toast_orders)} orders from ToastClient")

    kitchen_queue = []
    
    for order in toast_orders:
        if order.status == "delivered":
            continue # Skip delivered orders
            
        print(f"DEBUG: Processing Order {order.id} with {len(order.items)} items")
        # Convert OrderItems to dict for optimizer
        items_dict = [
            {
                "item_id": i.item_id, 
                "name": i.name, 
                "quantity": i.quantity,
                "station": i.station,
                "course": i.course
            } for i in order.items
        ]
        
        # 2. Run Optimization
        optimization_plan = kitchen_optimizer.optimize_order(items_dict, order.table_number)
        
        # If order is marked ready (kitchen bumped), ensure items show as ready
        if order.status == 'ready':
             for item in order.items:
                 if item.item_id not in optimization_plan:
                     # Add back completed items with ready status
                     optimization_plan[item.item_id] = {
                         "name": item.name,
                         "station": item.station or "expo",
                         "fire_at": order.created_at.isoformat().replace("+00:00", "Z"),
                         "status": "ready"
                     }

        # 3. Augment order with plan
        # Only add if there are items to show (or it's ready/new)
        if optimization_plan or order.status in ['new', 'open', 'ready']:
            kitchen_queue.append({
                "order_id": order.id,
                "table": order.table_number,
                "status": order.status,
                "server": order.server,
                "created_at": order.created_at.isoformat().replace("+00:00", "Z"),
                "items": optimization_plan
            })
        
    return kitchen_queue

@router.post("/kitchen/bump/{item_id}")
async def bump_item(item_id: str):
    """
    Mark an item as complete (Bump).
    """
    kitchen_optimizer.mark_item_complete(item_id)
    return {"status": "bumped", "item_id": item_id}

@router.post("/kitchen/bump-order/{order_id}")
async def bump_order(order_id: str):
    """
    Kitchen Bump: Mark order as Ready for Server.
    """
    order = next((o for o in toast_client.active_orders if o.id == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Mark items complete in optimizer (so they stop firing)
    items_dict = [{"item_id": i.item_id} for i in order.items]
    kitchen_optimizer.mark_order_complete(items_dict)
    
    # Set status to 'ready' (Visible to Server, Hidden from KDS via frontend filter)
    order.status = "ready"
    
    return {"status": "ready", "order_id": order_id}

@router.post("/kitchen/deliver-order/{order_id}")
async def deliver_order(order_id: str):
    """
    Server Bump: Mark order as Delivered (Closed).
    """
    order = next((o for o in toast_client.active_orders if o.id == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = "delivered"
    # Could remove from active_orders here if we want strict archiving
    # toast_client.active_orders.remove(order)
    
    return {"status": "delivered", "order_id": order_id}

@router.patch("/kitchen/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str):
    """
    Update order status (new, cooking, ready, delivered).
    """
    order = next((o for o in toast_client.active_orders if o.id == order_id), None)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status
    return {"status": status, "order_id": order_id}

# --- Seating & Waitlist Management (In-Memory for Demo) ---

# Initial Data (Matching Frontend)
tables_db: List[TableData] = []

# Generate 40 tables programmatically
rows: int = 5
cols: int = 8
x_start: int = 10
y_start: int = 10
x_spacing: int = 20
y_spacing: int = 15

SERVERS: List[str] = ["Maria", "James", "Sarah", "David", "Michael"]

# Global System Status
system_running: bool = False

@router.get("/system/status")
def get_system_status():
    return {"running": system_running}

@router.post("/system/start")
def start_system():
    global system_running
    system_running = True
    return {"status": "running"}

@router.post("/system/stop")
def stop_system():
    global system_running
    system_running = False
    return {"status": "stopped"}

# Bartender Section Assignments (4 bartenders, 10 tables each)
BARTENDERS: List[Dict[str, Any]] = [
    {"id": "b1", "name": "Alex", "tables": list(range(1, 11))},      # Tables 1-10
    {"id": "b2", "name": "Jordan", "tables": list(range(11, 21))},   # Tables 11-20
    {"id": "b3", "name": "Taylor", "tables": list(range(21, 31))},   # Tables 21-30
    {"id": "b4", "name": "Casey", "tables": list(range(31, 41))},    # Tables 31-40
]

def get_bartender_for_table(table_number: int) -> dict:
    """Returns the bartender responsible for a given table number."""
    bartender: Dict[str, Any]
    for bartender in BARTENDERS:
        if table_number in bartender["tables"]:
            return bartender
    return BARTENDERS[0]  # Default to first bartender

def initialize_tables():
    global tables_db
    server_count: int = len(SERVERS)
    i: int
    for i in range(rows * cols):
        # Calculate row and column
        r: int = i // cols
        c: int = i % cols
        current_count: int = i + 1
        
        # Mix capacities
        cap: int = 4
        if current_count % 3 == 0: cap = 2
        elif current_count % 5 == 0: cap = 6
        elif current_count % 7 == 0: cap = 8

        # Tighter packing to fit 8 cols in 0-100 range
        t_x: int = 5 + (c * 11)
        t_y: int = 10 + (r * 18)

        # Assign server round-robin
        server_idx: int = (current_count - 1) % server_count
        assigned_server: str = SERVERS[server_idx]

        tables_db.append(TableData(
            id=f"t{current_count}",
            number=current_count,
            capacity=cap,
            x=t_x,
            y=t_y,
            status="available",
            server=assigned_server,
            paymentStatus="none",
            orderTotal=0.0,
            items=[]
        ))

initialize_tables()


waitlist_db: List[GuestToSeat] = [
    GuestToSeat(id='w1', name='Anderson, Robert', party=4, isVip=True, notes='Celebrating promotion', source='waitlist'),
    GuestToSeat(id='w2', name='Kim, Jessica', party=2, isVip=False, source='waitlist'),
    GuestToSeat(id='w3', name='Martinez, Carlos', party=6, isVip=False, notes='Large party', source='waitlist'),
]

@router.get("/tables", response_model=List[TableData])
def get_tables():
    return tables_db

@router.put("/tables/{table_id}")
def update_table(table_id: str, table_data: TableData):
    for i, t in enumerate(tables_db):
        if t.id == table_id:
            tables_db[i] = table_data
            return table_data
    raise HTTPException(status_code=404, detail="Table not found")

@router.post("/tables/{table_id}/seat")
def seat_table(table_id: str, guest: GuestToSeat):
    for i, t in enumerate(tables_db):
        if t.id == table_id:
            # Update table
            updated_table = t.copy(update={
                "status": "occupied",
                "guestName": guest.name,
                "guestCount": guest.party,
                "seatedAt": time.time() * 1000,
                "isVip": guest.isVip,
            })
            tables_db[i] = updated_table
            
            # Remove from waitlist if present
            global waitlist_db
            waitlist_db = [w for w in waitlist_db if w.id != guest.id]
            
            return updated_table
    raise HTTPException(status_code=404, detail="Table not found")

@router.post("/tables/{table_id}/clear")
def clear_table(table_id: str):
    for i, t in enumerate(tables_db):
        if t.id == table_id:
            updated_table = t.copy(update={
                "status": "available",
                "guestName": None,
                "guestCount": None,
                "seatedAt": None,
                "isVip": None,
                "currentCourse": "seated",
                "paymentStatus": "none",
                "orderTotal": 0.0,
                "items": []
            })
            tables_db[i] = updated_table
            return updated_table
    raise HTTPException(status_code=404, detail="Table not found")

@router.get("/waitlist", response_model=List[GuestToSeat])
def get_waitlist():
    return waitlist_db

@router.post("/waitlist")
def add_to_waitlist(guest: GuestToSeat):
    waitlist_db.append(guest)
    return guest

@router.delete("/waitlist/{guest_id}")
def remove_from_waitlist(guest_id: str):
    global waitlist_db
    waitlist_db = [w for w in waitlist_db if w.id != guest_id]
    return {"status": "removed", "guest_id": guest_id}

@router.post("/system/reset")
def reset_system():
    """
    Reset the system to 'Beginning of Shift' state.
    Clears all orders, waitlist, and resets tables to available.
    Also stops the simulation.
    """
    global system_running
    system_running = False
    # 1. Clear Orders
    toast_client.active_orders = []
    
    # 2. Clear Kitchen Optimizer state
    kitchen_optimizer.completed_items.clear()
    kitchen_optimizer.station_load = {}
    
    # 3. Clear Waitlist
    global waitlist_db
    waitlist_db = []
    
    # 4. Reset Tables
    # We keep the physical layout (id, number, capacity, x, y) but clear booking data
    for i, t in enumerate(tables_db):
        tables_db[i] = t.copy(update={
            "status": "available",
            "guestName": None,
            "guestCount": None,
            "seatedAt": None,
            "isVip": None,
            "currentCourse": "seated",
            "paymentStatus": "none",
            "orderTotal": 0.0,
            "items": []
        })
    
    return {"status": "reset", "message": "System reset to beginning of shift"}
        

@router.post("/system/auto-seat")
def auto_seat_guests():
    """
    Auto-seats guests from the waitlist to available tables.
    Matches first available table with sufficient capacity.
    """
    seated_log = []
    
    global waitlist_db, tables_db
    
    # Sort waitlist by VIP status then arrival (mock arrival via index)
    sorted_waitlist = sorted(waitlist_db, key=lambda x: (not x.isVip))
    
    guests_to_remove = []
    
    for guest in sorted_waitlist:
        # Find a suitable table
        # Strategy: Best fit (smallest capacity >= party size)
        suitable_tables = [
            t for t in tables_db 
            if t.status == 'available' and t.capacity >= guest.party
        ]
        
        if not suitable_tables:
            continue
            
        # Sort by capacity to find best fit
        suitable_tables.sort(key=lambda t: t.capacity)
        selected_table = suitable_tables[0]
        
        # Seat the guest
        # Update table
        for i, t in enumerate(tables_db):
            if t.id == selected_table.id:
                tables_db[i] = t.copy(update={
                    "status": "occupied",
                    "guestName": guest.name,
                    "guestCount": guest.party,
                    "seatedAt": time.time() * 1000,
                    "isVip": guest.isVip,
                })
                break
        
        guests_to_remove.append(guest.id)
        seated_log.append(f"Seated {guest.name} at Table {selected_table.number}")
        
    # Remove seated guests from waitlist
    waitlist_db = [w for w in waitlist_db if w.id not in guests_to_remove]
    
    return {"status": "success", "seated": seated_log}

# --- Bartender Endpoints ---

@router.get("/bartenders")
def get_bartenders():
    """Get all bartenders with their section assignments."""
    return BARTENDERS

@router.get("/bar/queue")
async def get_bar_queue():
    """
    Get drink orders grouped by bartender section.
    Returns orders with drink items filtered and bartender assigned.
    """
    toast_orders = await toast_client.get_orders()
    
    bar_queue = []
    
    for order in toast_orders:
        if order.status == "delivered":
            continue
            
        # Filter to only drink items
        drink_items = [
            item for item in order.items 
            if item.station and item.station.lower() == "bar"
        ]
        
        if not drink_items:
            continue
            
        # Get bartender for this table
        bartender = get_bartender_for_table(order.table_number)
        
        bar_queue.append({
            "order_id": order.id,
            "table": order.table_number,
            "status": order.status,
            "server": order.server,
            "bartender": bartender["name"],
            "bartender_id": bartender["id"],
            "created_at": order.created_at.isoformat().replace("+00:00", "Z"),
            "items": [
                {
                    "item_id": item.item_id,
                    "name": item.name,
                    "quantity": item.quantity,
                    "station": item.station,
                    "course": item.course
                } for item in drink_items
            ]
        })
    
    return bar_queue
