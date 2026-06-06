from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NegotiationMessageCreate(BaseModel):
    thread_id: str
    content: str

class NegotiationMessageOut(BaseModel):
    id: str
    thread_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    is_read: bool
    created_at: datetime

class NegotiationThreadCreate(BaseModel):
    rfq_id: str
    vendor_id: str

class NegotiationThreadOut(BaseModel):
    id: str
    rfq_id: str
    officer_id: str
    vendor_id: str
    is_locked: bool
    locked_at: Optional[datetime]
    locked_reason: Optional[str]
    created_at: datetime
    messages: Optional[List[NegotiationMessageOut]] = []
