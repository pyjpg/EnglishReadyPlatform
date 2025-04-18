# tests/test_lexical_service.py
import pytest
from unittest.mock import patch, MagicMock
import spacy
from app.services.lexical_service import LexicalService
@pytest.fixture
def lexical_service():
    return LexicalService()

def test_init_success():
    """Test successful initialization of LexicalService"""
    service = LexicalService()
    assert service.nlp is not None
    assert len(service.basic_words) > 0
    assert len(service.academic_words) > 0
    assert len(service.linking_phrases) > 0

@patch('spacy.load')
def test_init_failure(mock_spacy_load):
    """Test handling of initialization failure"""
    mock_spacy_load.side_effect = Exception("Failed to load model")
    
    with pytest.raises(RuntimeError):
        LexicalService()

def test_analyze_lexical(lexical_service):
    """Test the main analysis method with a simple text"""
    sample_text = "This is a simple text for testing purposes. It should analyze this basic text properly."
    
    result = lexical_service.analyze_lexical(sample_text)
    
    assert 'overall_score' in result
    assert 'component_scores' in result
    assert 'detailed_analysis' in result
    assert 'feedback' in result
    
    assert 1 <= result['overall_score'] <= 9
    assert 1 <= result['component_scores']['vocabulary_diversity'] <= 9
    assert 1 <= result['component_scores']['word_sophistication'] <= 9
    assert 1 <= result['component_scores']['academic_usage'] <= 9

def test_find_repeated_words(lexical_service):
    """Test identification of repeated words"""
    doc = lexical_service.nlp("The cat and the dog are animals. The cat is small.")
    repeated = lexical_service._find_repeated_words(doc)
    assert 'cat' in repeated

def test_identify_basic_words(lexical_service):
    """Test identification of basic words"""
    doc = lexical_service.nlp("It is very good and big.")
    basic_words = lexical_service._identify_basic_words(doc)
    assert 'good' in basic_words
    assert 'big' in basic_words
    assert 'very' in basic_words

def test_suggest_alternatives(lexical_service):
    """Test suggestion of alternatives for basic words"""
    suggestions = lexical_service._suggest_alternatives(['good', 'bad'])
    assert 'good' in suggestions
    assert len(suggestions['good']) > 0

def test_suggest_sophisticated_alternatives(lexical_service):
    """Test suggestion of sophisticated alternatives"""
    alternatives = lexical_service._suggest_sophisticated_alternatives(['good', 'very'])
    assert 'good' in alternatives
    assert 'excellent' in alternatives['good']
    assert 'very' in alternatives
    assert 'extremely' in alternatives['very']

def test_analyze_lexical_diversity(lexical_service):
    """Test lexical diversity analysis"""
    doc = lexical_service.nlp("The quick brown fox jumps over the lazy dog.")
    result = lexical_service._analyze_lexical_diversity(doc)
    assert result['total_words'] > 0
    assert result['unique_words'] > 0
    assert 0 <= result['diversity_ratio'] <= 1

def test_analyze_sophistication(lexical_service):
    """Test word sophistication analysis"""
    doc = lexical_service.nlp("The comprehensive analysis demonstrated sophisticated arguments.")
    result = lexical_service._analyze_sophistication(doc)
    assert result['avg_word_length'] > 0
    assert 'comprehensive' in result['sophisticated_words']

def test_analyze_sentence_structure(lexical_service):
    """Test sentence structure analysis"""
    doc = lexical_service.nlp("This is a short sentence. This is another one. The third sentence is slightly longer and more complex.")
    result = lexical_service._analyze_sentence_structure(doc)
    assert result['avg_sentence_length'] > 0
    assert result['sentence_count'] == 3

def test_analyze_academic_usage(lexical_service):
    """Test academic language usage analysis"""
    doc = lexical_service.nlp("The analysis of economic factors provided significant evidence for the theory.")
    result = lexical_service._analyze_academic_usage(doc)
    assert result['academic_words_count'] > 0
    assert 'analysis' in result['academic_words_used']
    assert 'economic' in result['academic_words_used']

def test_error_handling():
    """Test error handling in analyze_lexical method"""
    with patch.object(LexicalService, '_analyze_lexical_diversity', side_effect=Exception("Test error")):
        service = LexicalService()
        with pytest.raises(Exception):
            service.analyze_lexical("Test text")

def test_complex_text_analysis(lexical_service):
    """Test analysis with more complex academic text"""
    complex_text = """
    The comprehensive analysis of economic variables demonstrates a significant correlation 
    between financial indicators and market performance. Research evidence suggests that 
    theoretical approaches to economic assessment require substantial methodological rigor. 
    Furthermore, the conceptual framework established in previous studies provides context 
    for interpreting current data. Nevertheless, policy implications remain subject to 
    individual interpretation and contextual factors.
    """
    
    result = lexical_service.analyze_lexical(complex_text)
    
    assert result['overall_score'] > 5
    assert len(result['detailed_analysis']['academic_language']['academic_words_used']) >= 5