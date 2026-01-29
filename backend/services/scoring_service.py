"""
Scoring Service for HireByte
Provides semantic similarity scoring for interview answers using sentence-transformers.
"""
import os
from typing import List, Dict, Optional
import re

# Lazy loading for sentence-transformers (heavy dependency)
_model = None

def get_model():
    """Lazy load the sentence transformer model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            print("SentenceTransformer model loaded successfully")
        except ImportError:
            print("WARNING: sentence-transformers not installed. Using fallback scoring.")
            _model = "fallback"
    return _model


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Compute semantic similarity between two texts using sentence embeddings.
    Returns a score between 0.0 and 1.0.
    """
    model = get_model()
    
    if model == "fallback":
        # Fallback: simple word overlap (Jaccard similarity)
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        if not words1 or not words2:
            return 0.0
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        return intersection / union if union > 0 else 0.0
    
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        embeddings = model.encode([text1, text2])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return float(max(0.0, min(1.0, similarity)))  # Clamp to [0, 1]
    except Exception as e:
        print(f"Error computing similarity: {e}")
        return 0.5  # Neutral score on error


class AnswerScorer:
    """
    Scores candidate answers against ideal/expected answers.
    Also tracks interview metrics over time.
    """
    
    def __init__(self):
        self.question_scores: List[Dict] = []
        self.total_questions = 0
        
    def score_answer(
        self, 
        question: str,
        candidate_answer: str, 
        ideal_answer: Optional[str] = None,
        keywords: Optional[List[str]] = None
    ) -> Dict:
        """
        Score a candidate's answer.
        
        Args:
            question: The interview question asked
            candidate_answer: The candidate's response
            ideal_answer: Optional ideal/model answer for semantic comparison
            keywords: Optional list of expected keywords
            
        Returns:
            Dict with score breakdown
        """
        self.total_questions += 1
        
        result = {
            "question_number": self.total_questions,
            "question": question,
            "answer": candidate_answer,
            "semantic_score": 0.0,
            "keyword_score": 0.0,
            "length_score": 0.0,
            "overall_score": 0.0
        }
        
        # 1. Semantic similarity (if ideal answer provided)
        if ideal_answer:
            result["semantic_score"] = compute_semantic_similarity(
                candidate_answer, ideal_answer
            ) * 100
        else:
            # Compare answer relevance to question
            result["semantic_score"] = compute_semantic_similarity(
                candidate_answer, question
            ) * 100
        
        # 2. Keyword matching
        if keywords:
            answer_lower = candidate_answer.lower()
            matched = sum(1 for kw in keywords if kw.lower() in answer_lower)
            result["keyword_score"] = (matched / len(keywords)) * 100 if keywords else 0
        else:
            result["keyword_score"] = 50  # Neutral if no keywords specified
        
        # 3. Answer length scoring (penalize too short or too long)
        word_count = len(candidate_answer.split())
        if word_count < 10:
            result["length_score"] = 30  # Too short
        elif word_count < 30:
            result["length_score"] = 70  # Acceptable
        elif word_count < 100:
            result["length_score"] = 100  # Good
        elif word_count < 200:
            result["length_score"] = 85  # Slightly long
        else:
            result["length_score"] = 60  # Too verbose
        
        # 4. Calculate overall score (weighted average)
        result["overall_score"] = (
            result["semantic_score"] * 0.5 +
            result["keyword_score"] * 0.3 +
            result["length_score"] * 0.2
        )
        
        self.question_scores.append(result)
        return result
    
    def get_summary(self) -> Dict:
        """Get summary statistics for all scored answers."""
        if not self.question_scores:
            return {
                "total_questions": 0,
                "average_score": 0,
                "scores_over_time": []
            }
        
        scores = [q["overall_score"] for q in self.question_scores]
        return {
            "total_questions": self.total_questions,
            "average_score": sum(scores) / len(scores),
            "highest_score": max(scores),
            "lowest_score": min(scores),
            "scores_over_time": scores
        }
    
    def reset(self):
        """Reset the scorer for a new interview."""
        self.question_scores = []
        self.total_questions = 0


# Singleton instance for use across the application
answer_scorer = AnswerScorer()
