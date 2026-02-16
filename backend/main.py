from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import init_db, close_db
from services.interview_services import InterviewService
from models.interview_schema import InterviewReport

# Lifespan context manager with error handling
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    try:
        print("🔄 Initializing database...")
        await init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        print(f"Error details: {type(e).__name__}")
        import traceback
        traceback.print_exc()
    
    yield
    
    # Shutdown: Close database connections
    try:
        print("🔄 Closing database connections...")
        await close_db()
        print("✅ Database connections closed")
    except Exception as e:
        print(f"⚠️ Error closing database: {e}")

# Initialize FastAPI with lifespan
app = FastAPI(
    title="HireByte API",
    description="Mock Interview Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
@app.get("/")
async def root():
    return {
        "message": "HireByte API is running!",
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "database": "connected"}

# Database endpoints
@app.post("/api/interview/save")
async def save_interview_report(report: InterviewReport):
    """Save interview report"""
    try:
        interview_id = await InterviewService.save_interview(report)
        return {"interview_id": interview_id, "message": "Interview saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/interview/{interview_id}")
async def get_interview(interview_id: str):
    """Get specific interview"""
    interview = await InterviewService.get_interview_by_id(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@app.get("/api/user/{user_id}/interviews")
async def get_user_interviews(user_id: str, limit: int = 10):
    """Get user's interview history"""
    interviews = await InterviewService.get_user_interviews(user_id, limit)
    return {"interviews": interviews, "count": len(interviews)}

@app.get("/api/user/{user_id}/progress")
async def get_user_progress(user_id: str):
    """Get user's progress over time"""
    progress = await InterviewService.get_progress_data(user_id)
    return progress

@app.get("/api/user/{user_id}/analytics")
async def get_user_analytics(user_id: str):
    """Get comprehensive analytics"""
    analytics = await InterviewService.get_analytics_summary(user_id)
    if not analytics:
        raise HTTPException(status_code=404, detail="No interviews found")
    return analytics

@app.get("/api/comparison/{user_id}/{job_role}")
async def get_comparison(user_id: str, job_role: str):
    """Compare performance with others"""
    comparison = await InterviewService.get_comparison_stats(user_id, job_role)
    if not comparison:
        raise HTTPException(status_code=404, detail="No data available")
    return comparison

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting HireByte Backend Server...")
    print("📡 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("Press CTRL+C to stop\n")
    
    # FIXED: Changed "main:app" to app
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        log_level="info",
        reload=True
    )
