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
        """Fixture to create a GrammarService instance for tests"""
        return GrammarService()
    
    def test_initialization(self, grammar_service):
        """Test that the service initializes properly"""
        assert grammar_service is not None
        assert grammar_service.tool is not None
        assert isinstance(grammar_service.error_weights, dict)
        assert 'GRAMMAR' in grammar_service.error_weights
    
    def test_empty_text(self, grammar_service):
        """Test handling of empty text"""
        result = grammar_service.analyze_grammar("")
        
        assert result["score"] == 0.0
        assert "No text provided" in result["feedback"]
        assert len(result["errors"]) == 0
    
    def test_perfect_grammar(self, grammar_service):
        """Test text with no grammar errors"""
        text = "This sentence is grammatically correct. It has proper punctuation and spelling."
        result = grammar_service.analyze_grammar(text)
        
        assert result["score"] == 9.0
        assert result["raw_error_count"] == 0
        assert "Excellent grammar" in result["feedback"]
    
    def test_common_errors(self, grammar_service):
        """Test text with common grammar errors"""
        text = "There is many mistake in this sentense. we dont use good grammar here"
        result = grammar_service.analyze_grammar(text)
        
        assert result["score"] < 9.0
        assert result["raw_error_count"] > 0
        assert len(result["errors"]) > 0
    
    def test_specific_error_detection(self, grammar_service):
        """Test detection of specific error types"""
        text = "theyre going to there house tomorrow"
        result = grammar_service.analyze_grammar(text)
        
        assert result["raw_error_count"] > 0
        error_categories = result["error_categories"]
        found_category = False
        for category in ['GRAMMAR', 'TYPOS', 'PUNCTUATION', 'CASING']:
            if category in error_categories and error_categories[category] > 0:
                found_category = True
                break
        assert found_category
    
    def test_long_text_scaling(self, grammar_service):
        """Test that longer texts are scored appropriately"""
        short_text = "This has an error."
        long_text = "This has an error. " * 50  
        
        short_result = grammar_service.analyze_grammar(short_text)
        long_result = grammar_service.analyze_grammar(long_text)
        
        assert long_result["weighted_error_rate"] != short_result["weighted_error_rate"]
    
    def test_get_grammar_examples(self, grammar_service):
        """Test extraction of grammar examples"""
        text = "Their going to the store. Its not far from here."
        examples = grammar_service.get_grammar_examples(text)
        
        assert len(examples) > 0
        assert "original" in examples[0]
        assert "suggestion" in examples[0]