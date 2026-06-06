from app.core.database import supabase
from app.models.approval import ApprovalCreate, ApprovalUpdate
from fastapi import HTTPException
from datetime import datetime

def list_approvals(manager_id: str = None):
    query = supabase.table("approvals").select("*")
    if manager_id:
        query = query.eq("manager_id", manager_id)
    res = query.execute()
    return res.data

def get_approval(approval_id: str):
    res = supabase.table("approvals").select("*").eq("id", approval_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Approval not found")
    return res.data

def create_approval(data: ApprovalCreate, user_id: str):
    # Verify RFQ and Quotation
    rfq_res = supabase.table("rfqs").select("id").eq("id", data.rfq_id).single().execute()
    if not rfq_res.data:
        raise HTTPException(status_code=404, detail="RFQ not found")
        
    quot_res = supabase.table("quotations").select("id, status").eq("id", data.quotation_id).single().execute()
    if not quot_res.data:
        raise HTTPException(status_code=404, detail="Quotation not found")

    payload = {
        "rfq_id": data.rfq_id,
        "quotation_id": data.quotation_id,
        "requested_by": user_id,
        "manager_id": data.manager_id,
        "status": "pending",
        "officer_note": data.officer_note
    }
    
    res = supabase.table("approvals").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create approval request")
        
    # Update quotation status to under_review
    supabase.table("quotations").update({"status": "under_review"}).eq("id", data.quotation_id).execute()
    # Update RFQ status to approval
    supabase.table("rfqs").update({"status": "approval"}).eq("id", data.rfq_id).execute()
    
    return res.data[0]

def decide_approval(approval_id: str, data: ApprovalUpdate, manager_id: str):
    # Get current approval
    appr = get_approval(approval_id)
    if appr["manager_id"] != manager_id:
        raise HTTPException(status_code=403, detail="You are not the assigned manager")
        
    payload = {
        "status": data.status,
        "manager_remarks": data.manager_remarks,
        "decided_at": datetime.now().isoformat()
    }
    
    res = supabase.table("approvals").update(payload).eq("id", approval_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update approval")
        
    # If approved, update quotation to accepted, RFQ to po_issued?
    # Usually PO generation comes next. 
    if data.status == "approved":
        supabase.table("quotations").update({"status": "accepted"}).eq("id", appr["quotation_id"]).execute()
    elif data.status == "rejected":
        supabase.table("quotations").update({"status": "rejected"}).eq("id", appr["quotation_id"]).execute()
        
    return res.data[0]
