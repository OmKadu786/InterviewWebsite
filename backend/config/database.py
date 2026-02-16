from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hirebyte_interviews")

# Async client for FastAPI with SSL certificate
async_client = AsyncIOMotorClient(
    MONGODB_URL,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)
async_db = async_client[DATABASE_NAME]

# Collections
interviews_collection = async_db["interviews"]
users_collection = async_db["users"]
analytics_collection = async_db["analytics"]

# Sync client for non-async operations
sync_client = MongoClient(
    MONGODB_URL,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)
sync_db = sync_client[DATABASE_NAME]

async def init_db():
    """Initialize database with indexes"""
    try:
        # Test connection first
        await async_client.admin.command('ping')
        print("[OK] MongoDB connection successful")
        
        # Create indexes
        await interviews_collection.create_index("user_id")
        await interviews_collection.create_index("interview_date")
        await interviews_collection.create_index([("user_id", 1), ("interview_date", -1)])
        await analytics_collection.create_index("user_id")
        
        print("[OK] Database initialized successfully")
    except Exception as e:
        print(f"[WARN] Database initialization failed: {e}")
        print("[WARN] Server will run without database functionality")

async def test_connection():
    """Test database connection"""
    try:
        await async_client.admin.command('ping')
        return True
    except Exception as e:
        print(f"Connection error: {e}")
        return False

async def close_db():
    """Close database connections"""
    async_client.close()
    sync_client.close()
    print("[OK] Database connections closed")