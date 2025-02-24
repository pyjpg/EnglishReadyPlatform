from pydantic import BaseModel
from typing import Dict, List, Optional, Union, Any

class LinkingPhrases(BaseModel):
    addition: List[str]
    contrast: List[str]
    cause_effect: List[str]
    example: List[str]

class Suggestions(BaseModel):
    linking_phrases: Optional[LinkingPhrases] = None
    word_alternatives: Optional[Dict[str, List[str]]] = None

class DetailedSuggestion(BaseModel):
    issue: str
    examples: Optional[List[str]] = None
    suggestions: Optional[Union[Dict[str, List[str]], Dict[str, LinkingPhrases]]] = None

class LexicalFeedback(BaseModel):
    general_feedback: List[str]
    strengths: List[str]
    improvements: List[str]
    detailed_suggestions: Dict[str, DetailedSuggestion]