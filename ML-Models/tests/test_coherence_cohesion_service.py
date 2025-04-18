import pytest
from unittest.mock import patch, MagicMock
import sys
import os
from collections import Counter

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.CoherenceCohensionService import CoherenceCohesionService

class TestCoherenceCohesionService:
    @pytest.fixture
    def service(self):
        """Create an instance of the service for testing"""
        return CoherenceCohesionService()

    @pytest.fixture
    def sample_text(self):
        """Sample text for testing"""
        return """This is the first paragraph. It contains several sentences. The topic is clearly stated.

    Secondly, this paragraph adds more information. Furthermore, it uses linking words. Moreover, it demonstrates cohesion.

    In conclusion, the final paragraph summarizes key points. The text shows coherence throughout. It maintains a logical flow.""" 

    @pytest.fixture
    def mock_spacy_doc(self):
        """Create a mock spaCy doc for testing"""
        with patch('spacy.load'):
            service = CoherenceCohesionService()
            
            mock_sentences = []
            for i in range(3):
                mock_sent = MagicMock()
                mock_sent.text = f"This is test sentence {i}."
                mock_tokens = []
                for j in range(5):
                    mock_token = MagicMock()
                    mock_token.pos_ = 'NOUN' if j % 3 == 0 else 'VERB' if j % 3 == 1 else 'PRON'
                    mock_token.lemma_ = f"word{j}"
                    mock_token.text = f"word{j}"
                    mock_tokens.append(mock_token)
                mock_sent.__iter__ = lambda self=mock_sent: iter(mock_tokens)
                mock_sent.__len__ = lambda self=mock_sent: len(mock_tokens)
                mock_sentences.append(mock_sent)
            
            mock_doc = MagicMock()
            mock_doc.sents = mock_sentences
            
            return mock_doc

    def test_init(self, service):
        """Test initialization of the service"""
        assert service is not None
        assert hasattr(service, 'nlp')
        assert hasattr(service, 'linking_phrases')
        
    def test_linking_phrases_categories(self, service):
        """Test that linking phrases contain expected categories"""
        expected_categories = [
            'addition', 'contrast', 'cause_effect', 
            'example', 'sequence', 'conclusion'
        ]
        
        for category in expected_categories:
            assert category in service.linking_phrases
            assert len(service.linking_phrases[category]) > 0

    @patch('spacy.load')
    def test_init_fails_with_error(self, mock_spacy_load):
        """Test that initialization fails when spaCy model cannot be loaded"""
        mock_spacy_load.side_effect = Exception("Test exception")
        
        with pytest.raises(RuntimeError) as excinfo:
            CoherenceCohesionService()
        
        assert "Failed to load spaCy model" in str(excinfo.value)

    def test_analyze_coherence_cohesion_structure(self, service, sample_text):
        """Test the overall structure of the analysis result"""
        result = service.analyze_coherence_cohesion(sample_text)
        
        assert 'overall_score' in result
        assert 'component_scores' in result
        assert 'detailed_analysis' in result
        assert 'feedback' in result
        
        assert 'paragraph_structure' in result['component_scores']
        assert 'linking_devices' in result['component_scores']
        assert 'referential_cohesion' in result['component_scores']
        assert 'logical_flow' in result['component_scores']
        
        assert 'strengths' in result['feedback']
        assert 'improvements' in result['feedback']
        assert 'detailed_suggestions' in result['feedback']

    @patch.object(CoherenceCohesionService, '_analyze_paragraph_structure')
    @patch.object(CoherenceCohesionService, '_analyze_linking_devices')
    @patch.object(CoherenceCohesionService, '_analyze_referential_cohesion')
    @patch.object(CoherenceCohesionService, '_analyze_logical_flow')
    def test_analyze_calls_component_methods(
        self, mock_flow, mock_cohesion, mock_linking, mock_structure, 
        service, sample_text
    ):
        """Test that analyze method calls all component analysis methods"""
        mock_structure.return_value = {'paragraph_count': 3, 'paragraph_details': [], 'average_paragraph_length': 5}
        mock_linking.return_value = {'total_linking_devices': 5, 'device_distribution': {}, 'linking_diversity_score': 0.5}
        mock_cohesion.return_value = {'noun_reference_count': 10, 'most_referenced_nouns': {}, 'pronoun_usage': 5}
        mock_flow.return_value = {'average_sentence_length': 15, 'sentence_length_variation': 5, 'complex_sentences_ratio': 0.3}         
        service.analyze_coherence_cohesion(sample_text)
        
        mock_structure.assert_called_once()
        mock_linking.assert_called_once()
        mock_cohesion.assert_called_once()
        mock_flow.assert_called_once()

    def test_analyze_paragraph_structure(self, service, sample_text):
        """Test paragraph structure analysis"""
        result = service._analyze_paragraph_structure(sample_text)
        
        assert 'paragraph_count' in result
        assert result['paragraph_count'] == 3  # Based on sample_text
        assert 'paragraph_details' in result
        assert len(result['paragraph_details']) == result['paragraph_count']
        assert 'average_paragraph_length' in result

    def test_analyze_linking_devices(self, service):
        """Test linking devices analysis"""
        doc = service.nlp("Furthermore, this is a test. However, it contains linking words.")
        sentences = list(doc.sents)
        
        result = service._analyze_linking_devices(sentences)
        
        assert 'total_linking_devices' in result
        assert result['total_linking_devices'] >= 2  # Should detect "Furthermore" and "However"
        assert 'device_distribution' in result
        assert result['device_distribution']['addition'] >= 1  # "Furthermore"
        assert result['device_distribution']['contrast'] >= 1  # "However"
        assert 'linking_diversity_score' in result

    def test_analyze_referential_cohesion(self, service, mock_spacy_doc):
        """Test referential cohesion analysis"""
        sentences = mock_spacy_doc.sents
        
        result = service._analyze_referential_cohesion(sentences)
        
        assert 'noun_reference_count' in result
        assert 'most_referenced_nouns' in result
        assert 'pronoun_usage' in result

    def test_analyze_logical_flow(self, service, mock_spacy_doc):
        """Test logical flow analysis"""
        sentences = mock_spacy_doc.sents
        
        result = service._analyze_logical_flow(sentences)
        
        assert 'average_sentence_length' in result
        assert 'sentence_length_variation' in result
        assert 'complex_sentences_ratio' in result

    def test_evaluate_topic_sentence(self, service):
        """Test topic sentence evaluation"""
        good_sentence = list(service.nlp("The primary argument revolves around environmental impacts.").sents)[0]
        good_score = service._evaluate_topic_sentence(good_sentence)
        
    
        weak_sentence = list(service.nlp("It is.").sents)[0]
        weak_score = service._evaluate_topic_sentence(weak_sentence)

        none_score = service._evaluate_topic_sentence(None)
        
        assert good_score > weak_score
        assert none_score == 0
        assert 0 <= good_score <= 1
        assert 0 <= weak_score <= 1

    def test_compile_results(self, service):
        """Test compilation of results"""
        analysis = {
            'paragraph_structure': {
                'paragraph_count': 3,
                'paragraph_details': [],
                'average_paragraph_length': 40
            },
            'linking_device_usage': {
                'total_linking_devices': 10,
                'device_distribution': Counter(),
                'linking_diversity_score': 0.8
            },
            'referential_cohesion': {
                'noun_reference_count': 15,
                'most_referenced_nouns': {},
                'pronoun_usage': 8
            },
            'logical_flow': {
                'average_sentence_length': 12,
                'sentence_length_variation': 5,
                'complex_sentences_ratio': 0.3
            }
        }
        
        result = service._compile_results(analysis)
        
        assert 'overall_score' in result
        assert 1 <= result['overall_score'] <= 9  # IELTS scale is 1-9
        assert 'component_scores' in result
        assert 'feedback' in result
        
        # Check feedback contains expected sections
        assert 'strengths' in result['feedback']
        assert 'improvements' in result['feedback']
        assert 'detailed_suggestions' in result['feedback']

    def test_generate_feedback(self, service):
        """Test feedback generation for different score levels"""
        # Test with high scores
        high_scores = {
            'paragraph_structure': 0.8,
            'linking_devices': 0.9,
            'referential_cohesion': 0.8,
            'logical_flow': 0.9
        }
        
        high_feedback = service._generate_feedback(high_scores)
        assert len(high_feedback['strengths']) > len(high_feedback['improvements'])
        
        # Test with low scores
        low_scores = {
            'paragraph_structure': 0.4,
            'linking_devices': 0.3,
            'referential_cohesion': 0.5,
            'logical_flow': 0.4
        }
        
        low_feedback = service._generate_feedback(low_scores)
        assert len(low_feedback['improvements']) > len(low_feedback['strengths'])
        assert len(low_feedback['detailed_suggestions']) >= 3  # Should have multiple suggestion categories

    def test_end_to_end(self, service, sample_text):
        """Test the entire analysis process end-to-end"""
        result = service.analyze_coherence_cohesion(sample_text)
        
        # Basic checks for a valid result
        assert isinstance(result, dict)
        assert 'overall_score' in result
        assert 'component_scores' in result
        assert 'feedback' in result
        
        # Check the score is within expected range
        assert 1 <= result['overall_score'] <= 9
        
        # Check component scores are also within range
        for component, score in result['component_scores'].items():
            assert 1 <= score <= 9