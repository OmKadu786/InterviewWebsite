import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def get_ai_response(resume_text, job_desc, chat_history, api_key=None, difficulty="medium"):
    current_key = api_key or os.getenv("OPENAI_API_KEY")
    if not current_key:
         print("ERROR: No API Key found in env or request!")
    else:
         print(f"DEBUG: Using API Key starting with {current_key[:5]}...")

    if not current_key or "dummy" in current_key:
         return "I'm the AI Interviewer. Please enter your valid OpenAI API Key in the setup screen to start the interview!"
    
    # Difficulty settings
    difficulty_instructions = {
        "easy": "Be friendly and encouraging. Ask basic questions. Give hints if the candidate struggles.",
        "medium": "Be professional and balanced. Ask standard interview questions with moderate depth.",
        "hard": "Be rigorous and challenging. Ask deep technical questions. Push the candidate with follow-up questions."
    }
    
    client = AsyncOpenAI(api_key=current_key)
    system_prompt = f"""
    You are a professional interviewer.
    JOB: {job_desc}
    RESUME: {resume_text}
    
    DIFFICULTY: {difficulty.upper()}
    {difficulty_instructions.get(difficulty, difficulty_instructions["medium"])}
    
    STAGES:
    1. First introduce yourself, any fake name is fine. Along with your position in the company.
    2. Move to technical/non-technical questions based on the resume.
    3. Switch between technical and non-technical questions.
    4. Ask questions based on the resume and/or projects.
    5. Once you are satisfied with the questions, complete the interview.
    
    RULES: Ask ONE question at a time. Keep responses under 3 sentences.
    """
    
    messages = [{"role": "system", "content": system_prompt}] + chat_history
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return "I am ready to interview you. Please upload your resume and job description to begin."