import pytest
import sys
import os

# Add the app directory to the path so we can import modules from it
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Shared fixtures that can be used across multiple test files
@pytest.fixture
def sample_texts():
    """Provide sample texts for testing various scenarios"""
    return {
        'basic': "This is a simple test text. It has basic words.",
        'academic': "The comprehensive analysis of economic variables demonstrates a significant correlation between financial indicators and market performance.",
        'empty': "",
        'short': "Short text.",
        'repeated_words': "The cat and the dog are animals. The cat is small. The cat is fast."
    }