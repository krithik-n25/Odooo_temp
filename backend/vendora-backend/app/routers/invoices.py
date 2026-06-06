from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.user import UserOut
from app.models.invoice import InvoiceCreate, InvoiceUpdateStatus, InvoiceOut
from app.services import invoice_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[InvoiceOut])
def get_invoices(vendor_id: Optional[str] = None, user: UserOut = Depends(get_current_user)):
    return invoice_service.list_invoices(vendor_id)

@router.post("/", response_model=InvoiceOut)
def create_invoice(data: InvoiceCreate, user: UserOut = Depends(require_role("vendor", "officer", "manager", "admin"))):
    return invoice_service.create_invoice(data, user.id)

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: str, user: UserOut = Depends(get_current_user)):
    return invoice_service.get_invoice(invoice_id)

@router.patch("/{invoice_id}/status", response_model=InvoiceOut)
def update_invoice_status(invoice_id: str, data: InvoiceUpdateStatus, user: UserOut = Depends(get_current_user)):
    return invoice_service.update_invoice_status(invoice_id, data.status)
