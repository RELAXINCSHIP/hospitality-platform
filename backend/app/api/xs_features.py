from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import get_db
from app.db.xs_models import XSSection, XSBottleItem, XSStaffAssignment, XSTable
from app.db.models import Staff  # Import main Staff model to seed staff
import uuid

router = APIRouter()

# --- Request Models ---
class StaffAssignmentRequest(BaseModel):
    staff_id: str
    section_id: str
    role: str # BOTTLE_GIRL, BUSSER, HOST

class SectionCreate(BaseModel):
    name: str
    capacity: int
    min_spend: float

# --- Endpoints ---

@router.post("/setup")
def setup_xs_data(db: Session = Depends(get_db)):
    """
    Seed initial XS Nightclub data with Real-World XS Las Vegas details.
    """
    import logging
    import traceback
    try:
        # clear existing XS data to avoid duplicates/conflicts during re-seed (optional, but good for dev)
        # For now, we'll just check if *any* section exists. 
        # In a real "Reset" scenario we might want to delete first, but let's stick to "Current" logic.
        if db.query(XSSection).first():
            # Ideally we'd update, but let's just return for now or maybe wipe?
            # Let's wipe to ensure fresh data for this "Research" update.
            db.query(XSTable).delete()
            db.query(XSSection).delete()
            db.query(XSBottleItem).delete()
            # Note: Not deleting Staff as they might be shared, but we can verify/add new ones.
            db.commit()
        
        # 1. Create Sections (Based on XS Layout)
        sections_data = [
            {"name": "Stage Tables", "capacity": 20, "min_spend": 15000.0},
            {"name": "Owner's Booth", "capacity": 25, "min_spend": 20000.0},
            {"name": "Dance Floor Lower", "capacity": 15, "min_spend": 8000.0},
            {"name": "Upper VIP", "capacity": 12, "min_spend": 4000.0},
            {"name": "Back Wall Booths", "capacity": 10, "min_spend": 2500.0},
            {"name": "Outdoor Patio", "capacity": 8, "min_spend": 1500.0},
            {"name": "Poolside Cabanas", "capacity": 15, "min_spend": 3000.0},
        ]
        
        created_sections = {}
        for s_data in sections_data:
            section = XSSection(name=s_data["name"], capacity=s_data["capacity"], min_spend=s_data["min_spend"])
            db.add(section)
            db.commit() # Commit to get ID
            db.refresh(section)
            created_sections[s_data["name"]] = section.id

            # Add Tables to Section
            # Generate 4-6 tables per section
            for i in range(1, 6):
                # Format: ST-1, DF-1, etc.
                prefix = s_data["name"].split()[0][:2].upper()
                table = XSTable(section_id=section.id, table_number=f"{prefix}-{i}")
                db.add(table)
        
        db.commit()

        # 2. Create Bottle Menu (2024 Pricing)
        menu_items = [
            # CHAMPAGNE
            XSBottleItem(name="Ace of Spades Gold", category="CHAMPAGNE", price=1600.0, size="750ml"),
            XSBottleItem(name="Dom Perignon Luminous", category="CHAMPAGNE", price=850.0, size="750ml"),
            XSBottleItem(name="Moet & Chandon Imperial", category="CHAMPAGNE", price=550.0, size="750ml"),
            XSBottleItem(name="Perrier-Jouet Belle Epoque", category="CHAMPAGNE", price=750.0, size="750ml"),
            
            # VODKA
            XSBottleItem(name="Grey Goose", category="VODKA", price=695.0, size="750ml"),
            XSBottleItem(name="Grey Goose Magnum", category="VODKA", price=1295.0, size="1.75L"),
            XSBottleItem(name="Belvedere", category="VODKA", price=695.0, size="750ml"),
            XSBottleItem(name="Tito's Handmade", category="VODKA", price=625.0, size="750ml"),
            XSBottleItem(name="Absolut Elyx", category="VODKA", price=625.0, size="750ml"),

            # TEQUILA
            XSBottleItem(name="Casamigos Blanco", category="TEQUILA", price=675.0, size="750ml"),
            XSBottleItem(name="Casamigos Reposado", category="TEQUILA", price=725.0, size="750ml"),
            XSBottleItem(name="Don Julio 1942", category="TEQUILA", price=900.0, size="750ml"),
            XSBottleItem(name="Clase Azul Reposado", category="TEQUILA", price=850.0, size="750ml"),
            
            # WHISKEY/COGNAC
            XSBottleItem(name="Hennessy VSOP", category="COGNAC", price=750.0, size="750ml"),
            XSBottleItem(name="Johnnie Walker Blue", category="WHISKEY", price=1200.0, size="750ml"),
            XSBottleItem(name="Jameson", category="WHISKEY", price=625.0, size="750ml"),
        ]
        for item in menu_items:
            db.add(item)
        
        # 3. Seed XS Staff if they don't exist
        staff_roster = [
            {"name": "Jessica Miller", "role": "BOTTLE_MODEL", "rank": 5},
            {"name": "Sarah Jenkins", "role": "BOTTLE_MODEL", "rank": 4},
            {"name": "Tiffany Chen", "role": "BOTTLE_MODEL", "rank": 5},
            {"name": "Mike Ross", "role": "VIP_HOST", "rank": 4},
            {"name": "David Stone", "role": "VIP_HOST", "rank": 3},
            {"name": "Big Tony", "role": "SECURITY", "rank": 3},
            {"name": "Kevin Hart (Not that one)", "role": "BUSSER", "rank": 2},
            {"name": "Marcus L", "role": "BUSSER", "rank": 2},
            {"name": "Emily Rose", "role": "BOTTLE_MODEL", "rank": 3},
            {"name": "Chef Gordon", "role": "MANAGER", "rank": 5}, # Ops Manager
        ]

        for s in staff_roster:
            # Check if exists by name to avoid dupes
            existing = db.query(Staff).filter(Staff.name == s["name"]).first()
            if not existing:
                new_staff = Staff(
                    id=str(uuid.uuid4()),
                    name=s["name"],
                    role=s["role"],
                    velocity_rank=s["rank"],
                    shift_status="ON_DUTY"
                )
                db.add(new_staff)

        db.commit()
        return {"status": "initialized", "message": "XS Nightclub setup complete with Premium Research Data"}
    except Exception as e:
        print(f"Setup Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/menu", response_model=List[dict])
