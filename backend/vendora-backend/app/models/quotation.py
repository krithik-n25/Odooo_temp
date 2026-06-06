from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class QuotationItemCreate(BaseModel):
    rfq_item_id: str
    unit_price: float
    availability: str = "in_stock"

class QuotationItemOut(QuotationItemCreate):
    id: str
    quotation_id: str
    total_price: float

class QuotationCreate(BaseModel):
    rfq_id: str
    valid_until: Optional[date] = None
    gst_rate: float = 18.0
    payment_terms: str = "30 days NET"
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    confidence_level: Optional[str] = None
    items: List[QuotationItemCreate]

class QuotationUpdateStatus(BaseModel):
    status: str

class QuotationOut(BaseModel):
    id: str
    rfq_id: str
    vendor_id: str
    status: str
    valid_until: Optional[date]
    gst_rate: float
    payment_terms: str
    delivery_days: Optional[int]
    notes: Optional[str]
    confidence_level: Optional[str]
    subtotal: float
    gst_amount: float
    total_amount: float
    submitted_at: Optional[datetime]
    created_at: datetime
    items: Optional[List[QuotationItemOut]] = []
