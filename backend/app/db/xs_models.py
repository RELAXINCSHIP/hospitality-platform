from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class XSSection(Base):
    __tablename__ = "xs_sections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)  # e.g., "Dance Floor", "VIP Type 1"
    capacity = Column(Integer, default=10)
    min_spend = Column(Float, default=1000.0)
    is_open = Column(Boolean, default=True)
    
    tables = relationship("XSTable", back_populates="section")


class XSTable(Base):
    __tablename__ = "xs_tables"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id = Column(String, ForeignKey("xs_sections.id"))
    table_number = Column(String, nullable=False) # e.g., "VIP-101"
    status = Column(String, default="AVAILABLE") # AVAILABLE, OCCUPIED, RESERVED
    current_tab_id = Column(String, nullable=True) # Link to active order/tab
    
    section = relationship("XSSection", back_populates="tables")


class XSBottleItem(Base):
    __tablename__ = "xs_bottle_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False) # e.g., "Ace of Spades", "Grey Goose Mag"
    category = Column(String, nullable=False) # VODKA, TEQUILA, CHAMPAIGN
    price = Column(Float, nullable=False)
    size = Column(String, default="750ml")
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)


class XSStaffAssignment(Base):
    __tablename__ = "xs_staff_assignments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(String, ForeignKey("staff.id"))
    section_id = Column(String, ForeignKey("xs_sections.id"), nullable=True)
    role_today = Column(String, default="BOTTLE_GIRL") # BOTTLE_GIRL, BUSSER, SECURITY, HOST
    shift_start = Column(DateTime, default=datetime.utcnow)
    shift_end = Column(DateTime, nullable=True)

