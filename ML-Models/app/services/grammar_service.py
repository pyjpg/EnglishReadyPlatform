from transformers import pipeline
import nltk
from nltk.tokenize import sent_tokenize
nltk.download('punkt')

class GrammarService:
    def init(self):
        self.grammar_checker = pipeline(
            "text-classification",
            model="textattack/bert-base-uncased-COLA",
            device=-1 
        )

    def analyze_grammar(self, text: str) -> dict:
        sentences = sent_tokenize(text)

        sentence_scores = []
        total_score = 0

        for sentence in sentences:
            result = self.grammar_checker(sentence)[0]
            score = result['score']
            sentence_scores.append({
                'sentence': sentence,
                'score': score
            })
            total_score += score

        avg_score = total_score / len(sentences)
        ielts_grammar_score = self._convert_to_ielts_scale(avg_score)

        return {
            'overall_score': ielts_grammar_score,
            'raw_score': avg_score,
            'sentence_analysis': sentence_scores,
            'feedback': self._generate_feedback(avg_score)
        }

    def _convert_to_ielts_scale(self, cola_score: float) -> float:
        return 1 + (cola_score * 8)

    def _generate_feedback(self, score: float) -> str:
        if score > 0.8:
            return "Excellent grammar with sophisticated structures."
        elif score > 0.6:
            return "Good grammar with occasional errors that don't impede understanding."
        elif score > 0.4:
            return "Adequate grammar but with noticeable errors."
        else:
            return "Significant grammatical errors that affect understanding."