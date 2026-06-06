from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class POCreate(BaseModel):
    rfq_id: str
    quotation_id: str
    approval_id: str
    vendor_id: str
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None
    expected_delivery_date: Optional[date] = None

class POUpdateStatus(BaseModel):
    status: str

class POOut(BaseModel):
    id: str
    po_number: str
    rfq_id: str
    quotation_id: str
    approval_id: str
    vendor_id: str
    created_by: str
    status: str
    delivery_address: Optional[str]
    special_instructions: Optional[str]
    expected_delivery_date: Optional[date]
    subtotal: float
    gst_amount: float
    total_amount: float
    pdf_url: Optional[str]
    created_at: datetime
    updated_at: datetime
