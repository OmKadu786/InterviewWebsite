from datetime import datetime
from typing import List, Optional, Dict
from config.database import supabase
from models.interview_schema import InterviewReport
import json

class InterviewService:
    
    @staticmethod
    async def save_interview(report: InterviewReport) -> str:
        """Save interview report to Supabase"""
        if not supabase:
            raise Exception("Supabase not configured")

        report_dict = report.model_dump(by_alias=True, exclude={"id"}, mode='json')
        
        # Map to Supabase table schema
        # feedback_json stores the COMPLETE structured report for full fidelity
        data = {
            "user_id": report.user_id,
            "role_title": report.job_role,
            "job_description": report.job_description or "",
            "resume_text": "", # report doesn't enforce this field, assuming empty or handled elsewhere
            "status": "completed",
            "performance_score": report.overall_semantic_score,
            "feedback_json": report_dict,
            "created_at": report.interview_date.isoformat()
        }
        
        # Determine if resume_text can be extracted or looked up
        # For now, we store the full report in feedback_json which contains everything needed for the UI
        
        response = supabase.table("interviews").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]["id"]
        raise Exception("Failed to save interview to Supabase")
    
    @staticmethod
    async def get_interview_by_id(interview_id: str) -> Optional[InterviewReport]:
        """Get interview by ID"""
        if not supabase:
            return None

        response = supabase.table("interviews").select("*").eq("id", interview_id).execute()
        
        if response.data and len(response.data) > 0:
            record = response.data[0]
            # Content is stored in feedback_json
            report_data = record["feedback_json"]
            # Ensure ID matches the Supabase ID
            report_data["_id"] = record["id"]
            return InterviewReport(**report_data)
        return None
    
    @staticmethod
    async def get_user_interviews(user_id: str, limit: int = 10) -> List[Dict]:
        """Get all interviews for a user (Metadata only for listing)"""
        if not supabase:
            return []

        response = supabase.table("interviews")\
            .select("id, role_title, created_at, performance_score, status")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
            
        return response.data if response.data else []
    
    @staticmethod
    async def get_progress_data(user_id: str) -> Dict:
        """Get user's progress over time"""
        if not supabase:
            return {}

        # Fetch last 20 interviews to calculate progress
        response = supabase.table("interviews")\
            .select("created_at, performance_score, feedback_json")\
            .eq("user_id", user_id)\
            .order("created_at", desc=False)\
            .limit(20)\
            .execute()
            
        interviews = response.data or []
        
        progress = {
            "dates": [],
            "scores": [],
            "eye_contact": [],
            "confidence": [],
            "total_interviews": len(interviews)
        }
        
        for i in interviews:
            report = i.get("feedback_json", {})
            vision = report.get("vision_metrics", {})
            
            progress["dates"].append(i["created_at"])
            progress["scores"].append(i["performance_score"])
            progress["eye_contact"].append(vision.get("eye_contact_percentage", 0))
            progress["confidence"].append(vision.get("steadiness_score", 0))
        
        return progress
    
    @staticmethod
    async def get_comparison_stats(user_id: str, job_role: str) -> Dict:
        """Compare user's performance with others in same role"""
        if not supabase:
            return None

        # User's average
        user_res = supabase.table("interviews").select("performance_score").eq("user_id", user_id).eq("role_title", job_role).execute()
        user_scores = [i["performance_score"] for i in (user_res.data or [])]
        
        if not user_scores:
            return None
            
        user_avg = sum(user_scores) / len(user_scores)
        
        # Global average
        global_res = supabase.table("interviews").select("performance_score").eq("role_title", job_role).execute()
        all_scores = [i["performance_score"] for i in (global_res.data or [])]
        
        if not all_scores:
            return None
            
        global_avg = sum(all_scores) / len(all_scores)
        
        return {
            "user_average": user_avg,
            "global_average": global_avg,
            "percentile": calculate_percentile(user_avg, all_scores),
            "total_attempts": len(user_scores)
        }
    
    @staticmethod
    async def get_analytics_summary(user_id: str) -> Dict:
        """Get comprehensive analytics summary"""
        if not supabase:
            return None

        response = supabase.table("interviews")\
            .select("performance_score, feedback_json, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
            
        interviews = response.data or []
        if not interviews:
            return None
            
        total = len(interviews)
        scores = [i["performance_score"] for i in interviews]
        avg_score = sum(scores) / total
        latest = interviews[0]
        first = interviews[-1]
        
        improvement = 0
        if total > 1 and first["performance_score"] > 0:
            improvement = ((latest["performance_score"] - first["performance_score"]) 
                          / first["performance_score"] * 100)
                          
        # Aggregate stats from feedback_json
        eye_contact_sum = 0
        emotions = []
        
        for i in interviews:
            fb = i.get("feedback_json", {})
            vision = fb.get("vision_metrics", {})
            eye_contact_sum += vision.get("eye_contact_percentage", 0)
            emotions.append(vision.get("average_emotion", "neutral"))
            
        return {
            "total_interviews": total,
            "average_score": avg_score,
            "latest_score": latest["performance_score"],
            "improvement_percentage": improvement,
            "best_score": max(scores),
            "worst_score": min(scores),
            "average_eye_contact": eye_contact_sum / total,
            "most_common_emotion": max(set(emotions), key=emotions.count) if emotions else "neutral"
        }

def calculate_percentile(score: float, all_scores: List[float]) -> float:
    """Calculate percentile rank"""
    if not all_scores:
        return 0
    below = sum(1 for s in all_scores if s < score)
    return (below / len(all_scores)) * 100
