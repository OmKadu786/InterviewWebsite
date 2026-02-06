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

async def get_hint(question, resume_text, job_desc, level="medium"):
    """
    Generate contextual hints based on resume and job description.
    Supports three levels: small, medium, full
    """
    
    level_instructions = {
        "small": """
            Give ONE short directional hint only.
            - Maximum 1 sentence
            - Do NOT name specific algorithms or methods
            - Do NOT provide any code
            - Just point them in the right direction
        """,
        "medium": """
            Explain the approach at a high level.
            - 2-3 bullet points maximum
            - Mention key concepts they should address
            - Do NOT provide code or specific implementations
            - Help them structure their thinking
        """,
        "full": """
            Provide a comprehensive answer guide.
            - Include key points to mention
            - Suggest a structure for the answer
            - Can include specific examples from their resume
            - Still encourage them to express in their own words
        """
    }
    
    hint_level = level_instructions.get(level, level_instructions["medium"])
    
    system_prompt = f"""
    You are a helpful mentor assisting a candidate during an interview practice session.
    
    JOB DESCRIPTION: {job_desc}
    
    CANDIDATE'S RESUME: {resume_text}
    
    The interviewer just asked: "{question}"
    
    HINT LEVEL: {level.upper()}
    {hint_level}
    
    IMPORTANT GUIDELINES:
    - Base your hints on the candidate's ACTUAL resume and experience
    - Reference specific projects, skills, or experiences from their resume when relevant
    - Be encouraging and professional
    - Help them connect their experience to the job requirements
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=200 if level == "small" else 400 if level == "medium" else 600
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error (Hint): {e}")
        return "Focus on your relevant experience and how it aligns with the job requirements."