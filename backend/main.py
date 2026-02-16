from fastapi import FastAPI, HTTPException, UploadFile, File, Form, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from config.database import init_db, close_db
from services.interview_services import InterviewService
from models.interview_schema import InterviewReport
from services.pdf_service import extract_text_from_pdf
from services.llm_service import get_ai_response, get_hint, evaluate_answer
from services.tts_service import generate_audio
from services.video_service import process_video_frame, Stabilizer
from services.resume_analyzer import analyze_resume, build_compact_summary
from services.interview_planner import generate_interview_plan
from services.interview_state import InterviewState
import threading
import json
import base64
import time
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

# Global camera state
camera = None
camera_lock = threading.Lock()
camera_active = False

session_data = {
    "resume_text": "",           # Raw text (kept for hints)
    "job_description": "",
    "candidate_profile": None,   # Structured profile from resume_analyzer
    "candidate_summary": "",     # Compact summary for LLM prompts
    "interview_plan": None,      # Fixed plan from interview_planner
    "interview_state": None,     # InterviewState tracker instance
    "transcript": [],            # Stores {"role": "user"|"ai", "content": "..."}
    "video_metrics": [],         # Stores {"timestamp": float, "focus": int, "emotion": int, "confidence": int}
    "answer_scores": []          # Stores per-answer evaluation scores
}

class HintRequest(BaseModel):
    question: str
    level: str = "medium"  # small, medium, or full

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

@app.post("/get-hint")
async def get_interview_hint(request: HintRequest):
    if not session_data["resume_text"]:
        return {"hint": "Please upload a resume first."}
    
    hint = await get_hint(request.question, session_data["resume_text"], session_data["job_description"], request.level)
    return {"hint": hint}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    session_data["resume_text"] = text
    session_data["job_description"] = job_description
    session_data["transcript"] = []
    session_data["video_metrics"] = []
    session_data["answer_scores"] = []
    
    # Structured resume analysis (runs once at upload)
    profile = await analyze_resume(text, job_description)
    session_data["candidate_profile"] = profile
    session_data["candidate_summary"] = build_compact_summary(profile)
    
    # Generate interview plan
    plan = await generate_interview_plan(profile, job_description)
    session_data["interview_plan"] = plan
    session_data["interview_state"] = None  # Will be created at WebSocket connect
    
    print(f"[Resume Analyzer] Profile: {json.dumps(profile, indent=2)[:500]}")
    print(f"[Interview Planner] Plan: {json.dumps(plan, indent=2)[:500]}")
    
    return {
        "message": "Data processed successfully!",
        "profile_summary": session_data["candidate_summary"],
        "interview_plan": {
            "total_questions": plan.get("total_questions", 10),
            "categories": [c["name"] for c in plan.get("categories", [])],
            "difficulty": plan.get("difficulty_baseline", "medium")
        }
    }

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = "temp_voice.wav"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())
    
    with open(temp_path, "rb") as audio_file:
        transcript = await client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file,
            language="en", # Forces English to stop the Korean hallucinations
            prompt="Technical interview conversation about software development." # Contextual hint
        )
    
    os.remove(temp_path)
    
    # Filter out "hallucinations" (very short or nonsense noise)
    text = transcript.text.strip()
    if len(text) < 2: 
        return {"text": ""} # Return empty so the AI doesn't reply to a 'noise' message
        
    return {"text": text}

