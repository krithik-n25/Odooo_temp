from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.user import UserOut
from app.models.purchase_order import POCreate, POUpdateStatus, POOut
from app.services import po_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[POOut])
def get_purchase_orders(vendor_id: Optional[str] = None, user: UserOut = Depends(get_current_user)):
    if user.role == "vendor":
        pass # In real app, force vendor_id = user's vendor profile id
    return po_service.list_pos(vendor_id)

@router.post("/", response_model=POOut)
def create_purchase_order(data: POCreate, user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return po_service.create_po(data, user.id)

@router.get("/{po_id}", response_model=POOut)
def get_purchase_order(po_id: str, user: UserOut = Depends(get_current_user)):
    return po_service.get_po(po_id)

@router.patch("/{po_id}/status", response_model=POOut)
def update_po_status(po_id: str, data: POUpdateStatus, user: UserOut = Depends(get_current_user)):
    # Both vendor (e.g. acknowledge) and officer (e.g. sent) can update status
    return po_service.update_po_status(po_id, data.status)
