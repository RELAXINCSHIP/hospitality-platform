from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from uuid import UUID, uuid4

class GuestProfile(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    vip_status: bool = False
    dietary_restrictions: List[str] = []
    lifetime_spend: float = 0.0
    preferences: Dict[str, Any] = {}

class OrderItem(BaseModel):
    item_id: str
    name: str
    quantity: int
    price: float
    special_requests: List[str] = []
    station: Optional[str] = None
    course: Optional[str] = None

class Order(BaseModel):
    id: str  # External ID from POS
    source: str = "toast"  # toast, square, etc.
    table_number: Optional[int] = None
    guest_count: int = 1
    items: List[OrderItem]
    total_amount: float
    status: str = "open"  # open, fired, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    server: Optional[str] = None

class TableData(BaseModel):
    id: str
    number: int
    capacity: int
    x: int
    y: int
    status: str  # available, occupied, reserved, alert
    guestName: Optional[str] = None
    guestCount: Optional[int] = None
    seatedAt: Optional[float] = None
    isVip: Optional[bool] = None
    reservationId: Optional[str] = None
    server: Optional[str] = None
    currentCourse: Optional[str] = None
    orderTotal: Optional[float] = 0.0
    paymentStatus: Optional[str] = "none"  # none, requested, paid
    items: List[str] = []

class GuestToSeat(BaseModel):
    id: str
    name: str
    party: int
    isVip: bool
    notes: Optional[str] = None
    source: str  # reservation, waitlist, walkin
