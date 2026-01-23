from fastapi import FastAPI, WebSocket, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import json
import base64

# Import your services
from services.pdf_service import extract_text_from_pdf
from services.llm_service import get_initial_greeting
from services.tts_service import generate_audio

app = FastAPI()

# Enable CORS so your React app can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global store for this session (for simplicity)
session_data = {"resume_text": "", "job_description": ""}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    # 1. Read the PDF
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    
    # 2. Store it for the interview
    session_data["resume_text"] = text
    session_data["job_description"] = job_description
    
    return {"message": "Resume and JD processed successfully!"}

@app.websocket("/ws/interview")
async def interview_websocket(websocket: WebSocket):
    await websocket.accept()
    
    # IMMEDIATELY start the interview once connected
    if session_data["resume_text"]:
        # 1. Generate text
        greeting_text = await get_initial_greeting(
            session_data["resume_text"], 
            session_data["job_description"]
        )
        
        # 2. Generate audio
        audio_bytes = generate_audio(greeting_text)
        
        # 3. Send to frontend (Base64 encoded audio so JS can play it)
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        await websocket.send_json({
            "type": "ai_turn",
            "text": greeting_text,
            "audio": audio_b64
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)