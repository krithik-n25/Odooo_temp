from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.user import UserOut
from app.models.negotiation import NegotiationThreadCreate, NegotiationThreadOut, NegotiationMessageCreate, NegotiationMessageOut
from app.services import negotiation_service
from app.core.dependencies import get_current_user, require_role

router = APIRouter()

@router.get("/", response_model=List[NegotiationThreadOut])
def get_threads(rfq_id: Optional[str] = None, user: UserOut = Depends(get_current_user)):
    return negotiation_service.list_threads(rfq_id, user.id, user.role)

@router.post("/", response_model=NegotiationThreadOut)
def create_thread(data: NegotiationThreadCreate, user: UserOut = Depends(require_role("officer"))):
    return negotiation_service.create_thread(data, user.id)

@router.get("/{thread_id}", response_model=NegotiationThreadOut)
def get_thread(thread_id: str, user: UserOut = Depends(get_current_user)):
    return negotiation_service.get_thread(thread_id)

@router.post("/{thread_id}/messages", response_model=NegotiationMessageOut)
def send_message(thread_id: str, data: NegotiationMessageCreate, user: UserOut = Depends(get_current_user)):
    # Override thread_id just in case
    data.thread_id = thread_id
    return negotiation_service.send_message(data, user.id, user.name, user.role)

@router.post("/{thread_id}/lock", response_model=NegotiationThreadOut)
def lock_thread(thread_id: str, reason: str, user: UserOut = Depends(require_role("officer", "manager", "admin"))):
    return negotiation_service.lock_thread(thread_id, reason)
