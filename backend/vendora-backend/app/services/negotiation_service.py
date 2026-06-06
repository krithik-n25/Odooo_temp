from app.core.database import supabase
from app.models.negotiation import NegotiationThreadCreate, NegotiationMessageCreate
from fastapi import HTTPException
from datetime import datetime

def list_threads(rfq_id: str = None, user_id: str = None, role: str = None):
    query = supabase.table("negotiation_threads").select("*")
    if rfq_id:
        query = query.eq("rfq_id", rfq_id)
    if role == "vendor" and user_id:
        # Vendor only sees their threads
        v_res = supabase.table("vendors").select("id").eq("user_id", user_id).single().execute()
        if v_res.data:
            query = query.eq("vendor_id", v_res.data["id"])
    elif role == "officer" and user_id:
        query = query.eq("officer_id", user_id)
        
    res = query.execute()
    return res.data

def get_thread(thread_id: str):
    res = supabase.table("negotiation_threads").select("*, messages:negotiation_messages(*)").eq("id", thread_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    return res.data

def create_thread(data: NegotiationThreadCreate, officer_id: str):
    payload = {
        "rfq_id": data.rfq_id,
        "officer_id": officer_id,
        "vendor_id": data.vendor_id,
        "is_locked": False
    }
    # Use UPSERT or check existing
    existing = supabase.table("negotiation_threads").select("id").eq("rfq_id", data.rfq_id).eq("vendor_id", data.vendor_id).execute()
    if existing.data:
        return get_thread(existing.data[0]["id"])

    res = supabase.table("negotiation_threads").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create thread")
    return get_thread(res.data[0]["id"])

def send_message(data: NegotiationMessageCreate, user_id: str, sender_name: str, sender_role: str):
    thread = get_thread(data.thread_id)
    if thread["is_locked"]:
        raise HTTPException(status_code=400, detail="Thread is locked")
        
    payload = {
        "thread_id": data.thread_id,
        "sender_id": user_id,
        "sender_name": sender_name,
        "sender_role": sender_role,
        "content": data.content
    }
    
    res = supabase.table("negotiation_messages").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to send message")
    return res.data[0]

def lock_thread(thread_id: str, reason: str):
    payload = {
        "is_locked": True,
        "locked_at": datetime.now().isoformat(),
        "locked_reason": reason
    }
    res = supabase.table("negotiation_threads").update(payload).eq("id", thread_id).execute()
    return res.data[0]
