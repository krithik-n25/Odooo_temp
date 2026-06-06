from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.user import UserOut
from app.models.approval import ApprovalCreate, ApprovalUpdate, ApprovalOut
from app.services import approval_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[ApprovalOut])
def get_approvals(user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    manager_id = user.id if user.role == "manager" else None
    return approval_service.list_approvals(manager_id)

@router.post("/", response_model=ApprovalOut)
def request_approval(data: ApprovalCreate, user: UserOut = Depends(require_role("officer", "admin"))):
    return approval_service.create_approval(data, user.id)

@router.get("/{approval_id}", response_model=ApprovalOut)
def get_approval(approval_id: str, user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return approval_service.get_approval(approval_id)

@router.patch("/{approval_id}/decide", response_model=ApprovalOut)
def decide_approval(approval_id: str, data: ApprovalUpdate, user: UserOut = Depends(require_role("manager", "admin"))):
    return approval_service.decide_approval(approval_id, data, user.id)
