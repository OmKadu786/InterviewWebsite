import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def get_ai_response(candidate_summary: str, job_desc: str, chat_history: list, 
                          interview_context: str = "") -> str:
    """
    Generate the next interview question based on the structured plan.
    
    Args:
        candidate_summary: Compact profile summary (not raw resume)
        job_desc: Job description
        chat_history: Conversation history
        interview_context: Current step info from InterviewState
    """
    system_prompt = f"""You are a professional interviewer conducting a structured job interview.

JOB ROLE: {job_desc}

CANDIDATE PROFILE:
{candidate_summary}

INTERVIEW PLAN STATUS:
{interview_context}

BEHAVIOR RULES:
- Ask exactly ONE question per turn. Keep your response under 3 sentences.
- Your question MUST target the topic specified in the plan status above.
- If this is the introduction category: introduce yourself with a professional name and title, then ask the candidate to introduce themselves.
- If this is the closing category: thank the candidate, summarize the interview briefly, and ask if they have any questions.
- For technical questions: ask specific, practical questions — not generic textbook definitions. Reference the candidate's actual projects/skills when possible.
- For project deep-dive: ask about architecture decisions, challenges faced, tradeoffs, and outcomes.
- For gap probing: ask about the missing skill without making the candidate feel tested — frame it as curiosity.
- For behavioral: use the STAR format (Situation, Task, Action, Result) framing.
- Do NOT repeat any topic already covered (listed in the plan status).
- Transition naturally between questions — briefly acknowledge the previous answer before asking the next question.
- Sound like a real human interviewer, not a question-reading bot."""

    messages = [{"role": "system", "content": system_prompt}] + chat_history
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=250
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return "I'm the AI Interviewer. Please configure your OPENAI_API_KEY in the backend/.env file to enable my intelligence! For now, let's pretend I asked you a question about your resume."


async def evaluate_answer(question: str, answer: str, category: str, topic: str,
                          candidate_summary: str, job_desc: str) -> dict:
    """
    Evaluate a candidate's answer on accuracy, depth, and clarity.
    Returns scores from 1-10 for each dimension.
    
    This runs after each user response to score their answer.
    """
    eval_prompt = f"""You are an interview evaluation expert. Score this candidate's answer.

JOB ROLE: {job_desc}
CANDIDATE PROFILE: {candidate_summary}
INTERVIEW CATEGORY: {category}
TOPIC: {topic}

QUESTION ASKED: {question}
CANDIDATE'S ANSWER: {answer}

Score the answer on three dimensions (1-10 each):
- accuracy: How correct and relevant is the answer? (1=wrong/irrelevant, 10=perfectly accurate)
- depth: How thorough and detailed is the response? (1=superficial, 10=comprehensive with examples)
- clarity: How well-structured and articulate is the answer? (1=confusing/rambling, 10=clear and concise)

Return ONLY valid JSON: {{"accuracy": N, "depth": N, "clarity": N}}
No explanation, no markdown, just the JSON object."""

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": eval_prompt}],
            temperature=0.2,
            max_tokens=50
        )
        
        raw = response.choices[0].message.content.strip()
        
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()
        
        scores = json.loads(raw)
        
        # Validate and clamp scores
        for key in ["accuracy", "depth", "clarity"]:
            scores[key] = max(1, min(10, int(scores.get(key, 5))))
        
        return scores
        
    except Exception as e:
        print(f"Answer evaluation error: {e}")
        return {"accuracy": 5, "depth": 5, "clarity": 5}


async def get_hint(question, resume_text, job_desc, level="medium", topic="General"):
    """
    Generate topic-aware, progressive hints based on resume and job description.
    Supports three levels: small (direction), medium (approach), full (partial outline)
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
            Provide a PARTIAL solution outline only.
            - Show the key steps or structure of the solution
            - Include 2-3 critical points to mention
            - Do NOT give the complete answer
            - Leave gaps for the candidate to fill in themselves
            - Can reference their resume/projects for context
        """
    }
    
    hint_level = level_instructions.get(level, level_instructions["medium"])
    
    system_prompt = f"""
    You are a helpful mentor assisting a candidate during an interview practice session.
    
    JOB DESCRIPTION: {job_desc}
    
    CANDIDATE'S RESUME: {resume_text}
    
    QUESTION TOPIC: {topic}
    The interviewer just asked: "{question}"
    
    HINT LEVEL: {level.upper()}
    {hint_level}
    
    IMPORTANT GUIDELINES:
    - Tailor your hint specifically to the {topic} domain
    - Base your hints on the candidate's ACTUAL resume and experience
    - Reference specific projects, skills, or experiences from their resume when relevant
    - Be encouraging and professional
    - Help them connect their experience to the job requirements
    - For DSA questions: focus on algorithmic thinking and data structure choice
    - For OS questions: focus on process/memory/scheduling concepts
    - For DBMS questions: focus on schema design, normalization, query optimization
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