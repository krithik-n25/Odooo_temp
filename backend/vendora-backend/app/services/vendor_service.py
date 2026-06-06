from app.core.database import supabase
from app.models.vendor import VendorCreate, VendorUpdate
from fastapi import HTTPException

def get_all_vendors():
    res = supabase.table("vendors").select("*").execute()
    return res.data

def get_vendor(vendor_id: str):
    res = supabase.table("vendors").select("*").eq("id", vendor_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return res.data

def create_vendor(data: VendorCreate, user_id: str = None):
    payload = data.model_dump(exclude_none=True)
    if user_id:
        payload["user_id"] = user_id
    
    res = supabase.table("vendors").insert(payload).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create vendor")
    return res.data[0]

def update_vendor(vendor_id: str, data: VendorUpdate):
    payload = data.model_dump(exclude_none=True)
    if not payload:
        return get_vendor(vendor_id)
        
    res = supabase.table("vendors").update(payload).eq("id", vendor_id).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not update vendor")
    return res.data[0]
