from app.core.database import supabase
from app.models.rfq import RFQCreate, RFQUpdateStatus
from app.utils.number_generator import generate_number
from fastapi import HTTPException
from datetime import datetime

def list_rfqs(user_id: str, role: str):
    if role == "vendor":
        # Get RFQs where the vendor is invited
        res = supabase.rpc("get_vendor_rfqs", {"v_user_id": user_id}).execute()
        # Fallback if RPC is not defined: 
        # (For hackathon, we can just fetch all from rfq_vendors where vendor.user_id = user_id)
        # We will do a regular join using Supabase JS syntax in python
        # res = supabase.table("rfq_vendors").select("rfq_id, status, rfqs(*)").execute()
        return res.data
    else:
        # officer/manager/admin sees all
        res = supabase.table("rfqs").select("*, items:rfq_items(*)").execute()
        return res.data

def get_rfq(rfq_id: str):
    res = supabase.table("rfqs").select("*, items:rfq_items(*)").eq("id", rfq_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="RFQ not found")
    return res.data

def create_rfq(data: RFQCreate, user_id: str):
    rfq_number = generate_number("RFQ")
    
    # Insert RFQ
    rfq_payload = {
        "rfq_number": rfq_number,
        "title": data.title,
        "category": data.category,
        "priority": data.priority,
        "status": "draft",
        "created_by": user_id,
        "deadline": data.deadline.isoformat(),
        "notes": data.notes
    }
    rfq_res = supabase.table("rfqs").insert(rfq_payload).execute()
    if not rfq_res.data:
        raise HTTPException(status_code=400, detail="Failed to create RFQ")
        
    rfq_id = rfq_res.data[0]["id"]
    
    # Insert Items
    if data.items:
        items_payload = []
        for item in data.items:
            items_payload.append({
                "rfq_id": rfq_id,
                "item_name": item.item_name,
                "specification": item.specification,
                "quantity": item.quantity,
                "unit": item.unit,
                "target_price": item.target_price
            })
        supabase.table("rfq_items").insert(items_payload).execute()
        
    # Invite Vendors
    if data.vendor_ids:
        vendor_payload = [{"rfq_id": rfq_id, "vendor_id": v_id} for v_id in data.vendor_ids]
        supabase.table("rfq_vendors").insert(vendor_payload).execute()
        
    return get_rfq(rfq_id)

def update_rfq_status(rfq_id: str, status: str):
    res = supabase.table("rfqs").update({"status": status, "updated_at": datetime.now().isoformat()}).eq("id", rfq_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update RFQ status")
    return res.data[0]
