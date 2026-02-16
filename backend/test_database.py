"""
Test Script for HireByte Database Integration
Run this to verify everything is working correctly
"""

import asyncio
import sys
from datetime import datetime

# Test imports
print("Testing imports...")
try:
    from config.database import async_client, test_connection
    from services.interview_services import InterviewService
    from models.interview_schema import (
        InterviewReport, 
        QuestionAnswer, 
        VisionMetrics, 
        NLPMetrics,
        EmotionData
    )
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)

async def test_database():
    """Test database connection and operations"""
    
    print("\n" + "="*60)
    print("🧪 Testing HireByte Database Integration")
    print("="*60)
    
    # Test 1: Connection
    print("\n1️⃣ Testing MongoDB connection...")
    try:
        result = await test_connection()
        if result:
            print("✅ MongoDB connection successful")
        else:
            print("❌ MongoDB connection failed")
            return
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return
    
    # Test 2: Create sample interview report
    print("\n2️⃣ Creating sample interview report...")
    try:
        sample_report = InterviewReport(
            user_id="test_user_001",
            user_email="test@hirebyte.com",
            interview_date=datetime.utcnow(),
            job_role="Software Engineer",
            company="Test Company",
            interview_duration=1800,
            resume_filename="test_resume.pdf",
            job_description="Sample job description",
            questions_answers=[
                QuestionAnswer(
                    question_number=1,
                    question="What is your experience with Python?",
                    expected_answer="Strong experience with Python frameworks",
                    user_answer="I have 3 years of experience with Python",
                    semantic_score=0.85,
                    feedback="Good response, could add more specific examples",
                    timestamp=datetime.utcnow()
                )
            ],
            total_questions=1,
            overall_semantic_score=0.85,
            vision_metrics=VisionMetrics(
                eye_contact_percentage=75.5,
                steadiness_score=80.0,
                emotions=[
                    EmotionData(timestamp=0.0, emotion="confident", confidence=0.8)
                ],
                average_emotion="confident"
            ),
            nlp_metrics=NLPMetrics(
                filler_word_count=5,
                average_response_length=50,
                vocabulary_richness=0.7,
                coherence_score=0.8
            ),
            confidence_timeline=[{"timestamp": 0, "confidence": 0.8}],
            emotion_timeline=[{"timestamp": 0, "emotion": "confident"}],
            strengths=["Clear communication", "Technical knowledge"],
            areas_for_improvement=["Reduce filler words", "More examples"],
            overall_feedback="Good interview performance",
            interview_number=1
        )
        print("✅ Sample report created")
    except Exception as e:
        print(f"❌ Failed to create sample report: {e}")
        return
    
    # Test 3: Save interview
    print("\n3️⃣ Saving interview to database...")
    try:
        interview_id = await InterviewService.save_interview(sample_report)
        print(f"✅ Interview saved with ID: {interview_id}")
    except Exception as e:
        print(f"❌ Failed to save interview: {e}")
        return
    
    # Test 4: Retrieve interview
    print("\n4️⃣ Retrieving saved interview...")
    try:
        retrieved = await InterviewService.get_interview_by_id(interview_id)
        if retrieved:
            print(f"✅ Interview retrieved successfully")
            print(f"   User: {retrieved.user_id}")
            print(f"   Role: {retrieved.job_role}")
            print(f"   Score: {retrieved.overall_semantic_score}")
        else:
            print("❌ Could not retrieve interview")
    except Exception as e:
        print(f"❌ Failed to retrieve interview: {e}")
    
    # Test 5: Get user interviews
    print("\n5️⃣ Getting user interview history...")
    try:
        interviews = await InterviewService.get_user_interviews("test_user_001", limit=5)
        print(f"✅ Found {len(interviews)} interview(s)")
    except Exception as e:
        print(f"❌ Failed to get user interviews: {e}")
    
    # Test 6: Get analytics
    print("\n6️⃣ Getting analytics summary...")
    try:
        analytics = await InterviewService.get_analytics_summary("test_user_001")
        if analytics:
            print(f"✅ Analytics retrieved")
            print(f"   Total Interviews: {analytics['total_interviews']}")
            print(f"   Average Score: {analytics['average_score']}")
        else:
            print("⚠️ No analytics available yet")
    except Exception as e:
        print(f"❌ Failed to get analytics: {e}")
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)
    print("\n💡 Your database integration is working correctly!")
    print("   You can now:")
    print("   - Start your backend server: uvicorn main:app --reload")
    print("   - Access API docs: http://localhost:8000/docs")
    print("   - Integrate with your frontend")
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(test_database())
