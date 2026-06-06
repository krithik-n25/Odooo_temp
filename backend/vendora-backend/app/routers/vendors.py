from fastapi import APIRouter, Depends
from typing import List
from app.models.user import UserOut
from app.models.vendor import VendorCreate, VendorUpdate, VendorOut
from app.services import vendor_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[VendorOut])
def list_vendors(user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return vendor_service.get_all_vendors()

@router.get("/{vendor_id}", response_model=VendorOut)
def get_vendor(vendor_id: str, user: UserOut = Depends(get_current_user)):
    return vendor_service.get_vendor(vendor_id)

@router.post("/", response_model=VendorOut)
def create_vendor(data: VendorCreate, user: UserOut = Depends(require_role("admin", "manager", "officer", "vendor"))):
    # If the user is a vendor, auto-link them to the vendor profile
    user_id = user.id if user.role == "vendor" else None
    return vendor_service.create_vendor(data, user_id)

@router.patch("/{vendor_id}", response_model=VendorOut)
def update_vendor(vendor_id: str, data: VendorUpdate, user: UserOut = Depends(require_role("admin", "manager"))):
    return vendor_service.update_vendor(vendor_id, data)
