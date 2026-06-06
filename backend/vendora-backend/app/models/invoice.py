from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class InvoiceCreate(BaseModel):
    po_id: str
    invoice_date: Optional[date] = None
    payment_due_date: Optional[date] = None
    tax_type: str = "cgst_sgst"
    freight_charges: float = 0
    handling_charges: float = 0
    notes: Optional[str] = None

class InvoiceUpdateStatus(BaseModel):
    status: str

class InvoiceOut(BaseModel):
    id: str
    invoice_number: str
    po_id: str
    vendor_id: str
    created_by: str
    status: str
    invoice_date: date
    payment_due_date: Optional[date]
    tax_type: str
    freight_charges: float
    handling_charges: float
    subtotal: float
    tax_amount: float
    total_amount: float
    notes: Optional[str]
    pdf_url: Optional[str]
    emailed_at: Optional[datetime]
    created_at: datetime