@app.websocket("/ws/interview")
async def interview_websocket(websocket: WebSocket):
    await websocket.accept()
    
    chat_history = []
    
    # Initialize interview state from the plan
    plan = session_data.get("interview_plan")
    if plan:
        state = InterviewState(plan)
        session_data["interview_state"] = state
    else:
        state = None
    
    # 1. Opening — use the structured plan for the first question
    if session_data["candidate_summary"]:
        interview_context = state.to_context_string() if state else ""
        
        response_text = await get_ai_response(
            session_data["candidate_summary"],
            session_data["job_description"],
            chat_history,
            interview_context
        )
        
        # Track the question for evaluation later
        if state:
            state.current_question_text = response_text
        
        chat_history.append({"role": "assistant", "content": response_text})
        session_data["transcript"].append({"role": "ai", "content": response_text})
        
        audio_bytes = generate_audio(response_text)
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8') if audio_bytes else None
        
        await websocket.send_json({
            "type": "ai_turn",
            "text": response_text,
            "audio": audio_b64
        })

    # 2. Conversation Loop with plan tracking + answer evaluation
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg["type"] == "user_turn":
                user_text = msg["text"]
                chat_history.append({"role": "user", "content": user_text})
                session_data["transcript"].append({"role": "user", "content": user_text})
                
                # Evaluate the answer against the current question
                if state and state.current_question_text and not state.is_complete:
                    step = state.get_current_step()
                    if step:
                        scores = await evaluate_answer(
                            question=state.current_question_text,
                            answer=user_text,
                            category=step["category_name"],
                            topic=step["topic"],
                            candidate_summary=session_data["candidate_summary"],
                            job_desc=session_data["job_description"]
                        )
                        
                        # Record the score
                        state.record_score(
                            question=state.current_question_text,
                            category=step["category_name"],
                            topic=step["topic"],
                            accuracy=scores["accuracy"],
                            depth=scores["depth"],
                            clarity=scores["clarity"]
                        )
                        session_data["answer_scores"].append({
                            "question": state.current_question_text,
                            "answer": user_text,
                            "category": step["category_name"],
                            "scores": scores
                        })
                        
                        print(f"[Evaluation] Q{state.total_questions_asked}: accuracy={scores['accuracy']}, depth={scores['depth']}, clarity={scores['clarity']}")
                        
                        # Advance the plan
                        state.advance()
                
                # Generate next question using plan context
                interview_context = state.to_context_string() if state else ""
                
                ai_reply = await get_ai_response(
                    session_data["candidate_summary"],
                    session_data["job_description"],
                    chat_history,
                    interview_context
                )
                
                # Track this question for next evaluation
                if state:
                    state.current_question_text = ai_reply
                
                chat_history.append({"role": "assistant", "content": ai_reply})
                session_data["transcript"].append({"role": "ai", "content": ai_reply})
                
                audio_bytes = generate_audio(ai_reply)
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8') if audio_bytes else None
                
                await websocket.send_json({
                    "type": "ai_turn",
                    "text": ai_reply,
                    "audio": audio_b64
                })
    except Exception as e:
        print(f"WebSocket closed or error: {e}")

@app.websocket("/ws/video")
async def video_websocket(websocket: WebSocket):
    await websocket.accept()
    stabilizer = Stabilizer()
    
    try:
        while True:
            data = await websocket.receive_text()
            # data is expected to be a base64 string
            result = process_video_frame(data, stabilizer)
            if result:
                # Store metric with timestamp
                metric_entry = {
                    "timestamp": time.time(),
                    "focus": result["focus"],
                    "emotion": result["emotion"],
                    "confidence": result["confidence"],
                    "stress": result["stress"]
                }
                session_data["video_metrics"].append(metric_entry)
                
                await websocket.send_json(result)
    except Exception as e:
        print(f"Video WebSocket error: {e}")

@app.get("/report")
async def get_report_data():
    """
    Returns the accumulated session data for the report page.
    Now includes per-answer evaluation scores from the interview state.
    """
    # Get scores summary from interview state
    state = session_data.get("interview_state")
    scores_summary = state.get_scores_summary() if state else {"total_questions": 0, "per_question": [], "per_category": {}}
    
    return {
        "transcript": session_data["transcript"],
        "video_metrics": session_data["video_metrics"],
        "job_description": session_data["job_description"],
        "answer_evaluation": scores_summary,
        "interview_plan": session_data.get("interview_plan"),
        "candidate_profile": session_data.get("candidate_profile")
    }

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

