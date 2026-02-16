import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[WARN] SUPABASE_URL or SUPABASE_KEY is missing in backend/.env")

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("[OK] Supabase client initialized")
except Exception as e:
    print(f"[ERROR] Failed to initialize Supabase client: {e}")
    supabase = None

async def init_db():
    """Check Supabase connection"""
    if supabase:
        print("[OK] Supabase ready")
    else:
        print("[ERR] Supabase not initialized")

async def close_db():
    """No-op for Supabase REST client"""
    pass