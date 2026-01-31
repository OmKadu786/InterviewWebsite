"""
HireByte - Main FastAPI Application
AI-powered interview platform with real-time vision analysis and analytics.
"""
import os
import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from fastapi.responses import StreamingResponse, JSONResponse

from services.pdf_service import extract_text_from_pdf
from services.llm_service import get_ai_response 
from services.tts_service import generate_audio
from services.video_service import process_video_frame, Stabilizer
from services.scoring_service import answer_scorer
from services.nlp_analyzer import interview_analyzer
from utils.face_detector import FaceDetector

load_dotenv()

# Global singletons
detector = None
interview_session = {
    "chat_history": [],
    "question_count": 0,
    "is_active": False
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global detector
    print("[STARTING] HireByte Starting...")
    print("Initializing FaceDetector...")
    detector = FaceDetector()
    yield
    print("[STOPPING] HireByte Shutting down...")
    if detector:
        detector.close_camera()

app = FastAPI(
    title="HireByte",
    description="AI-powered interview platform with real-time vision analysis",
    version="2.0.0",
    lifespan=lifespan
)
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

session_data = {
    "resume_text": "", 
    "job_description": "", 
    "api_key": "", 
    "difficulty": "medium"
}


# ============== Resume & Setup ==============

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...), 
    job_description: str = Form(...),
    difficulty: str = Form("medium"),
    x_openai_key: str = Header(None, alias="X-OpenAI-Key")
):
    """Upload resume and job description to start interview setup."""
    file_bytes = await file.read()
    filename = file.filename.lower()
    
    # Handle PDF or Image
    if filename.endswith('.pdf'):
        text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(('.jpg', '.jpeg', '.png')):
        try:
            from PIL import Image
            import pytesseract
            import io
            image = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(image)
        except Exception as e:
            print(f"OCR Error: {e}. Using filename as placeholder.")
            text = f"Resume image uploaded: {file.filename}. Please describe your experience verbally."
    else:
        text = "Unsupported file type"
    
    session_data["resume_text"] = text
    session_data["job_description"] = job_description
    session_data["difficulty"] = difficulty
    if x_openai_key:
        session_data["api_key"] = x_openai_key
    
    # Reset analytics for new interview
    answer_scorer.reset()
    interview_analyzer.reset()
    if detector:
        detector.reset_session()
    
    return {"message": "Data processed successfully!", "resume_length": len(text)}