@app.get("/api/analytics")
async def get_analytics():
    """
    Returns structured analytics data for the CandidateReport component.
    Aggregates video_metrics and transcript into the expected format.
    """
    metrics = session_data["video_metrics"]
    transcript = session_data["transcript"]
    
    # Calculate averages from video metrics
    if metrics:
        avg_focus = sum(m["focus"] for m in metrics) / len(metrics)
        avg_emotion = sum(m["emotion"] for m in metrics) / len(metrics)
        avg_confidence = sum(m["confidence"] for m in metrics) / len(metrics)
        avg_stress = sum(m.get("stress", 0) for m in metrics) / len(metrics)
    else:
        avg_focus = avg_emotion = avg_confidence = 0
        avg_stress = 50
    
    # Calculate per-question metrics (group by 30-second windows)
    per_question_metrics = []
    if metrics:
        # Group metrics into question-like segments
        segment_size = max(1, len(metrics) // 5)  # Divide into ~5 segments
        for i in range(0, len(metrics), segment_size):
            segment = metrics[i:i+segment_size]
            if segment:
                per_question_metrics.append({
                    "question_index": len(per_question_metrics) + 1,
                    "eye_contact_percentage": sum(m["focus"] for m in segment) / len(segment),
                    "confidence": sum(m["confidence"] for m in segment) / len(segment)
                })
    
    # Sentiment trend from transcript (simplified)
    sentiment_trend = []
    for entry in transcript:
        if entry["role"] == "user":
            # Basic sentiment: positive words = +, negative words = -
            text = entry["content"].lower()
            positive_words = ["good", "great", "excellent", "love", "happy", "excited", "confident"]
            negative_words = ["bad", "difficult", "hard", "nervous", "worried", "afraid", "confused"]
            pos_count = sum(1 for w in positive_words if w in text)
            neg_count = sum(1 for w in negative_words if w in text)
            sentiment = (pos_count - neg_count) / max(1, pos_count + neg_count + 1)
            sentiment_trend.append(sentiment)
    
    # Filler word detection
    filler_words = ["um", "uh", "like", "you know", "basically", "actually", "literally"]
    total_fillers = 0
    filler_counts = {}
    total_words = 0
    
    for entry in transcript:
        if entry["role"] == "user":
            words = entry["content"].lower().split()
            total_words += len(words)
            for filler in filler_words:
                count = entry["content"].lower().count(filler)
                total_fillers += count
                filler_counts[filler] = filler_counts.get(filler, 0) + count
    
    most_common_fillers = sorted(filler_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    filler_rate = (total_fillers / max(1, total_words)) * 100
    
    # Talk-to-listen ratio
    user_messages = sum(1 for t in transcript if t["role"] == "user")
    ai_messages = sum(1 for t in transcript if t["role"] == "ai")
    talk_ratio = user_messages / max(1, ai_messages)
    
    # Get answer evaluation scores from interview state
    state = session_data.get("interview_state")
    scores_summary = state.get_scores_summary() if state else None
    
    # Use answer evaluation to enhance technical_accuracy if available
    if scores_summary and scores_summary.get("total_questions", 0) > 0:
        # Scale LLM-evaluated accuracy (1-10) to 0-100 for the radar chart
        technical_accuracy = scores_summary["overall_accuracy"] * 10
        communication_score = scores_summary["overall_clarity"] * 10
    else:
        technical_accuracy = min(100, avg_confidence + 15)
        communication_score = min(100, avg_emotion + 20)
    
    return {
        "radar_chart_data": {
            "technical_accuracy": technical_accuracy,
            "communication": communication_score,
            "confidence": avg_confidence,
            "focus": avg_focus,
            "emotional_intelligence": avg_emotion
        },
        "vision_analytics": {
            "overall_eye_contact_percentage": avg_focus,
            "overall_steadiness_percentage": 100 - avg_stress,
            "per_question_metrics": per_question_metrics
        },
        "nlp_report": {
            "total_filler_count": total_fillers,
            "filler_rate": filler_rate,
            "talk_to_listen_ratio": talk_ratio,
            "most_common_fillers": most_common_fillers,
            "sentiment_trend": sentiment_trend
        },
        "scoring_summary": {
            "average_score": (avg_focus + avg_emotion + avg_confidence) / 3,
            "scores_over_time": [m["confidence"] for m in metrics[-10:]]
        },
        "answer_evaluation": scores_summary
    }

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
