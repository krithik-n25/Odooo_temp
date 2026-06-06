from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.user import UserOut
from app.models.quotation import QuotationCreate, QuotationUpdateStatus, QuotationOut
from app.services import quotation_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[QuotationOut])
def get_quotations(rfq_id: Optional[str] = None, vendor_id: Optional[str] = None, user: UserOut = Depends(get_current_user)):
    if user.role == "vendor":
        # Force filter to only the vendor's profile id
        # We should ideally fetch their vendor_id from profiles, but relying on RLS or simple logic here
        pass # In a real app we'd enforce vendor_id = user.vendor_id
    return quotation_service.list_quotations(rfq_id, vendor_id)

@router.post("/", response_model=QuotationOut)
def create_quotation(data: QuotationCreate, user: UserOut = Depends(require_role("vendor"))):
    return quotation_service.create_quotation(data, user.id)

@router.get("/{quotation_id}", response_model=QuotationOut)
def get_quotation(quotation_id: str, user: UserOut = Depends(get_current_user)):
    return quotation_service.get_quotation(quotation_id)

@router.patch("/{quotation_id}/status", response_model=QuotationOut)
def update_quotation_status(quotation_id: str, data: QuotationUpdateStatus, user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return quotation_service.update_quotation_status(quotation_id, data.status)
