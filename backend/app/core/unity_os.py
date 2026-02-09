import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel

# --- Configuration ---
class UnityConfig:
    PROJECT_NAME = "Unity OS"
    DISTROS = ["WYNN_INFRASTRUCTURE", "HWOOD_CULTURE"]
    LOCATIONS = {
        "WYNN": ["XS Nightclub", "Encore Beach Club", "Delilah", "SW"],
        "HWOOD": ["The Nice Guy", "Bootsy Bellows", "Delilah LA"]
    }
    TIERS = ["CHAIRMAN", "VVIP", "VIP", "INCOGNITO"]

# --- Mock Databases (Interfaces) ---
class MockPOS:
    def verify_bottle_sale(self, table_id: str, window_minutes: int) -> bool:
        # Mock logic: Returns True if table_id is even, simulating a sale
        # In prod, this queries Toast/Micros
        try:
            return int(table_id) % 2 == 0
        except:
            return False

class MockStaffDB:
    def get_velocity_rank(self, staff_id: str) -> int:
        # Mock logic: Returns rank 1-5 based on staff_id length
        # 5 = Top Closer, 1 = Trainee
        return min(len(staff_id), 5)

class MockVenueDB:
    def get_table_min(self, table_id: str) -> float:
        # Mock logic: Table IDs > 500 are high rollers
        try:
            return 15000.0 if int(table_id) > 500 else 2000.0
        except:
            return 1000.0

# --- Core Controller ---
class UnityController:
    def __init__(self, distro: str = "WYNN_INFRASTRUCTURE"):
        self.distro = distro
        self.audit_log: List[Dict] = []
        # In a real scenario, these would be repositories or API clients
        self.pos = MockPOS()
        self.staff_db = MockStaffDB()
        self.venue_db = MockVenueDB()

    def valet_arrival_handshake(self, guest_id: str, eta_minutes: int) -> Dict:
        """
        Bridge Valet LPR to Floor Plan.
        Wynn Logic: High volume logistics.
        """
        # Logic: > 60m -> Retail Mode, < 15m -> Pre-Dinner Mode
        if eta_minutes > 60:
            action = "NAV_RETAIL"
            message = "Welcome to Wynn. Explore the Esplanade."
        elif eta_minutes < 15:
            action = "PREP_TABLE"
            message = "Heading to Venue. Fire welcome drinks."
        else:
            action = "STANDBY"
            message = f"Guest arriving in {eta_minutes} mins."
        
        # Wynn Specific: Auto-notify butler for Chairman tier
        notification_type = "PUSH_TO_WYNN_APP"
        if "CHAIRMAN" in guest_id: # Mock tier check
             notification_type = "ALERT_BUTLER_TEAM"

        return {
            "guest_id": guest_id,
            "distro": self.distro,
            "intent": action,
            "message": message,
            "notification": notification_type,
            "timestamp": datetime.datetime.now().isoformat()
        }

    def trigger_parade_audit(self, table_id: str, staff_id: str) -> str:
        """
        The Vault: Show-to-Sale Reconciliation.
        Ensures no 'illegal' shows (sparklers/confetti without paying).
        """
        # Check if DMX 'Show' signal has a matching $2k+ sale
        # In this mock, we assume verify_bottle_sale checks for >$2000 sale in last 15 mins
        has_sale = self.pos.verify_bottle_sale(table_id, window_minutes=15)
        
        if not has_sale:
            self.flag_anomaly(table_id, staff_id, "UNAUTHORIZED_SHOW")
            return "AUDIT_FAILED: Unauthorized Show Detected. Manager Notified."
        
        return "AUDIT_PASSED: Sale Verified."

    def assign_seating(self, server_id: str, table_id: str) -> str:
        """
        Meritocracy Logic: Pair Top Closers with High Minimums.
        """
        rank = self.staff_db.get_velocity_rank(server_id)
        table_min = self.venue_db.get_table_min(table_id)
        
        # Wynn Logic: Tier 5 required for Stage/Owner tables (approx > $10k min)
        if table_min >= 15000 and rank < 5:
            return f"DENIED: Table {table_id} (${table_min}) requires Tier 5 Server (Current Rank: {rank})"
            
        return "ASSIGNED: Staff Velocity Verified."

    def flag_anomaly(self, table_id: str, staff_id: str, issue_type: str):
        self.audit_log.append({
            "type": "REVENUE_LEAK",
            "issue": issue_type,
            "table": table_id,
            "staff": staff_id,
            "timestamp": datetime.datetime.now().isoformat()
        })
        print(f"!!! SECURITY ALERT: {issue_type} at Table {table_id} by Staff {staff_id} !!!")

# Global Instance for Wynn (Default)
unity_wynn = UnityController(distro="WYNN_INFRASTRUCTURE")
