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
            
            # Advanced vocabulary for general writing (non-academic but sophisticated)
            self.advanced_vocabulary = set([
                'eloquent', 'intricate', 'profound', 'elaborate', 'meticulous',
                'articulate', 'nuanced', 'comprehensive', 'innovative', 'perceptive',
                'insightful', 'distinctive', 'fundamental', 'rigorous', 'vivid',
                'elegant', 'coherent', 'sophisticated', 'substantive', 'versatile',
                'vibrant', 'compelling', 'seamless', 'discerning', 'precise',
                'refined', 'subtle', 'adept', 'thorough', 'strategic',
                'exceptional', 'invaluable', 'paramount', 'pivotal', 'robust',
                'systematic', 'transformative', 'unprecedented', 'vital', 'authentic'
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
                'academic_language': self._analyze_academic_usage(doc),
                'advanced_vocabulary': self._analyze_advanced_vocabulary(doc)
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
            'make': ['establish', 'generate', 'develop'],
            'nice': ['pleasant', 'admirable', 'commendable'],
            'happy': ['delighted', 'gratified', 'elated'],
            'sad': ['melancholy', 'despondent', 'disheartened'],
            'want': ['desire', 'aspire', 'seek'],
            'need': ['require', 'necessitate', 'demand'],
            'many': ['numerous', 'abundant', 'plentiful'],
            'thing': ['element', 'component', 'aspect'],
            'use': ['utilize', 'employ', 'implement']
        }
        return {word: sophisticated_alternatives.get(word, []) for word in basic_words}

    def _suggest_linking_phrases(self) -> Dict[str, List[str]]:
        """Return appropriate linking phrases"""
        return self.linking_phrases

    def _extract_short_sentences(self, doc) -> List[str]:
        """Extract examples of short sentences"""
        return [sent.text for sent in doc.sents 
                if len([token for token in sent if token.is_alpha]) < 10]
                
    def _calculate_yules_k(self, words: List[str]) -> float:
        """Calculate Yule's K measure (vocabulary richness)"""
        if not words or len(words) < 2:
            return 0
            
        word_freq = Counter(words)
        freq_of_freq = Counter(word_freq.values())
        N = len(words)
        
        # Calculate sum of squared frequencies
        sum_sq_freq = sum((freq * freq) * count for freq, count in freq_of_freq.items())
        
        # Calculate Yule's K
        if N > 1:
            return 10000 * (sum_sq_freq - N) / (N * N)
        return 0

    def _analyze_lexical_diversity(self, doc) -> dict:
        """Analyze vocabulary range and diversity"""
        words = [token.text.lower() for token in doc if token.is_alpha]
        unique_words = set(words)
        word_freq = Counter(words)
        repeated_words = self._find_repeated_words(doc)
        
        # Calculate Type-Token Ratio (TTR) and Yule's K
        ttr = len(unique_words) / len(words) if words else 0
        yules_k = self._calculate_yules_k(words)
        
        return {
            'total_words': len(words),
            'unique_words': len(unique_words),
            'diversity_ratio': ttr,
            'yules_k': yules_k,  # Lower value indicates richer vocabulary
            'repeated_words': repeated_words
        }

    def _analyze_sophistication(self, doc) -> dict:
        """Analyze word sophistication level"""
        words = [token.text.lower() for token in doc if token.is_alpha]
        long_words = [word for word in words if len(word) > 7]
        medium_words = [word for word in words if len(word) > 5 and len(word) <= 7]
        basic_words = self._identify_basic_words(doc)
        
        # Calculate proportion of words beyond basic vocabulary
        basic_ratio = len(basic_words) / len(words) if words else 0
        sophisticated_ratio = len(long_words) / len(words) if words else 0
        medium_ratio = len(medium_words) / len(words) if words else 0
        
        return {
            'avg_word_length': sum(len(word) for word in words) / len(words) if words else 0,
            'long_words_ratio': sophisticated_ratio,
            'medium_words_ratio': medium_ratio,
            'basic_words_ratio': basic_ratio,
            'sophisticated_words': long_words[:10],  # Show just top 10 examples
            'basic_words': basic_words
        }

    def _analyze_sentence_structure(self, doc) -> dict:
        """Analyze sentence complexity"""
        sentences = list(doc.sents)
        lengths = [len([token for token in sent if token.is_alpha]) for sent in sentences]
        short_sentences = self._extract_short_sentences(doc)
        
        # Calculate sentence variety measures
        if lengths:
            avg_length = sum(lengths) / len(lengths)
            length_variability = sum(abs(l - avg_length) for l in lengths) / len(lengths)
        else:
            avg_length = 0
            length_variability = 0
        
        return {
            'avg_sentence_length': avg_length,
            'sentence_count': len(sentences),
            'length_variability': length_variability,  # Higher values indicate more variety
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
    
    def _analyze_advanced_vocabulary(self, doc) -> dict:
        """Analyze usage of advanced (non-academic but sophisticated) vocabulary"""
        words = [token.text.lower() for token in doc if token.is_alpha]
        advanced_used = [word for word in words if word in self.advanced_vocabulary]
        
        # Calculate lexical density (proportion of content words)
        content_words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
        lexical_density = len(content_words) / len(words) if words else 0
        
        return {
            'advanced_words_count': len(advanced_used),
            'advanced_ratio': len(advanced_used) / len(words) if words else 0,
            'lexical_density': lexical_density,
            'advanced_words_used': list(set(advanced_used))
        }

    def _compile_results(self, analysis: dict) -> dict:
        """Calculate final scores and compile feedback"""
        # Calculate component scores (0-1 scale)
        diversity_score = min(analysis['lexical_diversity']['diversity_ratio'] * 1.8, 1)
        
        # Sophistication score now considers both long words and medium words
        sophistication_score = min(
            (analysis['word_sophistication']['long_words_ratio'] * 3) + 
            (analysis['word_sophistication']['medium_words_ratio'] * 1.5), 
            1
        )
        
        # Academic score (reduced weight)
        academic_score = min(analysis['academic_language']['academic_ratio'] * 4, 1)
        
        # Advanced vocabulary score (new component)
        advanced_score = min(
            (analysis['advanced_vocabulary']['advanced_ratio'] * 4) + 
            (analysis['advanced_vocabulary']['lexical_density'] * 0.5), 
            1
        )
        
        # Yule's K adjustment factor (lower values of Yule's K indicate richer vocabulary)
        yules_k = analysis['lexical_diversity']['yules_k']
        yules_factor = max(0, min(0.2, 0.2 - (yules_k / 2000)))
        
        # Calculate overall score (weighted average with new weights)
        weights = {
            'diversity': 0.25,
            'sophistication': 0.35,
            'academic': 0.20,  # Reduced from 0.3
            'advanced': 0.20    # New component
        }
        
        overall_score = (
            diversity_score * weights['diversity'] +
            sophistication_score * weights['sophistication'] +
            academic_score * weights['academic'] +
            advanced_score * weights['advanced'] +
            yules_factor  # Bonus for rich vocabulary
        )
        
        # Convert to IELTS band score (1-9)
        band_score = 1 + (overall_score * 8)
        
        # Generate feedback
        feedback = self._generate_feedback(analysis)
        
        return {
            'overall_score': round(band_score, 1),
            'component_scores': {
                'vocabulary_diversity': max(1, round(diversity_score * 9, 1)),
                'word_sophistication': max(1, round(sophistication_score * 9, 1)),
                'academic_usage': max(1, round(academic_score * 9, 1)),
                'advanced_vocabulary': max(1, round(advanced_score * 9, 1))
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
        yules_k = analysis['lexical_diversity']['yules_k']
        
        # More nuanced thresholds for diversity
        if diversity_ratio < 0.35:
            feedback['general_feedback'].append("Your vocabulary range needs improvement.")
            if repeated_words:
                feedback['detailed_suggestions']['repeated_words'] = {
                    'issue': "Frequently repeated words",
                    'examples': repeated_words,
                    'suggestions': self._suggest_alternatives(repeated_words)
                }
        elif diversity_ratio < 0.45:
            feedback['strengths'].append("You have a good foundation in vocabulary usage.")
            feedback['improvements'].append("Try to incorporate more synonyms for common words.")
        else:
            feedback['strengths'].append("Excellent vocabulary diversity.")
        
        # Add Yule's K insight
        if yules_k < 100:
            feedback['strengths'].append("Your vocabulary richness is excellent.")
        elif yules_k < 150:
            feedback['strengths'].append("You demonstrate good vocabulary richness.")

        # Analyze sophistication with more nuance
        sophistication_data = analysis['word_sophistication']
        basic_words = sophistication_data['basic_words']
        
        # Consider both long and medium words
        combined_sophisticated_ratio = (
            sophistication_data['long_words_ratio'] + 
            (sophistication_data['medium_words_ratio'] * 0.5)
        )
        
        if combined_sophisticated_ratio < 0.1:
            if basic_words:
                feedback['detailed_suggestions']['basic_vocabulary'] = {
                    'issue': "Simple word choices",
                    'examples': basic_words[:5],  # Limit to 5 examples
                    'suggestions': self._suggest_sophisticated_alternatives(basic_words)
                }
            feedback['improvements'].append("Consider using more sophisticated vocabulary.")
        elif combined_sophisticated_ratio < 0.2:
            feedback['strengths'].append("You use some sophisticated vocabulary.")
            if basic_words:
                feedback['improvements'].append("Continue developing your range of precise word choices.")
        else:
            feedback['strengths'].append("Excellent use of sophisticated vocabulary.")

        # Analyze academic language with more nuanced thresholds
        academic_data = analysis['academic_language']
        
        # Check advanced vocabulary as well before criticizing academic language
        advanced_data = analysis['advanced_vocabulary']
        advanced_ratio = advanced_data['advanced_ratio']
        
        # Only suggest academic words if both academic AND advanced vocabulary are low
        if academic_data['academic_ratio'] < 0.03 and advanced_ratio < 0.03:
            feedback['detailed_suggestions']['vocabulary_enhancement'] = {
                'issue': "Limited formal vocabulary",
                'academic_examples': academic_data['academic_words_used'],
                'suggestions': {'linking_phrases': self._suggest_linking_phrases()}
            }
            feedback['improvements'].append("Try to incorporate more formal or academic vocabulary.")
        elif academic_data['academic_ratio'] >= 0.03:
            feedback['strengths'].append("Good use of academic vocabulary.")
        elif advanced_ratio >= 0.03:
            feedback['strengths'].append("Good use of advanced vocabulary.")

        # Recognize high lexical density as a strength
        if advanced_data['lexical_density'] > 0.6:
            feedback['strengths'].append("Your writing shows excellent lexical density with strong content words.")
        
        # Analyze sentence structure
        sentence_data = analysis['sentence_structure']
        if sentence_data['length_variability'] < 3 and sentence_data['short_sentences']:
            feedback['detailed_suggestions']['sentence_structure'] = {
                'issue': "Limited sentence variety",
                'examples': sentence_data['short_sentences'][:2],  # Limit examples
                'suggestions': {'linking_phrases': self._suggest_linking_phrases()}
            }
            feedback['improvements'].append("Try varying your sentence structures and lengths more.")
        elif sentence_data['length_variability'] >= 5:
            feedback['strengths'].append("Good variety in sentence structures and lengths.")

        return feedback