import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_ai_response(resume_text, job_desc, chat_history):
    system_prompt = f"""
    You are a professional technical interviewer.
    JOB: {job_desc}
    RESUME: {resume_text}
    
    STAGES:
    1. Start with 1-3 intro questions.
    2. Move to technical/non-technical questions based on the resume.
    
    RULES: Ask ONE question at a time. Keep responses under 3 sentences.
    """
    
    messages = [{"role": "system", "content": system_prompt}] + chat_history
    
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    return response.choices[0].message.content