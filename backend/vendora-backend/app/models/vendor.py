from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class VendorCreate(BaseModel):
    company_name: str
    gstin: Optional[str] = None
    category: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None

class VendorUpdate(BaseModel):
    status: Optional[str] = None
    rating: Optional[float] = None
    trust_score: Optional[int] = None
    
class VendorOut(VendorCreate):
    id: str
    user_id: Optional[str] = None
    status: str
    rating: float
    trust_score: int
    total_orders: int
    created_at: datetime
