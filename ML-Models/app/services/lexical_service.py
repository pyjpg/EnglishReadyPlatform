import spacy
from collections import Counter
import nltk
from nltk.corpus import wordnet
from nltk.tokenize import word_tokenize
import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LexicalService:
    def __init__(self):
        try:
            # Load spaCy model
            self.nlp = spacy.load('en_core_web_md')
            
            # Download NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)

            # Common basic words that could be upgraded
            self.basic_words = set([
                'good', 'bad', 'big', 'small', 'happy', 'sad', 'nice', 'many',
                'get', 'make', 'use', 'thing', 'very', 'lot', 'want', 'need'
            ])

            # Load academic word list
            self.academic_words = set([
                'analysis', 'approach', 'assessment', 'assume', 'authority',
                'available', 'benefit', 'concept', 'consistent', 'constitutional',
                'context', 'contract', 'create', 'data', 'definition',
                'derived', 'distribution', 'economic', 'environment', 'established',
                'estimate', 'evidence', 'export', 'factors', 'financial',
                'formula', 'function', 'identified', 'income', 'indicate',
                'individual', 'interpretation', 'involved', 'issues', 'labor',
                'legal', 'legislation', 'major', 'method', 'occurred',
                'percent', 'period', 'policy', 'principle', 'procedure',
                'process', 'required', 'research', 'response', 'role',
                'section', 'sector', 'significant', 'similar', 'source',
                'specific', 'structure', 'theory', 'variables', 'welfare'
            ])

            # Linking phrases for suggestions
            self.linking_phrases = {
                'addition': ['furthermore', 'moreover', 'additionally', 'in addition'],
                'contrast': ['however', 'nevertheless', 'on the other hand', 'conversely'],
                'cause_effect': ['consequently', 'therefore', 'as a result', 'thus'],
                'example': ['for instance', 'for example', 'specifically', 'in particular']
            }
            
            logger.info("Lexical service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize lexical service: {e}")
            raise RuntimeError("Failed to initialize lexical service")

    def analyze_lexical(self, text: str) -> Dict[str, Any]:
        try:
            # Process text with spaCy
            doc = self.nlp(text)
            
            # Basic lexical analysis
            analysis = {
                'lexical_diversity': self._analyze_lexical_diversity(doc),
                'word_sophistication': self._analyze_sophistication(doc),
                'sentence_structure': self._analyze_sentence_structure(doc),
                'academic_language': self._analyze_academic_usage(doc)
            }
            
            # Calculate overall score and compile results
            return self._compile_results(analysis)
            
        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            raise

    def _find_repeated_words(self, doc) -> List[str]:
        """Find commonly repeated words"""
        words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
        word_counts = Counter(words)
        return [word for word, count in word_counts.most_common(5) if count > 1]

    def _identify_basic_words(self, doc) -> List[str]:
        """Identify basic words that could be upgraded"""
        return [token.text.lower() for token in doc 
                if token.is_alpha and token.text.lower() in self.basic_words]

    def _suggest_alternatives(self, words: List[str]) -> Dict[str, List[str]]:
        """Suggest synonyms for commonly used words"""
        suggestions = {}
        for word in words:
            synsets = wordnet.synsets(word)
            if synsets:
                synonyms = []
                for synset in synsets[:2]:  # Look at first two synsets
                    for lemma in synset.lemmas():
                        if lemma.name() != word and '_' not in lemma.name():
                            synonyms.append(lemma.name())
                if synonyms:
                    suggestions[word] = list(set(synonyms))[:3]  # Up to 3 unique suggestions
        return suggestions

    def _suggest_sophisticated_alternatives(self, basic_words: List[str]) -> Dict[str, List[str]]:
        """Suggest more sophisticated alternatives"""
        sophisticated_alternatives = {
            'good': ['excellent', 'exceptional', 'outstanding'],
            'bad': ['inadequate', 'unfavorable', 'detrimental'],
            'big': ['substantial', 'significant', 'considerable'],
            'small': ['minimal', 'diminutive', 'limited'],
            'very': ['extremely', 'significantly', 'substantially'],
            'lot': ['numerous', 'substantial', 'considerable'],
            'get': ['obtain', 'acquire', 'attain'],
            'make': ['establish', 'generate', 'develop']
        }
        return {word: sophisticated_alternatives.get(word, []) for word in basic_words}

    def _suggest_linking_phrases(self) -> Dict[str, List[str]]:
        """Return appropriate linking phrases"""
        return self.linking_phrases

    def _extract_short_sentences(self, doc) -> List[str]:
        """Extract examples of short sentences"""
        return [sent.text for sent in doc.sents 
                if len([token for token in sent if token.is_alpha]) < 10]

    def _analyze_lexical_diversity(self, doc) -> dict:
        """Analyze vocabulary range and diversity"""
        words = [token.text.lower() for token in doc if token.is_alpha]
        unique_words = set(words)
        word_freq = Counter(words)
        repeated_words = self._find_repeated_words(doc)
        
        return {
            'total_words': len(words),
            'unique_words': len(unique_words),
            'diversity_ratio': len(unique_words) / len(words) if words else 0,
            'repeated_words': repeated_words
        }

    def _analyze_sophistication(self, doc) -> dict:
        """Analyze word sophistication level"""
        words = [token.text.lower() for token in doc if token.is_alpha]
        long_words = [word for word in words if len(word) > 7]
        basic_words = self._identify_basic_words(doc)
        
        return {
            'avg_word_length': sum(len(word) for word in words) / len(words) if words else 0,
            'long_words_ratio': len(long_words) / len(words) if words else 0,
            'sophisticated_words': long_words,
            'basic_words': basic_words
        }

    def _analyze_sentence_structure(self, doc) -> dict:
        """Analyze sentence complexity"""
        sentences = list(doc.sents)
        lengths = [len([token for token in sent if token.is_alpha]) for sent in sentences]
        short_sentences = self._extract_short_sentences(doc)
        
        return {
            'avg_sentence_length': sum(lengths) / len(lengths) if lengths else 0,
            'sentence_count': len(sentences),
            'complex_sentences': len([l for l in lengths if l > 15]),
            'short_sentences': short_sentences
        }

    def _analyze_academic_usage(self, doc) -> dict:
        """Analyze academic language usage"""
        words = [token.text.lower() for token in doc if token.is_alpha]
        academic_used = [word for word in words if word in self.academic_words]
        
        return {
            'academic_words_count': len(academic_used),
            'academic_ratio': len(academic_used) / len(words) if words else 0,
            'academic_words_used': list(set(academic_used))
        }

    def _compile_results(self, analysis: dict) -> dict:
        """Calculate final scores and compile feedback"""
        # Calculate component scores (0-1 scale)
        diversity_score = min(analysis['lexical_diversity']['diversity_ratio'] * 2, 1)
        sophistication_score = min(analysis['word_sophistication']['long_words_ratio'] * 3, 1)
        academic_score = min(analysis['academic_language']['academic_ratio'] * 5, 1)
        
        # Calculate overall score (weighted average)
        weights = {
            'diversity': 0.3,
            'sophistication': 0.4,
            'academic': 0.3
        }
        
        overall_score = (
            diversity_score * weights['diversity'] +
            sophistication_score * weights['sophistication'] +
            academic_score * weights['academic']
        )
        
        # Convert to IELTS band score (1-9)
        band_score = 1 + (overall_score * 8)
        
        # Generate feedback
        feedback = self._generate_feedback(analysis)
        
        return {
            'overall_score': round(band_score, 1),
            'component_scores': {
                'vocabulary_diversity': round(diversity_score * 9, 1),
                'word_sophistication': round(sophistication_score * 9, 1),
                'academic_usage': round(academic_score * 9, 1)
            },
            'detailed_analysis': analysis,
            'feedback': feedback
        }

    def _generate_feedback(self, analysis: dict) -> dict:
        """Generate detailed feedback with specific improvements"""
        feedback = {
            'general_feedback': [],
            'strengths': [],
            'improvements': [],
            'detailed_suggestions': {}
        }
        
        # Analyze vocabulary diversity
        diversity_ratio = analysis['lexical_diversity']['diversity_ratio']
        repeated_words = analysis['lexical_diversity']['repeated_words']
        
        if diversity_ratio < 0.4:
            feedback['general_feedback'].append("Your vocabulary range needs improvement.")
            if repeated_words:
                feedback['detailed_suggestions']['repeated_words'] = {
                    'issue': "Frequently repeated words",
                    'examples': repeated_words,
                    'suggestions': self._suggest_alternatives(repeated_words)
                }
        elif diversity_ratio < 0.5:
            feedback['strengths'].append("You have a good foundation in vocabulary usage.")
            feedback['improvements'].append("Try to incorporate more synonyms for common words.")
        else:
            feedback['strengths'].append("Excellent vocabulary diversity.")

        # Analyze sophistication
        sophistication_data = analysis['word_sophistication']
        basic_words = sophistication_data['basic_words']
        
        if sophistication_data['long_words_ratio'] < 0.1:
            if basic_words:
                feedback['detailed_suggestions']['basic_vocabulary'] = {
                    'issue': "Simple word choices",
                    'examples': basic_words,
                    'suggestions': self._suggest_sophisticated_alternatives(basic_words)
                }
            feedback['improvements'].append("Consider using more sophisticated vocabulary.")
        else:
            feedback['strengths'].append("Good use of sophisticated vocabulary.")

        # Analyze academic language
        academic_data = analysis['academic_language']
        
        if academic_data['academic_ratio'] < 0.05:
            feedback['detailed_suggestions']['academic_language'] = {
                'issue': "Limited academic vocabulary",
                'examples': academic_data['academic_words_used'],
                'suggestions': {'linking_phrases': self._suggest_linking_phrases()}
            }
            feedback['improvements'].append("Try to incorporate more academic vocabulary.")
        else:
            feedback['strengths'].append("Good use of academic vocabulary.")

        # Analyze sentence structure
        sentence_data = analysis['sentence_structure']
        if sentence_data['short_sentences']:
            feedback['detailed_suggestions']['sentence_structure'] = {
                'issue': "Short, simple sentences",
                'examples': sentence_data['short_sentences'],
                'suggestions': {'linking_phrases': self._suggest_linking_phrases()}
            }

        return feedback