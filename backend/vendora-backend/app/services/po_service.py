from app.core.database import supabase
from app.models.purchase_order import POCreate
from app.utils.number_generator import generate_number
from fastapi import HTTPException
from datetime import datetime

def list_pos(vendor_id: str = None):
    query = supabase.table("purchase_orders").select("*")
    if vendor_id:
        query = query.eq("vendor_id", vendor_id)
    res = query.execute()
    return res.data

def get_po(po_id: str):
    res = supabase.table("purchase_orders").select("*").eq("id", po_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return res.data

def create_po(data: POCreate, user_id: str):
    # Get quotation details to pull amounts
    quot_res = supabase.table("quotations").select("subtotal, gst_amount, total_amount").eq("id", data.quotation_id).single().execute()
    if not quot_res.data:
        raise HTTPException(status_code=404, detail="Quotation not found")
        
    q_data = quot_res.data
    po_number = generate_number("PO")

    payload = {
        "po_number": po_number,
        "rfq_id": data.rfq_id,
        "quotation_id": data.quotation_id,
        "approval_id": data.approval_id,
        "vendor_id": data.vendor_id,
        "created_by": user_id,
        "status": "draft",
        "delivery_address": data.delivery_address,
        "special_instructions": data.special_instructions,
        "expected_delivery_date": data.expected_delivery_date.isoformat() if data.expected_delivery_date else None,
        "subtotal": q_data["subtotal"],
        "gst_amount": q_data["gst_amount"],
        "total_amount": q_data["total_amount"]
    }
    
    res = supabase.table("purchase_orders").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create PO")
        
    po_id = res.data[0]["id"]
    
    # Update RFQ status to po_issued
    supabase.table("rfqs").update({"status": "po_issued"}).eq("id", data.rfq_id).execute()
    
    return get_po(po_id)

def update_po_status(po_id: str, status: str):
    res = supabase.table("purchase_orders").update({"status": status, "updated_at": datetime.now().isoformat()}).eq("id", po_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update PO status")
    return res.data[0]
