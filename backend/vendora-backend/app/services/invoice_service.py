from app.core.database import supabase
from app.models.invoice import InvoiceCreate
from app.utils.number_generator import generate_number
from fastapi import HTTPException
from datetime import datetime

def list_invoices(vendor_id: str = None):
    query = supabase.table("invoices").select("*")
    if vendor_id:
        query = query.eq("vendor_id", vendor_id)
    res = query.execute()
    return res.data

def get_invoice(invoice_id: str):
    res = supabase.table("invoices").select("*").eq("id", invoice_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return res.data

def create_invoice(data: InvoiceCreate, user_id: str):
    # Fetch PO
    po_res = supabase.table("purchase_orders").select("*").eq("id", data.po_id).single().execute()
    if not po_res.data:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    po_data = po_res.data
    
    invoice_number = generate_number("INV")
    
    # Calculate amounts
    subtotal = po_data["subtotal"] + data.freight_charges + data.handling_charges
    # Assuming PO gst_amount is already calculated on the items subtotal, 
    # we just add the PO's gst amount. (In reality, freight/handling would also attract GST)
    # For simplicity:
    tax_amount = po_data["gst_amount"] 
    total_amount = subtotal + tax_amount

    payload = {
        "invoice_number": invoice_number,
        "po_id": data.po_id,
        "vendor_id": po_data["vendor_id"],
        "created_by": user_id,
        "status": "draft",
        "invoice_date": data.invoice_date.isoformat() if data.invoice_date else datetime.now().date().isoformat(),
        "payment_due_date": data.payment_due_date.isoformat() if data.payment_due_date else None,
        "tax_type": data.tax_type,
        "freight_charges": data.freight_charges,
        "handling_charges": data.handling_charges,
        "subtotal": subtotal,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "notes": data.notes
    }
    
    res = supabase.table("invoices").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create invoice")
        
    invoice_id = res.data[0]["id"]
    return get_invoice(invoice_id)

def update_invoice_status(invoice_id: str, status: str):
    res = supabase.table("invoices").update({"status": status}).eq("id", invoice_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to update invoice status")
    return res.data[0]
