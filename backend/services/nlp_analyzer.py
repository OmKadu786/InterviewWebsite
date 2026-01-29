"""
NLP Analyzer for HireByte
Extracts linguistic metrics from interview transcripts.
"""
import re
from typing import List, Dict
from collections import Counter

# Common filler words to detect
FILLER_WORDS = [
    "um", "uh", "like", "you know", "actually", "basically", "literally",
    "so", "well", "right", "okay", "i mean", "kind of", "sort of",
    "honestly", "frankly", "obviously", "clearly"
]

# Positive and negative sentiment words (simple lexicon)
POSITIVE_WORDS = [
    "good", "great", "excellent", "amazing", "wonderful", "fantastic",
    "love", "enjoy", "excited", "passionate", "successful", "achieved",
    "improved", "solved", "created", "built", "led", "managed", "accomplished"
]

NEGATIVE_WORDS = [
    "bad", "terrible", "awful", "hate", "difficult", "struggle", "failed",
    "problem", "issue", "unfortunately", "couldn't", "didn't", "never",
    "worst", "hard", "challenging", "frustrated"
]


def count_filler_words(text: str) -> Dict[str, int]:
    """
    Count filler words in a text.
    
    Returns:
        Dict mapping filler word to count
    """
    text_lower = text.lower()
    counts = {}
    
    for filler in FILLER_WORDS:
        # Use word boundaries for accurate matching
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, text_lower)
        if matches:
            counts[filler] = len(matches)
    
    return counts


def analyze_sentiment(text: str) -> Dict:
    """
    Simple lexicon-based sentiment analysis.
    
    Returns:
        Dict with positive/negative counts and overall sentiment score
    """
    text_lower = text.lower()
    words = re.findall(r'\b[a-z]+\b', text_lower)
    
    positive_count = sum(1 for w in words if w in POSITIVE_WORDS)
    negative_count = sum(1 for w in words if w in NEGATIVE_WORDS)
    
    total = positive_count + negative_count
    if total == 0:
        sentiment_score = 0.5  # Neutral
    else:
        sentiment_score = positive_count / total
    
    # Map to -1 to 1 scale
    sentiment_normalized = (sentiment_score * 2) - 1
    
    return {
        "positive_words": positive_count,
        "negative_words": negative_count,
        "sentiment_score": sentiment_normalized,  # -1 to 1
        "sentiment_label": (
            "positive" if sentiment_normalized > 0.2 else
            "negative" if sentiment_normalized < -0.2 else
            "neutral"
        )
    }


def calculate_speaking_metrics(text: str) -> Dict:
    """
    Calculate various speaking metrics from transcript.
    
    Returns:
        Dict with word count, sentence count, avg words per sentence, etc.
    """
    # Word count
    words = text.split()
    word_count = len(words)
    
    # Sentence count (approximate)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    sentence_count = len(sentences) if sentences else 1
    
    # Average words per sentence
    avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
    
    # Unique words ratio (vocabulary diversity)
    unique_words = set(w.lower() for w in words if w.isalpha())
    vocabulary_ratio = len(unique_words) / word_count if word_count > 0 else 0
    
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_words_per_sentence": round(avg_words_per_sentence, 1),
        "vocabulary_diversity": round(vocabulary_ratio, 3),
        "estimated_speaking_time_seconds": word_count / 2.5  # Avg 150 wpm = 2.5 wps
    }


def analyze_answer(text: str) -> Dict:
    """
    Comprehensive analysis of a single answer.
    
    Returns:
        Dict with all NLP metrics combined
    """
    filler_counts = count_filler_words(text)
    sentiment = analyze_sentiment(text)
    speaking_metrics = calculate_speaking_metrics(text)
    
    return {
        "filler_words": filler_counts,
        "total_filler_count": sum(filler_counts.values()),
        "sentiment": sentiment,
        "speaking_metrics": speaking_metrics
    }


class InterviewAnalyzer:
    """
    Analyzes an entire interview session.
    Tracks metrics across all questions and answers.
    """
    
    def __init__(self):
        self.answers: List[Dict] = []
        self.interviewer_messages: List[str] = []
        
    def add_answer(self, answer_text: str, question_text: str = ""):
        """Add a candidate answer for analysis."""
        analysis = analyze_answer(answer_text)
        analysis["question"] = question_text
        analysis["answer"] = answer_text
        self.answers.append(analysis)
        
    def add_interviewer_message(self, text: str):
        """Track interviewer speaking time for ratio calculation."""
        self.interviewer_messages.append(text)
    
    def get_talk_to_listen_ratio(self) -> float:
        """
        Calculate ratio of candidate speaking vs interviewer.
        Higher = candidate talks more.
        """
        candidate_words = sum(
            a["speaking_metrics"]["word_count"] for a in self.answers
        )
        interviewer_words = sum(
            len(m.split()) for m in self.interviewer_messages
        )
        
        if interviewer_words == 0:
            return float('inf') if candidate_words > 0 else 1.0
        
        return round(candidate_words / interviewer_words, 2)
    
    def get_comprehensive_report(self) -> Dict:
        """Generate full NLP report for the interview."""
        if not self.answers:
            return {"error": "No answers recorded"}
        
        # Aggregate metrics
        total_fillers = sum(a["total_filler_count"] for a in self.answers)
        total_words = sum(
            a["speaking_metrics"]["word_count"] for a in self.answers
        )
        
        # Sentiment over time
        sentiments = [a["sentiment"]["sentiment_score"] for a in self.answers]
        avg_sentiment = sum(sentiments) / len(sentiments)
        
        # Vocabulary diversity (combined)
        diversities = [
            a["speaking_metrics"]["vocabulary_diversity"] for a in self.answers
        ]
        avg_diversity = sum(diversities) / len(diversities)
        
        # Get most common filler words
        all_fillers = Counter()
        for a in self.answers:
            all_fillers.update(a["filler_words"])
        
        return {
            "total_answers": len(self.answers),
            "total_word_count": total_words,
            "total_filler_count": total_fillers,
            "filler_rate": round(total_fillers / total_words * 100, 2) if total_words > 0 else 0,
            "most_common_fillers": all_fillers.most_common(5),
            "average_sentiment": round(avg_sentiment, 3),
            "sentiment_trend": sentiments,
            "average_vocabulary_diversity": round(avg_diversity, 3),
            "talk_to_listen_ratio": self.get_talk_to_listen_ratio(),
            "per_answer_analysis": self.answers
        }
    
    def reset(self):
        """Reset for new interview."""
        self.answers = []
        self.interviewer_messages = []


# Singleton for app usage
interview_analyzer = InterviewAnalyzer()
