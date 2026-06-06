import os
from dotenv import load_dotenv
load_dotenv()
from app.core.database import supabase
from app.utils.number_generator import generate_number
from datetime import datetime

def test():
    try:
        user_id = "11111111-1111-1111-1111-111111111111"
        rfq_number = generate_number("RFQ")
        rfq_payload = {
            "rfq_number": rfq_number,
            "title": "Test Title",
            "category": "RAW MATERIALS",
            "priority": "urgent",
            "status": "draft",
            "created_by": user_id,
            "deadline": datetime.now().isoformat(),
            "notes": None
        }
        print("Inserting:", rfq_payload)
        res = supabase.table("rfqs").insert(rfq_payload).execute()
        print("Success!", res.data)
    except Exception as e:
        print("Exception:", str(e))
        if hasattr(e, 'response'):
            print("Response:", e.response.json())
        if hasattr(e, 'details'):
            print("Details:", e.details)

if __name__ == "__main__":
    test()
