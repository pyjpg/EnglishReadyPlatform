import language_tool_python
from typing import Dict, List, Tuple

class GrammarService:
    def __init__(self):
        # Initialize LanguageTool
        self.tool = language_tool_python.LanguageTool('en-GB')
        
        # Define error type weights (can be calibrated based on IELTS criteria)
        self.error_weights = {
            'GRAMMAR': 1.0,       # High impact
            'TYPOS': 0.3,         # Lower impact
            'PUNCTUATION': 0.5,   # Medium impact
            'STYLE': 0.2,         # Low impact - style issues
            'CASING': 0.5,        # Medium impact
            'COLLOCATIONS': 0.8,  # Higher impact - word combinations
            'OTHER': 0.5          # Default weight
        }
        
    def analyze_grammar(self, text: str) -> Dict:
        """Analyze grammar and return IELTS score with detailed feedback"""
        if not text:
            return {"score": 0.0, "feedback": "No text provided", "errors": []}
        
        matches = self.tool.check(text)
        
        word_count = len(text.split())
        
        errors = []
        error_categories = {}
        weighted_error_sum = 0
        
        for match in matches:
            category = match.category if hasattr(match, 'category') else 'OTHER'
            rule_id = match.ruleId if hasattr(match, 'ruleId') else 'unknown'
            
            # Count errors by category
            error_categories[category] = error_categories.get(category, 0) + 1
            
            # Calculate weighted error
            weight = self.error_weights.get(category, self.error_weights['OTHER'])
            weighted_error_sum += weight
            
            # Store error details
            errors.append({
                "message": match.message,
                "context": text[max(0, match.offset-20):match.offset+match.errorLength+20],
                "suggestion": match.replacements[0] if match.replacements else "",
                "category": category,
                "rule_id": rule_id
            })
        
        total_errors = len(matches)
        
        if word_count > 200:
            length_factor = min(1.0, 150 / word_count)  # Decreases as essays get longer
        else:
            length_factor = 1.0
            
        error_rate = total_errors / max(word_count, 1)  # Avoid division by zero
        adjusted_error_sum = weighted_error_sum * length_factor
        weighted_error_rate = adjusted_error_sum / max(word_count, 1)
        
        if total_errors == 0:
            # Perfect grammar gets a perfect score
            ielts_score = 9.0
        elif error_rate < 0.01:  # Very few errors (less than 1%) 
            ielts_score = 8.5
        elif error_rate < 0.02:  # Few errors (less than 2%)
            ielts_score = 8.0
        else:
            # Base score starts higher at 9.5 (allows for minor deductions to still score well)
            base_score = 9.5
            # More gentle penalty factor - reduces harshness significantly
            penalty_factor = 60  # Was 100 in original
            penalty = min(5.5, weighted_error_rate * penalty_factor)
            ielts_score = max(4.0, base_score - penalty)
        
        # Round to nearest 0.5 (IELTS convention)
        ielts_score = round(ielts_score * 2) / 2
        
        # Generate feedback based on error categories
        feedback = self._generate_feedback(error_categories, total_errors, ielts_score)
        
        return {
            "score": ielts_score,
            "overall_score": ielts_score,  # Added to match expected output format
            "raw_error_count": total_errors,
            "error_rate": error_rate,
            "weighted_error_rate": weighted_error_rate,
            "error_categories": error_categories,
            "feedback": feedback,
            "errors": errors[:10]  # Return first 10 errors for feedback
        }
        
    def _generate_feedback(self, error_categories: Dict, total_errors: int, score: float) -> str:
        """Generate detailed feedback based on error categories and score"""
        if total_errors == 0:
            return "Excellent grammar with no detected errors."
        
        # Sort error categories by frequency
        sorted_errors = sorted(error_categories.items(), key=lambda x: x[1], reverse=True)
        top_issues = sorted_errors[:3]  # Focus on top 3 issues
        
        if score >= 8.0:
            feedback = "Very good grammar with minimal errors. "
        elif score >= 7.0:
            feedback = "Good grammar with occasional errors that don't impede understanding. "
        elif score >= 6.0:
            feedback = "Generally accurate grammar with some errors that rarely reduce clarity. "
        elif score >= 5.0:
            feedback = "Adequate grammar but with noticeable errors that sometimes affect meaning. "
        else:
            feedback = "Significant grammatical errors that affect understanding. "
        
        # Add specific feedback about top issues
        if top_issues:
            feedback += "Main areas for improvement: "
            issue_details = []
            
            for category, count in top_issues:
                if category == 'GRAMMAR':
                    issue_details.append(f"grammatical structures ({count} errors)")
                elif category == 'PUNCTUATION':
                    issue_details.append(f"punctuation ({count} errors)")
                elif category == 'TYPOS':
                    issue_details.append(f"spelling ({count} errors)")
                elif category == 'CASING':
                    issue_details.append(f"capitalization ({count} errors)")
                elif category == 'COLLOCATIONS':
                    issue_details.append(f"word combinations ({count} errors)")
                else:
                    issue_details.append(f"{category.lower()} ({count} errors)")
            
            feedback += ", ".join(issue_details) + "."
        
        return feedback
    
    def get_grammar_examples(self, text: str) -> List[Dict]:
        """Extract specific grammar examples with suggestions for improvement"""
        matches = self.tool.check(text)
        examples = []
        
        for match in matches[:5]:  # Limit to 5 examples
            examples.append({
                "original": text[match.offset:match.offset+match.errorLength],
                "context": text[max(0, match.offset-20):match.offset+match.errorLength+20],
                "message": match.message,
                "suggestion": match.replacements[0] if match.replacements else ""
            })
        
        return examples

