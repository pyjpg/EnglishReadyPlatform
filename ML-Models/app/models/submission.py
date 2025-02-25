from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from ..database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text)
    task_type = Column(String)
    question_number = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Overall scoring
    grade = Column(Float)  # Stores percentage (0-100)
    ielts_score = Column(Float)  # Stores IELTS score (1-9)
    
    # Grammar fields
    grammar_feedback = Column(Text, nullable=True)
    raw_grammar_score = Column(Float, nullable=True)
    grammar_analysis = Column(JSON, nullable=True)  # Stores complete grammar analysis including sentence scores
    
    # Lexical fields
    lexical_score = Column(Float, nullable=True)
    lexical_feedback = Column(JSON, nullable=True)  # Stores LexicalFeedback structure
    lexical_analysis = Column(JSON, nullable=True)  # Stores complete lexical analysis
    
    # Task Achievement fields
    task_achievement_score = Column(Float, nullable=True)
    task_achievement_feedback = Column(JSON, nullable=True)  # Stores TaskAchievementFeedback structure
    task_achievement_analysis = Column(JSON, nullable=True)  # Stores complete task achievement analysis

    coherence_score = Column(Float, nullable=True)
    coherence_feedback = Column(JSON, nullable=True)  # Stores CoherenceFeedback structure
    coherence_analysis = Column(JSON, nullable=True) 
    def to_dict(self):
        """Convert model instance to dictionary with proper nested structure"""
        return {
            'id': self.id,
            'text': self.text,
            'task_type': self.task_type,
            'question_number': self.question_number,
            'grade': self.grade,
            'ielts_score': self.ielts_score,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            
            # Grammar fields
            'grammar_feedback': self.grammar_feedback,
            'raw_grammar_score': self.raw_grammar_score,
            'grammar_analysis': self.grammar_analysis,
            
            # Lexical fields
            'lexical_score': self.lexical_score,
            'lexical_feedback': self.lexical_feedback,
            'lexical_analysis': self.lexical_analysis,
            
            # Task Achievement fields
            'task_achievement_score': self.task_achievement_score,
            'task_achievement_feedback': self.task_achievement_feedback,
            'task_achievement_analysis': self.task_achievement_analysis
        }