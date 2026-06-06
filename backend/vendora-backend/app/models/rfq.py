from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RFQItemCreate(BaseModel):
    item_name: str
    specification: Optional[str] = None
    quantity: int
    unit: str = "units"
    target_price: Optional[float] = None

class RFQItemOut(RFQItemCreate):
    id: str
    rfq_id: str

class RFQCreate(BaseModel):
    title: str
    category: Optional[str] = None
    priority: str = "standard"
    deadline: datetime
    notes: Optional[str] = None
    items: List[RFQItemCreate]
    vendor_ids: List[str] = [] # Invite vendors at creation

class RFQUpdateStatus(BaseModel):
    status: str

class RFQOut(BaseModel):
    id: str
    rfq_number: str
    title: str
    category: Optional[str]
    priority: str
    status: str
    deadline: datetime
    notes: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: datetime
    items: Optional[List[RFQItemOut]] = []
