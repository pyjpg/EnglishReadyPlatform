import pytest
from unittest.mock import patch, MagicMock
import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.services.grammar_service import GrammarService

class TestGrammarService:
    
    @pytest.fixture
    def grammar_service(self):
        with patch('services.grammar_service.pipeline') as mock_pipeline:
            # Configure the mock pipeline to return a predefined result
            mock_checker = MagicMock()
            mock_pipeline.return_value = mock_checker
            
            service = GrammarService()
            service.grammar_checker = mock_checker
            yield service
    
    def test_convert_to_ielts_scale(self, grammar_service):
        # Test the conversion from COLA score to IELTS scale
        assert grammar_service._convert_to_ielts_scale(0) == 1.0
        assert grammar_service._convert_to_ielts_scale(0.5) == 5.0
        assert grammar_service._convert_to_ielts_scale(1.0) == 9.0
        assert grammar_service._convert_to_ielts_scale(0.75) == 7.0
    
    def test_generate_feedback(self, grammar_service):
        # Test feedback generation based on different scores
        assert "Excellent grammar" in grammar_service._generate_feedback(0.9)
        assert "Good grammar" in grammar_service._generate_feedback(0.7)
        assert "Adequate grammar" in grammar_service._generate_feedback(0.5)
        assert "Significant grammatical errors" in grammar_service._generate_feedback(0.3)
    
    def test_analyze_grammar_single_sentence(self, grammar_service):
        # Test with a single sentence
        test_text = "This is a test sentence."
        
        # Mock the grammar checker response
        grammar_service.grammar_checker.return_value = [{'label': 'LABEL_1', 'score': 0.75}]
        
        result = grammar_service.analyze_grammar(test_text)
        
        # Verify the structure and content of the result
        assert 'overall_score' in result
        assert 'raw_score' in result
        assert 'sentence_analysis' in result
        assert 'feedback' in result
        
        assert result['overall_score'] == 7.0  # 1 + (0.75 * 8)
        assert result['raw_score'] == 0.75
        assert len(result['sentence_analysis']) == 1
        assert result['sentence_analysis'][0]['sentence'] == test_text
        assert result['sentence_analysis'][0]['score'] == 0.75
        assert "Good grammar" in result['feedback']
    
    def test_analyze_grammar_multiple_sentences(self, grammar_service):
        # Test with multiple sentences
        test_text = "This is sentence one. This is sentence two. This is sentence three."
        
        # Mock the grammar checker response for each sentence
        grammar_service.grammar_checker.side_effect = [
            [{'label': 'LABEL_1', 'score': 0.6}],
            [{'label': 'LABEL_1', 'score': 0.8}],
            [{'label': 'LABEL_1', 'score': 0.7}]
        ]
        
        result = grammar_service.analyze_grammar(test_text)
        
        # Calculate expected values
        expected_avg = (0.6 + 0.8 + 0.7) / 3
        expected_ielts = 1 + (expected_avg * 8)
        
        # Verify the results
        assert result['overall_score'] == pytest.approx(expected_ielts)
        assert result['raw_score'] == pytest.approx(expected_avg)
        assert len(result['sentence_analysis']) == 3
        
        # Check each sentence analysis
        sentences = ["This is sentence one.", "This is sentence two.", "This is sentence three."]
        scores = [0.6, 0.8, 0.7]
        
        for i in range(3):
            assert result['sentence_analysis'][i]['sentence'] == sentences[i]
            assert result['sentence_analysis'][i]['score'] == scores[i]
    
    def test_analyze_grammar_empty_text(self, grammar_service):
        # Test handling of empty text (should raise an exception)
        with pytest.raises(Exception):
            grammar_service.analyze_grammar("")
    
    @patch('services.grammar_service.nltk.download')
    @patch('services.grammar_service.pipeline')
    def test_initialization(self, mock_pipeline, mock_download):
        # Test that the service initializes correctly
        service = GrammarService()
        
        # Check that NLTK punkt was downloaded
        mock_download.assert_called_once_with('punkt')
        
        # Check that the pipeline was created with correct parameters
        mock_pipeline.assert_called_once()
        args, kwargs = mock_pipeline.call_args
        assert kwargs['model'] == "textattack/bert-base-uncased-COLA"
        assert kwargs['device'] == -1