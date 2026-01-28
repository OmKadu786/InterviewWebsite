# 🤖 AI Technical Interviewer

> **Submitted for Google Alphabyte Hackathon** - Revolutionizing the way developers prepare for technical interviews.

## 🚀 Overview
**AI Technical Interviewer** is an advanced, interactive platform designed to simulate real-world technical interviews. By leveraging **Generative AI**, **Real-time Voice Processing**, and **Computer Vision**, we provide candidates with immediate, actionable feedback not just on their code, but on their confidence, communication, and emotional engagement.

Stop practicing in silence. Speak with an AI that listens, watches, and guides you to success.

## ✨ Key Features
- **🎙️ Voice-First Interaction**: Natural, conversational interview flow using advanced Speech-to-Text and Text-to-Speech (ElevenLabs).
- **👁️ Emotion & Confidence Analysis**: Real-time face tracking detects user emotions (stress, focus, confidence) to provide holistic feedback.
- **🧠 Context-Aware AI**: Upload your resume and job description to get a tailored interview experience powered by LLMs.
- **⚡ Real-time Feedback**: Instant transcription and response generation.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **Backend**: Python, FastAPI, WebSockets.
- **AI Services**: OpenAI (LLM), ElevenLabs (Voice), Whisper (Transcription).

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+
- API Keys for OpenAI & ElevenLabs

### 1. Backend Setup
The backend handles the AI logic, voice processing, and PDF parsing.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create a .env file with your keys:
# OPENAI_API_KEY=...
# ELEVENLABS_API_KEY=...
# VOICE_ID=pNInz6obpgDQGcFmaJgB (Adam)

uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
The frontend provides the immersive interview interface.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to start your interview session!

## 👥 Contributors & Credits

| Team Member | Role | Contribution |
| :--- | :--- | :--- |
| **Pranav Thorat** | **Frontend Lead** | Architected the user interface and core website functionality, ensuring a seamless and responsive user experience. |
| **Om Kadu** | **Backend Lead** | The "Brain" of the project. Developed the entire LLM integration, API infrastructure, and real-time processing logic. |
| **Aaryan Nerkar** | **AI Engineer** | Implemented the Face Tracking AI and emotion analysis engine, enabling the system to read and respond to user non-verbal cues. |

---