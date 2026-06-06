from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.user import UserOut
from app.models.rfq import RFQCreate, RFQUpdateStatus, RFQOut
from app.services import rfq_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[RFQOut])
def get_rfqs(user: UserOut = Depends(get_current_user)):
    return rfq_service.list_rfqs(user.id, user.role)

@router.post("/", response_model=RFQOut)
def create_rfq(data: RFQCreate, user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return rfq_service.create_rfq(data, user.id)

@router.get("/{rfq_id}", response_model=RFQOut)
def get_rfq(rfq_id: str, user: UserOut = Depends(get_current_user)):
    return rfq_service.get_rfq(rfq_id)

@router.patch("/{rfq_id}/status", response_model=RFQOut)
def update_rfq_status(rfq_id: str, data: RFQUpdateStatus, user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return rfq_service.update_rfq_status(rfq_id, data.status)
