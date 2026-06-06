from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.models.user import UserOut
from app.core.database import supabase
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_metrics(user: UserOut = Depends(get_current_user)):
    # Very basic metrics
    metrics = {}
    if user.role in ["officer", "manager", "admin"]:
        rfqs_res = supabase.table("rfqs").select("id", count="exact").execute()
        pos_res = supabase.table("purchase_orders").select("id", count="exact").execute()
        vendors_res = supabase.table("vendors").select("id", count="exact").execute()
        
        metrics = {
            "total_rfqs": rfqs_res.count if hasattr(rfqs_res, 'count') else 0,
            "total_pos": pos_res.count if hasattr(pos_res, 'count') else 0,
            "total_vendors": vendors_res.count if hasattr(vendors_res, 'count') else 0,
        }
    elif user.role == "vendor":
        v_res = supabase.table("vendors").select("id").eq("user_id", user.id).single().execute()
        if v_res.data:
            vid = v_res.data["id"]
            pos_res = supabase.table("purchase_orders").select("id", count="exact").eq("vendor_id", vid).execute()
            inv_res = supabase.table("invoices").select("id", count="exact").eq("vendor_id", vid).execute()
            metrics = {
                "total_pos": pos_res.count if hasattr(pos_res, 'count') else 0,
                "total_invoices": inv_res.count if hasattr(inv_res, 'count') else 0,
            }
            
    return metrics
