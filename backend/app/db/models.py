from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class Guest(Base):
    __tablename__ = "guests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, nullable=True)
    vip_status = Column(Boolean, default=False)
    lifetime_spend = Column(Float, default=0.0)
    preferences = Column(JSON, default={}) # Using JSON instead of JSONB for SQLite compat in dev
    influence_score = Column(Integer, default=0)
    privacy_toggle = Column(Boolean, default=False) # h.wood Rolodex Privacy
    velocity_history = Column(JSON, default=[]) # List of past spend velocity [date, amount, venue]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="guest")
    visits = relationship("Visit", back_populates="guest")

class Staff(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    role = Column(String, nullable=False) # SERVER, BARTENDER, RUNNER, MANAGER
    velocity_rank = Column(Integer, default=1) # 1-5 Meritocracy Score
    shift_status = Column(String, default="OFF") # ON_DUTY, OFF, BREAK


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True) # External ID from Toast
    guest_id = Column(String, ForeignKey("guests.id"), nullable=True)
    table_number = Column(Integer)
    guest_count = Column(Integer, default=1)
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)

    guest = relationship("Guest", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"))
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    special_requests = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")

class Visit(Base):
    __tablename__ = "visits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    guest_id = Column(String, ForeignKey("guests.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    table_number = Column(Integer)
    server_name = Column(String, nullable=True)
    tip_amount = Column(Float, nullable=True)

    guest = relationship("Guest", back_populates="visits")
