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
    Generate accurate, resume-grounded hints using gpt-4o-mini.
    Strictly references only the candidate's actual resume content.
    Supports three levels: small (direction), medium (approach), full (partial outline)
    """
    
    level_instructions = {
        "small": """OUTPUT FORMAT:
- Give exactly ONE sentence as a directional hint.
- Start with: "Based on your experience with [specific resume item]..."
- Do NOT name specific algorithms, methods, or code.
- Just point them toward the right area of their own experience.""",
        "medium": """OUTPUT FORMAT:
- Give 2-3 bullet points maximum.
- Each bullet MUST reference a specific skill, project, or technology from the resume.
- Mention key concepts they should address, connecting to their actual experience.
- Do NOT provide code or specific implementations.
- Help them structure their answer using what they already know.""",
        "full": """OUTPUT FORMAT:
- Provide a structured outline with 3-4 key points.
- Each point MUST connect to a specific project, skill, or experience from the resume.
- Show HOW their past work relates to the answer needed.
- Include 2-3 critical talking points they should mention.
- Do NOT give the complete answer — leave gaps for the candidate to fill.
- Frame it as: "From your [project/skill], you can explain..."
"""
    }
    
    hint_level = level_instructions.get(level, level_instructions["medium"])
    
    system_prompt = f"""You are a precise interview coach. Your ONLY job is to help this candidate answer the current interview question by connecting it to their ACTUAL resume content.

=== CANDIDATE'S RESUME (THIS IS YOUR ONLY SOURCE OF TRUTH) ===
{resume_text}

=== JOB DESCRIPTION ===
{job_desc}

=== CURRENT QUESTION ===
Topic: {topic}
Question: "{question}"

=== HINT LEVEL: {level.upper()} ===
{hint_level}

=== STRICT RULES (MUST FOLLOW) ===
1. ONLY reference technologies, projects, skills, and experiences that are EXPLICITLY mentioned in the resume above.
2. NEVER mention any technology, framework, or concept that does NOT appear in the resume.
3. NEVER hallucinate or invent projects, skills, or experiences the candidate doesn't have.
4. If the resume doesn't contain relevant information for this question, say: "This topic isn't directly covered in your resume. Focus on your general problem-solving approach and any transferable skills."
5. Be specific — instead of "your project", say the actual project name from the resume.
6. Be concise and actionable — the candidate needs to answer quickly.
7. For technical questions (DSA/OS/DBMS): connect the concept to a real project or skill from their resume.
8. Never repeat the question back. Jump straight into the hint."""
    
    messages = [{"role": "system", "content": system_prompt}]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.1,
            max_tokens=150 if level == "small" else 300 if level == "medium" else 500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error (Hint): {e}")
        return "Focus on your relevant experience and how it aligns with the job requirements."