def get_bottle_menu(db: Session = Depends(get_db)):
    """
    Get the Bottle Service Menu.
    """
    items = db.query(XSBottleItem).filter(XSBottleItem.is_available == True).all()
    return [{"id": i.id, "name": i.name, "category": i.category, "price": i.price, "size": i.size} for i in items]

@router.get("/layout")
def get_floor_layout(db: Session = Depends(get_db)):
    """
    Get the current status of the Nightclub Floor.
    """
    sections = db.query(XSSection).all()
    layout = []
    for section in sections:
        tables = db.query(XSTable).filter(XSTable.section_id == section.id).all()
        layout.append({
            "section_id": section.id,
            "name": section.name,
            "min_spend": section.min_spend,
            "tables": [{"number": t.table_number, "status": t.status, "id": t.id} for t in tables]
        })
    return layout

@router.post("/assign-staff")
def assign_staff(request: StaffAssignmentRequest, db: Session = Depends(get_db)):
    """
    Assign staff to specific XS Sections.
    """
    new_assignment = XSStaffAssignment(
        staff_id=request.staff_id,
        section_id=request.section_id,
        role_today=request.role
    )
    db.add(new_assignment)
    db.commit()
    return {"status": "assigned", "role": request.role}

@router.get("/staff")
def get_xs_staff_roster(db: Session = Depends(get_db)):
    """
    Get all eligible staff for XS Nightclub.
    """
    # Filter for nightclub roles
    roles = ["BOTTLE_MODEL", "VIP_HOST", "SECURITY", "BUSSER", "MANAGER"]
    staff = db.query(Staff).filter(Staff.role.in_(roles)).all()
    return [{"id": s.id, "name": s.name, "role": s.role, "status": s.shift_status, "rank": s.velocity_rank} for s in staff]
