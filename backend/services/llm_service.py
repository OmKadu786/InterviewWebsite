import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_ai_response(resume_text, job_desc, chat_history):
    system_prompt = f"""
    You are a professional interviewer.
    JOB: {job_desc}
    RESUME: {resume_text}
    
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
        return "I'm the AI Interviewer. Please configure your OPENAI_API_KEY in the backend/.env file to enable my intelligence! For now, let's pretend I asked you a question about your resume."