from weasyprint import HTML
import tempfile
import os
from app.core.database import supabase
from app.core.config import settings

def generate_and_upload_pdf(html_content: str, filename: str, bucket_name: str) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        HTML(string=html_content).write_pdf(tmp.name)
        tmp.seek(0)
        
        # Upload to Supabase Storage
        file_path = f"{filename}"
        with open(tmp.name, "rb") as f:
            supabase.storage.from_(bucket_name).upload(
                file_path, 
                f.read(),
                {"content-type": "application/pdf", "upsert": "true"}
            )
            
    os.unlink(tmp.name)
    return supabase.storage.from_(bucket_name).get_public_url(file_path)
