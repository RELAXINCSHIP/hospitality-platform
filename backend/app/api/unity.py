from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel
from app.core.unity_os import unity_wynn

router = APIRouter()

# --- Request Models ---
class ValetArrivalRequest(BaseModel):
    guest_id: str
    eta_minutes: int

class AuditRequest(BaseModel):
    table_id: str
    staff_id: str

class SeatingRequest(BaseModel):
    server_id: str
    table_id: str

# --- Endpoints ---

@router.post("/valet/handshake")
def valet_handshake(request: ValetArrivalRequest):
    """
    Trigger Valet LPR -> Floor Plan Logic.
    """
    result = unity_wynn.valet_arrival_handshake(request.guest_id, request.eta_minutes)
    return result

@router.post("/vault/audit")
def trigger_audit(request: AuditRequest):
    """
    The Vault: Show-to-Sale Reconciliation.
    """
    result = unity_wynn.trigger_parade_audit(request.table_id, request.staff_id)
    if "FAILED" in result:
        raise HTTPException(status_code=400, detail=result)
    return {"status": "success", "message": result}

@router.post("/staff/assign-table")
def assign_table(request: SeatingRequest):
    """
    Meritocracy Logic: Check Server Velocity vs Table Min.
    """
    result = unity_wynn.assign_seating(request.server_id, request.table_id)
    if "DENIED" in result:
        raise HTTPException(status_code=403, detail=result)
    return {"status": "assigned", "message": result}

@router.get("/config")
def get_config():
    """
    Return Unity OS Configuration (Distros, Locations).
    """
    from app.core.unity_os import UnityConfig
    return {
        "project": UnityConfig.PROJECT_NAME,
        "distros": UnityConfig.DISTROS,
        "locations": UnityConfig.LOCATIONS,
        "tiers": UnityConfig.TIERS
    }
