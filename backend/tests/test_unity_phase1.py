
import pytest
from app.core.unity_os import UnityController

@pytest.fixture
def unity():
    return UnityController(distro="WYNN_INFRASTRUCTURE")

def test_valet_handshake_retail_mode(unity):
    # ETA > 60m should trigger Retail Mode
    result = unity.valet_arrival_handshake("guest_123", 75)
    assert result["intent"] == "NAV_RETAIL"
    assert "Explore" in result["message"]

def test_valet_handshake_prep_mode(unity):
    # ETA < 15m should trigger Prep Mode
    result = unity.valet_arrival_handshake("guest_123", 10)
    assert result["intent"] == "PREP_TABLE"
    assert "Fire welcome" in result["message"]

def test_valet_handshake_chairman_notification(unity):
    # Chairman guest should trigger Butler alert
    result = unity.valet_arrival_handshake("guest_CHAIRMAN_001", 10)
    assert result["notification"] == "ALERT_BUTLER_TEAM"

def test_meritocracy_seating_denied(unity):
    # Tier 1 server (mock rank based on len("Bob")=3) expecting failure on high min table (>15000)
    # MockVenueDB returns 15000 for id > 500
    # MockStaffDB returns len(name) as rank
    
    # "Bob" -> len 3 -> Rank 3. Table 600 -> $15000.
    # Requirement: Rank 5 for $15k+. 
    # Logic in code: if table_min >= 15000 and rank < 5: DENIED
    
    result = unity.assign_seating("Bob", "600") 
    assert "DENIED" in result

def test_meritocracy_seating_approved(unity):
    # "Sarah" -> len 5 -> Rank 5. Table 600 -> $15000.
    result = unity.assign_seating("Sarah", "600")
    assert "ASSIGNED" in result

def test_vault_audit_failure(unity):
    # Table 500 -> even ID -> MockPOS returns True (Sale exists)
    # Table 501 -> odd ID -> MockPOS returns False (No Sale)
    
    # We want a failure, so use Odd ID
    result = unity.trigger_parade_audit("501", "staff_1")
    assert "AUDIT_FAILED" in result
    assert "Unauthorized Show" in result

def test_vault_audit_success(unity):
    # Use Even ID for success
    result = unity.trigger_parade_audit("502", "staff_1")
    assert "AUDIT_PASSED" in result
