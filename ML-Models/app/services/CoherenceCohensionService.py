import spacy
import nltk
from typing import Dict, List, Any
from collections import Counter
from nltk.tokenize import sent_tokenize, word_tokenize

class CoherenceCohesionService:
    def __init__(self):
        # Download NLTK resources
        nltk.download('punkt', quiet=True)
        
        # Load spaCy model
        try:
            self.nlp = spacy.load('en_core_web_md')
        except Exception as e:
            raise RuntimeError(f"Failed to load spaCy model: {e}")
        
        # Predefined linking phrases categories
        self.linking_phrases = {
            'addition': ['furthermore', 'moreover', 'additionally', 'in addition', 'also', 'besides'],
            'contrast': ['however', 'nevertheless', 'on the other hand', 'conversely', 'although', 'despite'],
            'cause_effect': ['consequently', 'therefore', 'as a result', 'thus', 'hence', 'so'],
            'example': ['for instance', 'for example', 'specifically', 'in particular', 'such as', 'namely'],
            'sequence': ['firstly', 'secondly', 'next', 'then', 'finally', 'subsequently'],
            'conclusion': ['in conclusion', 'to sum up', 'overall', 'ultimately', 'in summary']
        }

    def analyze_coherence_cohesion(self, text: str) -> Dict[str, Any]:
        """
        Analyze the coherence and cohesion of the given text
        
        :param text: Input text to analyze
        :return: Comprehensive analysis dictionary
        """
        # Tokenize text into sentences and process with spaCy
        doc = self.nlp(text)
        sentences = list(doc.sents)
        
        # Perform detailed analysis
        analysis = {
            'paragraph_structure': self._analyze_paragraph_structure(text),
            'linking_device_usage': self._analyze_linking_devices(sentences),
            'referential_cohesion': self._analyze_referential_cohesion(sentences),
            'logical_flow': self._analyze_logical_flow(sentences)
        }
        
        # Compile results and generate feedback
        return self._compile_results(analysis)

    def _analyze_paragraph_structure(self, text: str) -> Dict[str, Any]:
        """Analyze paragraph structure and organization"""
        paragraphs = text.split('\n\n')
        paragraph_details = []
        
        for paragraph in paragraphs:
            doc = self.nlp(paragraph)
            sentences = list(doc.sents)
            
            # Check for topic sentence (first sentence)
            topic_sentence_score = self._evaluate_topic_sentence(sentences[0] if sentences else None)
            
            paragraph_details.append({
                'sentence_count': len(sentences),
                'topic_sentence_quality': topic_sentence_score
            })
        
        return {
            'paragraph_count': len(paragraphs),
            'paragraph_details': paragraph_details,
            'average_paragraph_length': sum(len(p.split()) for p in paragraphs) / len(paragraphs)
        }

    def _analyze_linking_devices(self, sentences) -> Dict[str, Any]:
        """Analyze usage of linking devices"""
        linking_device_counts = {category: 0 for category in self.linking_phrases}
        
        for sentence in sentences:
            for category, phrases in self.linking_phrases.items():
                for phrase in phrases:
                    if phrase.lower() in sentence.text.lower():
                        linking_device_counts[category] += 1
        
        total_devices = sum(linking_device_counts.values())
        
        return {
            'total_linking_devices': total_devices,
            'device_distribution': linking_device_counts,
            'linking_diversity_score': len([count for count in linking_device_counts.values() if count > 0]) / len(linking_device_counts)
        }

    def _analyze_referential_cohesion(self, sentences) -> Dict[str, Any]:
        """Analyze referential cohesion through pronoun and noun reference tracking"""
        noun_references = {}
        pronoun_references = {}
        
        for sentence in sentences:
            for token in sentence:
                if token.pos_ == 'NOUN':
                    if token.lemma_ not in noun_references:
                        noun_references[token.lemma_] = 1
                    else:
                        noun_references[token.lemma_] += 1
                
                if token.pos_ == 'PRON':
                    if token.text not in pronoun_references:
                        pronoun_references[token.text] = 1
                    else:
                        pronoun_references[token.text] += 1
        
        return {
            'noun_reference_count': len(noun_references),
            'most_referenced_nouns': dict(sorted(noun_references.items(), key=lambda x: x[1], reverse=True)[:3]),
            'pronoun_usage': len(pronoun_references)
        }

    def _analyze_logical_flow(self, sentences) -> Dict[str, Any]:
        """Analyze the logical progression of ideas"""
        # Simple analysis of sentence length and complexity
        sentence_lengths = [len(list(sent)) for sent in sentences]
        
        return {
            'average_sentence_length': sum(sentence_lengths) / len(sentence_lengths),
            'sentence_length_variation': max(sentence_lengths) - min(sentence_lengths),
            'complex_sentences_ratio': len([l for l in sentence_lengths if l > 15]) / len(sentences)
        }

    def _evaluate_topic_sentence(self, sentence) -> float:
        """Evaluate the quality of a potential topic sentence"""
        if not sentence:
            return 0
        
        # Check for key indicators of a strong topic sentence
        key_pos_tags = {'NOUN', 'VERB', 'ADJ'}
        tag_diversity = len(set(token.pos_ for token in sentence if token.pos_ in key_pos_tags))
        
        # Rough scoring based on diversity and length
        return min(tag_diversity / 3 + len(sentence) / 10, 1)

    def _compile_results(self, analysis: dict) -> Dict[str, Any]:
        """Compile analysis results into an IELTS-style scoring system"""
        # Calculate weighted scores for each component
        weights = {
            'paragraph_structure': 0.3,
            'linking_devices': 0.25,
            'referential_cohesion': 0.25,
            'logical_flow': 0.2
        }
        
        # Component scoring (normalized to 0-1 scale)
        scores = {
            'paragraph_structure': min(analysis['paragraph_structure']['paragraph_count'] / 5, 1),
            'linking_devices': min(analysis['linking_device_usage']['linking_diversity_score'] * 2, 1),
            'referential_cohesion': min(analysis['referential_cohesion']['noun_reference_count'] / 10, 1),
            'logical_flow': min(1 - abs(analysis['logical_flow']['complex_sentences_ratio'] - 0.3), 1)
        }
        
        # Calculate overall score
        overall_score = sum(scores[key] * weights[key] for key in weights)
        
        # Convert to IELTS band score (1-9)
        ielts_score = 1 + (overall_score * 8)
        
        # Generate detailed feedback
        feedback = self._generate_feedback(scores)
        
        return {
            'overall_score': round(ielts_score, 1),
            'component_scores': {k: round(v * 9, 1) for k, v in scores.items()},
            'detailed_analysis': analysis,
            'feedback': feedback
        }

    def _generate_feedback(self, scores: Dict[str, float]) -> Dict[str, List[str]]:
        """Generate detailed feedback based on component scores"""
        feedback = {
            'strengths': [],
            'improvements': [],
            'detailed_suggestions': {}
        }
        
        # Paragraph Structure Feedback
        if scores['paragraph_structure'] > 0.7:
            feedback['strengths'].append("Strong paragraph organization")
        else:
            feedback['improvements'].append("Consider developing clearer paragraph structures")
            feedback['detailed_suggestions']['paragraph_structure'] = [
                "Ensure each paragraph has a clear topic sentence",
                "Maintain a consistent paragraph length",
                "Use a clear I-E-E (Idea, Explain, Example) structure"
            ]
        
        # Linking Devices Feedback
        if scores['linking_devices'] > 0.7:
            feedback['strengths'].append("Effective use of linking devices")
        else:
            feedback['improvements'].append("Improve variety and appropriateness of linking words")
            feedback['detailed_suggestions']['linking_devices'] = [
                "Use linking words from different categories (addition, contrast, example, etc.)",
                "Avoid overusing linking words at the start of sentences",
                "Choose linking words that precisely match the relationship between ideas"
            ]
        
        # Referential Cohesion Feedback
        if scores['referential_cohesion'] > 0.7:
            feedback['strengths'].append("Good use of references to maintain text coherence")
        else:
            feedback['improvements'].append("Enhance cohesion through better use of references")
            feedback['detailed_suggestions']['referential_cohesion'] = [
                "Use pronouns and noun references carefully to maintain clarity",
                "Ensure references are clear and unambiguous",
                "Avoid excessive repetition of nouns"
            ]
        
        # Logical Flow Feedback
        if scores['logical_flow'] > 0.7:
            feedback['strengths'].append("Clear and logical progression of ideas")
        else:
            feedback['improvements'].append("Work on improving the logical flow of your writing")
            feedback['detailed_suggestions']['logical_flow'] = [
                "Vary sentence length to improve readability",
                "Ensure a logical sequence of ideas",
                "Use complex sentences strategically"
            ]
        
        return feedback