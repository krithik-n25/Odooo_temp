from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApprovalCreate(BaseModel):
    rfq_id: str
    quotation_id: str
    manager_id: str
    officer_note: Optional[str] = None

class ApprovalUpdate(BaseModel):
    status: str
    manager_remarks: Optional[str] = None

class ApprovalOut(BaseModel):
    id: str
    rfq_id: str
    quotation_id: str
    requested_by: str
    manager_id: str
    status: str
    officer_note: Optional[str]
    manager_remarks: Optional[str]
    submitted_at: datetime
    decided_at: Optional[datetime]
