from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    # Use the service key for backend operations to bypass RLS when needed,
    # or the anon key depending on the operation. Usually backend uses service key.
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

supabase = get_supabase()
