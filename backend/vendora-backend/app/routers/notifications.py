from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.models.user import UserOut
from app.core.database import supabase
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_notifications(user: UserOut = Depends(get_current_user)):
    res = supabase.table("notifications").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return res.data

@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, user: UserOut = Depends(get_current_user)):
    res = supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user.id).execute()
    return {"message": "marked read"}
