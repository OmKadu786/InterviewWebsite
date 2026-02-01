import os
import json
import base64
from fastapi import FastAPI, WebSocket, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Import fixed: using the new function name to avoid ImportError
from services.pdf_service import extract_text_from_pdf
from services.llm_service import get_ai_response, get_hint
from services.tts_service import generate_audio
from services.video_service import process_video_frame, Stabilizer

load_dotenv()

app = FastAPI()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

session_data = {"resume_text": "", "job_description": ""}

class HintRequest(BaseModel):
    question: str

@app.post("/get-hint")
async def get_interview_hint(request: HintRequest):
    if not session_data["resume_text"]:
        return {"hint": "Please upload a resume first."}
    
    hint = await get_hint(request.question, session_data["resume_text"], session_data["job_description"])
    return {"hint": hint}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    session_data["resume_text"] = text
    session_data["job_description"] = job_description
    return {"message": "Data processed successfully!"}

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
    
    # Track history for this specific connection
    chat_history = []
    
    # 1. Automatic Greeting
    if session_data["resume_text"]:
        response_text = await get_ai_response(
            session_data["resume_text"], 
            session_data["job_description"],
            chat_history
        )
        
        chat_history.append({"role": "assistant", "content": response_text})
        audio_bytes = generate_audio(response_text)
        if audio_bytes:
            audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        else:
            audio_b64 = None
        
        await websocket.send_json({
            "type": "ai_turn",
            "text": response_text,
            "audio": audio_b64
        })

    # 2. Conversation Loop
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            if msg["type"] == "user_turn":
                # Add user message to history
                chat_history.append({"role": "user", "content": msg["text"]})
                
                # Get next question/response from AI
                ai_reply = await get_ai_response(
                    session_data["resume_text"],
                    session_data["job_description"],
                    chat_history
                )
                
                chat_history.append({"role": "assistant", "content": ai_reply})
                
                # Generate and send audio response
                audio_bytes = generate_audio(ai_reply)
                if audio_bytes:
                    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                else:
                    audio_b64 = None
                
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
                await websocket.send_json(result)
    except Exception as e:
        print(f"Video WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)