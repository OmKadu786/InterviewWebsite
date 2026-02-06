import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_ai_response(resume_text, job_desc, chat_history):
    system_prompt = f"""
    Check what company user is applying for in the job description.
    You are a professional interviewer. If user doesnt specify a company in job description, give yourself a male name and a company(thats sounds legitimate).
    JOB: {job_desc}
    RESUME: {resume_text}
    
    STAGES:
    1. First introduce yourself. Along with your position in the company. Call the user by their full name(if given in the resumé) and let the first question always be for the user/person/interviewee to introduce themselves.
    2. Move to technical and non-technical questions based on the resume.
    3. Switch between technical and non-technical questions.
    4. Ask questions based on the resume and/or projects.
    5. Once you are satisfied with the questions and in about 8-10 questions, complete the interview.
    
    RULES: Ask ONE question at a time. Keep responses under 3 sentences.
    """
    
    messages = [{"role": "system", "content": system_prompt}] + chat_history
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return "I'm the AI Interviewer. Please configure your OPENAI_API_KEY in the backend/.env file to enable my intelligence! For now, let's pretend I asked you a question about your resume."

async def get_hint(question, resume_text, job_desc, level=1):
    base_instructions = f"""
    You are a helpful mentor assisting a candidate during an interview.
    JOB: {job_desc}
    RESUME: {resume_text}
    The interviewer just asked: "{question}"
    """

    if level == 1:
        specific_instruction = """
        Provide a SUBTLE CONCEPTUAL HINT (Level 1/3).
        - valid points: 1-2 bullet points.
        - content: Mention key concepts or terms they should think about.
        - restriction: Do NOT give the answer or steps. Just point them in the right direction.
        """
    elif level == 2:
        specific_instruction = """
        Provide a STRUCTURAL HINT (Level 2/3).
        - valid points: 2-3 steps or a high-level strategy.
        - content: Outline HOW to approach the answer.
        - restriction: Do not write the full code or final solution.
        """
    else:  # Level 3 or higher
        specific_instruction = """
        Provide a STRONG HINT / PARTIAL SOLUTION (Level 3/3).
        - valid points: Key lines of pseudocode or the critical insight needed.
        - content: Unblock them completely.
        - restriction: Still keep it concise (under 4 sentences).
        """

    system_prompt = base_instructions + specific_instruction
    
    messages = [{"role": "system", "content": system_prompt}]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error (Hint): {e}")
        return "Focus on your relevant experience and how it aligns with the job requirements."