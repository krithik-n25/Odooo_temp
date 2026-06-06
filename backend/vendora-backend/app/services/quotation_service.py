from app.core.database import supabase
from app.models.quotation import QuotationCreate, QuotationUpdateStatus
from fastapi import HTTPException
from datetime import datetime

def list_quotations(rfq_id: str = None, vendor_id: str = None):
    query = supabase.table("quotations").select("*, items:quotation_items(*)")
    if rfq_id:
        query = query.eq("rfq_id", rfq_id)
    if vendor_id:
        query = query.eq("vendor_id", vendor_id)
    res = query.execute()
    return res.data

def get_quotation(quotation_id: str):
    res = supabase.table("quotations").select("*, items:quotation_items(*)").eq("id", quotation_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return res.data

def create_quotation(data: QuotationCreate, user_id: str):
    # Get vendor_id from user_id
    vendor_res = supabase.table("vendors").select("id").eq("user_id", user_id).single().execute()
    if not vendor_res.data:
        raise HTTPException(status_code=404, detail="Vendor profile not found for user")
    vendor_id = vendor_res.data["id"]

    # Verify RFQ exists and vendor is invited
    rfq_v_res = supabase.table("rfq_vendors").select("*").eq("rfq_id", data.rfq_id).eq("vendor_id", vendor_id).execute()
    if not rfq_v_res.data:
        raise HTTPException(status_code=403, detail="Vendor is not invited to this RFQ")

    # Fetch RFQ items to calculate totals
    rfq_items_res = supabase.table("rfq_items").select("id, quantity").eq("rfq_id", data.rfq_id).execute()
    rfq_items_map = {item["id"]: item["quantity"] for item in rfq_items_res.data}

    subtotal = 0.0
    items_payload = []
    
    for item in data.items:
        if item.rfq_item_id not in rfq_items_map:
            raise HTTPException(status_code=400, detail=f"Invalid rfq_item_id: {item.rfq_item_id}")
        qty = rfq_items_map[item.rfq_item_id]
        line_total = qty * item.unit_price
        subtotal += line_total
        items_payload.append({
            "rfq_item_id": item.rfq_item_id,
            "unit_price": item.unit_price,
            "total_price": line_total,
            "availability": item.availability
        })

    gst_amount = subtotal * (data.gst_rate / 100.0)
    total_amount = subtotal + gst_amount

    # Insert Quotation
    quot_payload = {
        "rfq_id": data.rfq_id,
        "vendor_id": vendor_id,
        "status": "submitted",
        "valid_until": data.valid_until.isoformat() if data.valid_until else None,
        "gst_rate": data.gst_rate,
        "payment_terms": data.payment_terms,
        "delivery_days": data.delivery_days,
        "notes": data.notes,
        "confidence_level": data.confidence_level,
        "subtotal": subtotal,
        "gst_amount": gst_amount,
        "total_amount": total_amount,
        "submitted_at": datetime.now().isoformat()
    }
    
    q_res = supabase.table("quotations").insert(quot_payload).execute()
    if not q_res.data:
        raise HTTPException(status_code=400, detail="Failed to create quotation")
        
    quotation_id = q_res.data[0]["id"]
    
    # Insert Quotation Items
    for i in items_payload:
        i["quotation_id"] = quotation_id
        
    supabase.table("quotation_items").insert(items_payload).execute()
    
    # Update RFQ vendor status
    supabase.table("rfq_vendors").update({"status": "submitted"}).eq("rfq_id", data.rfq_id).eq("vendor_id", vendor_id).execute()
    
    return get_quotation(quotation_id)

def update_quotation_status(quotation_id: str, status: str):
    res = supabase.table("quotations").update({"status": status}).eq("id", quotation_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update quotation status")
    return res.data[0]
