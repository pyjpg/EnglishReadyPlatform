from transformers import pipeline
import nltk
from nltk.tokenize import sent_tokenize

class GrammarService:
    def __init__(self):
        # Initialize the grammar checker pipeline
        self.grammar_checker = pipeline(
            "text-classification",
            model="textattack/bert-base-uncased-COLA",
            device=-1  # Use CPU
        )
    
    def analyze_grammar(self, text: str) -> float:
        """Analyze grammar and return a score on IELTS scale (0-9)"""
        sentences = sent_tokenize(text)
        
        # Handle empty text case
        if not sentences:
            return 0.0
            
        total_score = 0
        for sentence in sentences:
            result = self.grammar_checker(sentence)[0]
            # Extract score from result (acceptability probability)
            score = result['score'] if result['label'] == 'LABEL_1' else 1 - result['score']
            total_score += score
        
        # Calculate average score
        avg_score = total_score / len(sentences)
        
        # Convert to IELTS scale (0-9)
        ielts_grammar_score = self._convert_to_ielts_scale(avg_score)
        
        return ielts_grammar_score
    
    def _convert_to_ielts_scale(self, cola_score: float) -> float:
        """Convert COLA score (0-1) to IELTS scale (0-9)"""
        # Map the score range from 0-1 to 4-9 (typical IELTS range)
        return 4 + (cola_score * 5)
    
    def _generate_feedback(self, score: float) -> str:
        """Generate feedback based on grammar score"""
        if score > 0.8:
            return "Excellent grammar with sophisticated structures."
        elif score > 0.6:
            return "Good grammar with occasional errors that don't impede understanding."
        elif score > 0.4:
            return "Adequate grammar but with noticeable errors."
        else:
            return "Significant grammatical errors that affect understanding."