# ============== Audio Transcription ==============

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file using Whisper."""
    temp_path = "temp_voice.webm"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())
    
    try:
        with open(temp_path, "rb") as audio_file:
            transcript = await client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                language="en", 
                prompt="Technical interview conversation."
            )
        
        text = transcript.text.strip()
        print(f"DEBUG: Transcribed text: '{text}'")
        
        if len(text) < 1: 
            return {"text": ""} 
        
        # Analyze transcription with NLP
        if text:
            interview_analyzer.add_answer(text)
            
        return {"text": text}
    except Exception as e:
        print(f"Transcription error: {e}")
        return {"text": ""}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ============== Interview WebSocket ==============

@app.websocket("/ws/interview")
async def interview_websocket(websocket: WebSocket):
    """Main interview conversation WebSocket."""
    await websocket.accept()
    
    chat_history = []
    interview_session["is_active"] = True
    interview_session["question_count"] = 0
    
    # 1. Automatic Greeting
    if session_data["resume_text"]:
        response_text = await get_ai_response(
            session_data["resume_text"], 
            session_data["job_description"],
            chat_history,
            api_key=session_data.get("api_key"),
            difficulty=session_data.get("difficulty", "medium")
        )
        
        chat_history.append({"role": "assistant", "content": response_text})
        interview_analyzer.add_interviewer_message(response_text)
        interview_session["question_count"] += 1
        
        # Signal new question to face detector
        if detector:
            detector.start_new_question()
        
        audio_bytes = generate_audio(response_text)
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8') if audio_bytes else None
        
        await websocket.send_json({
            "type": "ai_turn",
            "text": response_text,
            "audio": audio_b64,
            "question_number": interview_session["question_count"]
        })

    # 2. Conversation Loop
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg["type"] == "user_turn":
                user_text = msg["text"]
                chat_history.append({"role": "user", "content": user_text})
                
                # Score the answer
                last_question = chat_history[-2]["content"] if len(chat_history) >= 2 else ""
                score_result = answer_scorer.score_answer(
                    question=last_question,
                    candidate_answer=user_text
                )
                
                # Analyze with NLP
                interview_analyzer.add_answer(user_text, last_question)
                
                # Get next question/response from AI
                ai_reply = await get_ai_response(
                    session_data["resume_text"],
                    session_data["job_description"],
                    chat_history,
                    api_key=session_data.get("api_key"),
                    difficulty=session_data.get("difficulty", "medium")
                )
                
                chat_history.append({"role": "assistant", "content": ai_reply})
                interview_analyzer.add_interviewer_message(ai_reply)
                interview_session["question_count"] += 1
                
                # Signal new question to face detector
                if detector:
                    detector.start_new_question()
                
                # Generate and send audio response
                audio_bytes = generate_audio(ai_reply)
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8') if audio_bytes else None
                
                await websocket.send_json({
                    "type": "ai_turn",
                    "text": ai_reply,
                    "audio": audio_b64,
                    "question_number": interview_session["question_count"],
                    "last_answer_score": score_result["overall_score"]
                })
                
    except Exception as e:
        print(f"WebSocket closed or error: {e}")
    finally:
        interview_session["is_active"] = False
        interview_session["chat_history"] = chat_history


# ============== Real-time Metrics WebSocket ==============

@app.websocket("/ws/metrics")
async def metrics_websocket(websocket: WebSocket):
    """Stream real-time vision metrics."""
    await websocket.accept()
    try:
        while True:
            if detector and detector.latest_metrics:
                await websocket.send_json(detector.latest_metrics)
            else:
                await websocket.send_json({
                    "focus": 0, "emotion": 0, "confidence": 0, 
                    "stress": 0, "hint": "Loading..."
                })
            await asyncio.sleep(0.1) 
    except Exception as e:
        print(f"Metrics WS Error: {e}")


# ============== Video Stream ==============

@app.get("/api/stream")
async def video_feed():
    """MJPEG video stream with face detection overlay."""
    if detector:
        return StreamingResponse(
            detector.generate_frames(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )
    return JSONResponse({"error": "Camera not initialized"}, status_code=503)

@app.post("/api/stop-camera")
async def stop_camera():
    """Manually stop the camera."""
    if detector:
        detector.close_camera()
        return {"message": "Camera stopped"}
    return {"error": "No camera to stop"}


# ============== Analytics Endpoints ==============

@app.get("/api/analytics")
async def get_analytics():
    """Get comprehensive interview analytics."""
    vision_analytics = detector.get_session_analytics() if detector else {}
    scoring_summary = answer_scorer.get_summary()
    nlp_report = interview_analyzer.get_comprehensive_report()
    
    # Compute composite scores for radar chart
    technical_accuracy = scoring_summary.get("average_score", 50)
    
    # Communication based on vocabulary + filler rate
    filler_rate = nlp_report.get("filler_rate", 0)
    vocab_diversity = nlp_report.get("average_vocabulary_diversity", 0.5)
    communication = max(0, min(100, (vocab_diversity * 100) + (100 - filler_rate * 5)))
    
    # Confidence from vision
    confidence = vision_analytics.get("final_metrics", {}).get("confidence", 50)
    
    # Focus from eye contact
    focus = vision_analytics.get("overall_eye_contact_percentage", 50)
    
    # EQ from emotion + sentiment
    emotion_score = vision_analytics.get("final_metrics", {}).get("emotion", 50)
    sentiment = nlp_report.get("average_sentiment", 0)
    emotional_intelligence = (emotion_score * 0.6) + ((sentiment + 1) * 20)  # Map -1,1 to 0,40
    
    return {
        "radar_chart_data": {
            "technical_accuracy": round(technical_accuracy, 1),
            "communication": round(communication, 1),
            "confidence": round(confidence, 1),
            "focus": round(focus, 1),
            "emotional_intelligence": round(emotional_intelligence, 1)
        },
        "vision_analytics": vision_analytics,
        "scoring_summary": scoring_summary,
        "nlp_report": nlp_report,
        "interview_summary": {
            "total_questions": interview_session.get("question_count", 0),
            "talk_to_listen_ratio": nlp_report.get("talk_to_listen_ratio", 1.0)
        }
    }

@app.get("/api/analytics/timeline")
async def get_timeline():
    """Get metrics timeline for line charts."""
    if not detector:
        return {"timeline": []}
    
    analytics = detector.get_session_analytics()
    scores = answer_scorer.get_summary().get("scores_over_time", [])
    
    return {
        "vision_timeline": analytics.get("metrics_timeline", []),
        "per_question_metrics": analytics.get("per_question_metrics", []),
        "scores_timeline": scores,
        "sentiment_trend": interview_analyzer.get_comprehensive_report().get("sentiment_trend", [])
    }

@app.post("/api/analytics/feedback")
async def generate_feedback():
    """Generate AI feedback based on analytics."""
    analytics = await get_analytics()
    
    # Build prompt for AI feedback
    radar = analytics["radar_chart_data"]
    nlp = analytics["nlp_report"]
    
    prompt = f"""Based on this interview performance data, provide exactly 3 strengths and 3 areas for improvement.

Performance Scores (out of 100):
- Technical Accuracy: {radar['technical_accuracy']}
- Communication: {radar['communication']}
- Confidence: {radar['confidence']}
- Focus/Eye Contact: {radar['focus']}
- Emotional Intelligence: {radar['emotional_intelligence']}

Additional Metrics:
- Filler word rate: {nlp.get('filler_rate', 0)}%
- Talk-to-listen ratio: {nlp.get('talk_to_listen_ratio', 1)}
- Total answers analyzed: {nlp.get('total_answers', 0)}

Reply in this exact JSON format:
{{"strengths": ["strength1", "strength2", "strength3"], "improvements": ["area1", "area2", "area3"]}}
"""
    
    current_key = session_data.get("api_key") or os.getenv("OPENAI_API_KEY")
    if not current_key:
        return {
            "strengths": ["Good focus during interview", "Maintained steady composure", "Engaged with questions"],
            "improvements": ["Consider reducing filler words", "Provide more detailed examples", "Speak more confidently"]
        }
    
    try:
        response = await AsyncOpenAI(api_key=current_key).chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Feedback generation error: {e}")
        return {
            "strengths": ["Completed the interview", "Showed engagement", "Answered questions"],
            "improvements": ["Practice more technical depth", "Work on eye contact", "Reduce hesitation"]
        }


# ============== Legacy/Utility ==============

@app.websocket("/ws/video")
async def video_websocket(websocket: WebSocket):
    """Legacy video WebSocket for compatibility."""
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except:
        pass

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "HireByte AI",
        "version": "2.0.0",
        "camera_ready": detector is not None and detector.camera is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)