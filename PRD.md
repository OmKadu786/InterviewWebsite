# Product Requirements Document (PRD)
# HireByte AI Interview Platform

## 1. Introduction
**Product Name:** HireByte AI Interview Platform
**Version:** 1.0.0
**Status:** Released / In-Development
**Owner:** Alphabyte Team

**Overview:**
HireByte is an AI-powered mock interview platform designed to simulate real-world technical interviews. It provides users with a comprehensive environment to practice coding, system design, and behavioral questions. The platform features a real-time AI interviewer, detailed analytics via the RIPIS dashboard, and smart feedback mechanisms to help candidates improve their interview performance.

## 2. Target Audience
- **Job Seekers:** Software engineers, data scientists, and product managers preparing for technical interviews.
- **Students:** Computer science students looking to practice core concepts (DSA, OS, DBMS).
- **Recruiters:** (Potential future scope) To automate preliminary screening.

## 3. Core Features

### 3.1 AI Interviewer
- **Functionality:** Conducts natural language interviews using LLM-based logic.
- **Inputs:** User voice (Mic) or text chat.
- **Outputs:** Voice response (TTS) and text transcript.
- **Logic:** Adaptive questioning based on user responses and selected difficulty (Easy/Medium/Hard).

### 3.2 Real-time Interface (Webcam Overlay)
- **Smart Overlay:** Displays real-time metrics directly on the user's webcam feed.
- **Metrics Displayed:**
  - **Confidence:** Percentage score based on voice tone and facial expression.
  - **Focus:** Attention tracking.
  - **Emotion:** Detects stress, neutrality, or confidence.
- **Hints System:**
  - Provides hints on demand (Small/Medium/Full).
  - Hints are context-aware, referencing the candidate's resume and current transcript.

### 3.3 RIPIS Dashboard (Analytics)
- **Overview:** A comprehensive post-interview report.
- **Visuals:**
  - **Readiness Ring:** Circular progress showing overall interview readiness (Tech + Reasoning + Autonomy + Soft Skills).
  - **Topic Mastery Radar:** Radar chart covering DSA, OS, DBMS, Networking, and Soft Skills.
  - **Reasoning Density:** Bar charts showing "Technical Logic per Minute".
  - **Thinking Flow:** Area chart tracking clarity over time.
- **Design:** "Antigravity Modern" dark theme with glassmorphism and neon accents (`#020617` background).

### 3.4 Feedback Generation
- **Functionality:** Generates a detailed feedback report after the interview.
- **Content:**
  - **Strengths:** Verified skills and good responses.
  - **Improvements:** Specific areas to work on.
- **Context:** Uses full interview transcript, video metrics, and resume context for personalized advice.

## 4. User Flow
1.  **Landing Page:** User logs in/starts guest session.
2.  **Setup:** User selects Interview Topic (e.g., Python, React) and Difficulty.
3.  **Interview Session:**
    -   User grants Webcam/Mic permissions.
    -   AI asks questions.
    -   User responds via voice.
    -   Real-time analysis runs in background.
4.  **Completion:** User clicks "End Interview".
5.  **Analysis:** System processes transcript and metrics.
6.  **Report:** User views the RIPIS Dashboard and Feedback Report.

## 5. Technical Architecture
### 5.1 Frontend
-   **Framework:** React (Vite)
-   **Styling:** TailwindCSS, Framer Motion
-   **State Management:** React Context / Local State
-   **Components:** `CandidateReport.tsx`, `VideoAnalysis.tsx`, `ChatBox.tsx`

### 5.2 Backend
-   **Framework:** Python FastAPI
-   **AI Services:**
    -   **LLM:** Gemini/OpenAI (via `llm_service.py`)
    -   **TTS/STT:** Local or cloud-based engines.
    -   **Computer Vision:** OpenCV (for emotion/face detection).
-   **Database:** (Implicit/Session-based for now).

### 5.3 Infrastructure
-   **Hosting:** Localhost (currently).
-   **MCP Integration:**
    -   **TestSprite:** For automated testing and validation.
    -   **Stitch:** For tool orchestration.

## 6. Non-Functional Requirements
-   **Performance:** UI should be responsive (60fps). real-time overlay latency < 200ms.
-   **Security:** API keys (LLM) must be stored securely `env`.
-   **Accessibility:** High contrast text, clear audio.
-   **Reliability:** Auto-reconnect for WebSocket (if used for streaming).

## 7. Success Metrics
-   **Hint Accuracy:** Hints must be relevant to the resume 95% of the time.
-   **Feedback Utility:** Feedback must provide at least 3 actionable items per session.
-   **System Stability:** Zero crashes during a 30-minute interview session.
