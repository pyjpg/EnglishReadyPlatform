from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .feedback import LexicalFeedback
class CoherenceFeedback(BaseModel):
    strengths: List[str]
    improvements: List[str]
    detailed_suggestions: Dict[str, List[str]]

class CoherenceAnalysis(BaseModel):
    overall_score: float
    component_scores: Dict[str, float]
    detailed_analysis: Dict[str, Any]
    feedback: CoherenceFeedback
class SubmissionBase(BaseModel):
    text: str
    task_type: str
    question_number: int
    question_desc: Optional[str] = None  # New field for question description
    question_requirements: Optional[str] = None  # New field for question requirements

class SubmissionCreate(SubmissionBase):
    pass

class GrammarAnalysis(BaseModel):
    overall_score: float
    raw_score: float
    sentence_analysis: List[Dict[str, Any]]
    feedback: str

class LexicalAnalysis(BaseModel):
    overall_score: float
    component_scores: Dict[str, float]
    detailed_analysis: Dict[str, Any]
    feedback: LexicalFeedback


class TaskAchievementFeedback(BaseModel):
    strengths: List[str]
    improvements: List[str]
    specific_suggestions: Dict[str, Any]

class TaskAchievementAnalysis(BaseModel):
    band_score: float
    component_scores: Dict[str, float]
    detailed_analysis: Dict[str, Any]
    feedback: TaskAchievementFeedback

class SubmissionResponse(SubmissionBase):
    id: int
    grade: float
    ielts_score: Optional[float]
    
    # Grammar fields
    grammar_feedback: Optional[str]
    raw_grammar_score: Optional[float]
    grammar_analysis: Optional[GrammarAnalysis]
    
    # Lexical fields
    lexical_feedback: Optional[LexicalFeedback]
    lexical_score: Optional[float]
    lexical_analysis: Optional[LexicalAnalysis]
    
    # Task Achievement fields
    task_achievement_score: Optional[float]
    task_achievement_feedback: Optional[TaskAchievementFeedback]
    task_achievement_analysis: Optional[TaskAchievementAnalysis]
    coherence_score: Optional[float]
    coherence_feedback: Optional[CoherenceFeedback]
    coherence_analysis: Optional[CoherenceAnalysis]

    class Config:
        orm_mode = True