from datetime import datetime, timedelta
from typing import List, Optional, Dict
from bson import ObjectId
from config.database import interviews_collection, analytics_collection
from models.interview_schema import InterviewReport

class InterviewService:
    
    @staticmethod
    async def save_interview(report: InterviewReport) -> str:
        """Save interview report to database"""
        # FIXED: Changed .dict() to .model_dump() for Pydantic v2
        report_dict = report.model_dump(by_alias=True, exclude={"id"})
        result = await interviews_collection.insert_one(report_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_interview_by_id(interview_id: str) -> Optional[InterviewReport]:
        """Get interview by ID"""
        interview = await interviews_collection.find_one({"_id": ObjectId(interview_id)})
        if interview:
            interview["_id"] = str(interview["_id"])
            return InterviewReport(**interview)
        return None
    
    @staticmethod
    async def get_user_interviews(user_id: str, limit: int = 10) -> List[InterviewReport]:
        """Get all interviews for a user"""
        cursor = interviews_collection.find({"user_id": user_id}).sort("interview_date", -1).limit(limit)
        interviews = await cursor.to_list(length=limit)
        
        for interview in interviews:
            interview["_id"] = str(interview["_id"])
        
        return [InterviewReport(**i) for i in interviews]
    
    @staticmethod
    async def get_progress_data(user_id: str) -> Dict:
        """Get user's progress over time"""
        interviews = await interviews_collection.find(
            {"user_id": user_id}
        ).sort("interview_date", 1).to_list(length=100)
        
        progress = {
            "dates": [],
            "scores": [],
            "eye_contact": [],
            "confidence": [],
            "total_interviews": len(interviews)
        }
        
        for interview in interviews:
            progress["dates"].append(interview["interview_date"].isoformat())  # FIXED: Convert to ISO string
            progress["scores"].append(interview["overall_semantic_score"])
            progress["eye_contact"].append(interview["vision_metrics"]["eye_contact_percentage"])
            progress["confidence"].append(interview["vision_metrics"]["steadiness_score"])
        
        return progress
    
    @staticmethod
    async def get_comparison_stats(user_id: str, job_role: str) -> Dict:
        """Compare user's performance with others in same role"""
        # User's average
        user_interviews = await interviews_collection.find(
            {"user_id": user_id, "job_role": job_role}
        ).to_list(length=None)
        
        if not user_interviews:
            return None
        
        user_avg = sum(i["overall_semantic_score"] for i in user_interviews) / len(user_interviews)
        
        # Global average for role
        all_interviews = await interviews_collection.find(
            {"job_role": job_role}
        ).to_list(length=None)
        
        global_avg = sum(i["overall_semantic_score"] for i in all_interviews) / len(all_interviews)
        
        return {
            "user_average": user_avg,
            "global_average": global_avg,
            "percentile": calculate_percentile(user_avg, [i["overall_semantic_score"] for i in all_interviews]),
            "total_attempts": len(user_interviews)
        }
    
    @staticmethod
    async def get_analytics_summary(user_id: str) -> Dict:
        """Get comprehensive analytics summary"""
        interviews = await interviews_collection.find(
            {"user_id": user_id}
        ).to_list(length=None)
        
        if not interviews:
            return None
        
        total = len(interviews)
        avg_score = sum(i["overall_semantic_score"] for i in interviews) / total
        
        # Get most recent interview
        latest = max(interviews, key=lambda x: x["interview_date"])
        
        # Calculate improvement
        if total > 1:
            first = min(interviews, key=lambda x: x["interview_date"])
            improvement = ((latest["overall_semantic_score"] - first["overall_semantic_score"]) 
                          / first["overall_semantic_score"] * 100)
        else:
            improvement = 0
        
        return {
            "total_interviews": total,
            "average_score": avg_score,
            "latest_score": latest["overall_semantic_score"],
            "improvement_percentage": improvement,
            "best_score": max(i["overall_semantic_score"] for i in interviews),
            "worst_score": min(i["overall_semantic_score"] for i in interviews),
            "average_eye_contact": sum(i["vision_metrics"]["eye_contact_percentage"] for i in interviews) / total,
            "most_common_emotion": get_most_common_emotion(interviews)
        }

def calculate_percentile(score: float, all_scores: List[float]) -> float:
    """Calculate percentile rank"""
    if not all_scores:
        return 0
    below = sum(1 for s in all_scores if s < score)
    return (below / len(all_scores)) * 100

def get_most_common_emotion(interviews: List[Dict]) -> str:
    """Get most common emotion across interviews"""
    emotions = []
    for interview in interviews:
        emotions.append(interview["vision_metrics"]["average_emotion"])
    if not emotions:
        return "neutral"
    return max(set(emotions), key=emotions.count)
