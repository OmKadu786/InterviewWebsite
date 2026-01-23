import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Using AsyncOpenAI for better performance in FastAPI
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_initial_greeting(resume_text, job_desc):
    prompt = f"""
    You are a professional interviewer. 
    Candidate Resume: {resume_text}
    Target Job Description: {job_desc}
    
    Task: 
    1. Introduce yourself briefly.
    2. Acknowledge a specific highlight from the resume.
    3. Ask one opening interview question to start the session.
    
    Keep the tone professional and the response concise (max 3-4 sentences).
    """
    
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}]
    )
    
    return response.choices[0].message.content