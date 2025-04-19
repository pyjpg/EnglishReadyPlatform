import pytest
from unittest.mock import patch, MagicMock
import spacy
import numpy as np
from transformers import pipeline
from sentence_transformers import SentenceTransformer

from app.services.taskachievement_service import TaskAchievementService
from app.schemas.submission import SubmissionCreate


@pytest.fixture
def mock_nlp():
    """Mock the spacy NLP pipeline."""
    mock = MagicMock()
    doc_mock = MagicMock()
    doc_mock.text = "This is mock text for testing."
    doc_mock.vector = np.array([0.1] * 300)
    doc_mock.__iter__.return_value = [
        MagicMock(is_alpha=True),
        MagicMock(is_alpha=True),
        MagicMock(is_alpha=True),
        MagicMock(is_alpha=True),
        MagicMock(is_alpha=True),
    ]
    sent_mock = MagicMock()
    sent_mock.text = "This is a test sentence."
    sent_mock.vector = np.array([0.1] * 300)
    doc_mock.sents = [sent_mock]
    chunk_mock = MagicMock()
    chunk_mock.text = "test sentence"
    chunk_mock.root.is_stop = False
    doc_mock.noun_chunks = [chunk_mock]
    
    mock.return_value = doc_mock
    return mock


@pytest.fixture
def mock_semantic_model():
    """Mock the sentence transformer model."""
    mock = MagicMock(spec=SentenceTransformer)
    mock.encode.return_value = np.array([0.1] * 384)
    return mock


@pytest.fixture
def mock_text_classifier():
    """Mock the zero-shot classification pipeline."""
    mock = MagicMock(spec=pipeline)
    mock.return_value = {
        "labels": ["position", "arguments", "examples", "conclusion"],
        "scores": [0.8, 0.7, 0.6, 0.5],
        "sequence": "This is mock text for testing."
    }
    return mock


@pytest.fixture
def task_service(mock_nlp, mock_semantic_model, mock_text_classifier):
    """Create a TaskAchievementService with mocked dependencies."""
    with patch("spacy.load", return_value=mock_nlp), \
         patch("sentence_transformers.SentenceTransformer", return_value=mock_semantic_model), \
         patch("transformers.pipeline", return_value=mock_text_classifier), \
         patch("nltk.download"):
        service = TaskAchievementService()
        service.nlp = mock_nlp
        service.semantic_model = mock_semantic_model
        service.text_classifier = mock_text_classifier
        return service


@pytest.fixture
def sample_submission():
    """Create a sample submission for testing."""
    return SubmissionCreate(
        text="This is a sample text for testing task achievement analysis. "
             "I believe that education is important for several reasons. "
             "First, it provides individuals with knowledge and skills. "
             "Studies have shown that educated people have better job prospects. "
             "However, there are challenges in access to education. "
             "Nevertheless, governments should invest more in education. "
             "In conclusion, education is vital for personal and societal development.",
        task_type="argument",
        question_desc="Discuss the importance of education in society",
        question_requirements="Include examples and address both benefits and challenges",
        question_number=1,
    )


class TestTaskAchievementService:
    """Test suite for TaskAchievementService."""

    def test_initialization(self):
        """Test that the service initializes correctly."""
        with patch("spacy.load"), \
             patch("sentence_transformers.SentenceTransformer"), \
             patch("transformers.pipeline"), \
             patch("nltk.download"):
            service = TaskAchievementService()
            assert service is not None
            assert hasattr(service, "nlp")
            assert hasattr(service, "semantic_model")
            assert hasattr(service, "text_classifier")
            assert hasattr(service, "task_requirements")
            assert hasattr(service, "discourse_markers")

    def test_analyze_submission_structure(self, task_service, sample_submission):
        """Test that analyze_submission returns the expected structure."""
        with patch.object(task_service, "analyze_task_achievement", return_value={
            "band_score": 7.5,
            "component_scores": {
                "topic_relevance": 0.8,
                "word_count": 1.0,
                "question_alignment": 0.7
            },
            "feedback": {
                "strengths": ["Good coverage of topic"],
                "improvements": ["Could include more examples"]
            },
            "text": sample_submission.text,
            "topic_relevance": {"topic_adherence": 0.8, "is_on_topic": True},
            "word_count": {"meets_requirement": True, "word_count": 300},
            "paragraphs": [{"text": "Para 1", "length": 10}],
            "coherence_score": 0.7,
            "question_alignment": {"overall_score": 0.7}
        }):
            result = task_service.analyze_submission(sample_submission)
            
            assert "grade" in result
            assert "ielts_score" in result
            assert "task_achievement_score" in result
            assert "task_achievement_feedback" in result
            assert "task_achievement_analysis" in result
            assert "strengths" in result["task_achievement_feedback"]
            assert "improvements" in result["task_achievement_feedback"]
            assert "specific_suggestions" in result["task_achievement_feedback"]
            
            assert "band_score" in result["task_achievement_analysis"]
            assert "component_scores" in result["task_achievement_analysis"]
            assert "detailed_analysis" in result["task_achievement_analysis"]
            assert "feedback" in result["task_achievement_analysis"]

    def test_analyze_task_achievement_basic(self, task_service, sample_submission, mock_nlp):
        """Test basic task achievement analysis functionality."""
        # Set up return values for mocked methods
        with patch.object(task_service, "_analyze_topic_relevance", return_value={
                "topic_adherence": 0.8,
                "element_scores": {"position": 0.9, "arguments": 0.8},
                "is_on_topic": True
            }), \
            patch.object(task_service, "_check_word_count", return_value={
                "word_count": 300,
                "meets_requirement": True,
                "difference": 50
            }), \
            patch.object(task_service, "_analyze_paragraphs", return_value=[
                {"text": "Para 1", "length": 10},
                {"text": "Para 2", "length": 15}
            ]), \
            patch.object(task_service, "_analyze_question_alignment", return_value={
                "overall_score": 0.75,
                "addressed_elements": ["education", "benefits"],
                "missing_elements": ["challenges"],
                "total_elements": 3,
                "addressed_count": 2
            }), \
            patch.object(task_service, "_calculate_band_score", return_value=7.5), \
            patch.object(task_service, "_identify_strengths", return_value=[
                "Good word count",
                "Strong topic relevance"
            ]), \
            patch.object(task_service, "_identify_improvements", return_value=[
                "Address missing elements"
            ]):
            
            result = task_service.analyze_task_achievement(
                text=sample_submission.text,
                task_type=sample_submission.task_type,
                question_desc=sample_submission.question_desc,
                question_requirements=sample_submission.question_requirements
            )
            
            assert result["band_score"] == 7.5
            assert "component_scores" in result
            assert "feedback" in result
            assert "strengths" in result["feedback"]
            assert "improvements" in result["feedback"]
            assert len(result["feedback"]["strengths"]) == 2
            assert len(result["feedback"]["improvements"]) == 1

    def test_analyze_topic_relevance(self, task_service, sample_submission):
        """Test topic relevance analysis."""
        text = sample_submission.text
        task_type = sample_submission.task_type
        question_desc = sample_submission.question_desc
        
        with patch.object(task_service.text_classifier, "__call__", return_value={
            "labels": ["position", "arguments", "examples", "conclusion"],
            "scores": [0.8, 0.7, 0.6, 0.5],
            "sequence": text
        }), \
        patch("sklearn.metrics.pairwise.cosine_similarity", return_value=np.array([[0.85]])):
            
            result = task_service._analyze_topic_relevance(
                text=text,
                task_type=task_type,
                question_desc=question_desc
            )
            
            assert "topic_adherence" in result
            assert "element_scores" in result
            assert "is_on_topic" in result
            assert result["is_on_topic"] is True  # Based on our mock return values
            assert isinstance(result["topic_adherence"], float)
            assert len(result["element_scores"]) == 4  # Based on our mock labels

    def test_analyze_question_alignment(self, task_service):
        """Test question alignment analysis."""
        text = "Education provides many benefits to society and individuals."
        question_desc = "Discuss the importance of education and its challenges."
        
        result = task_service._analyze_question_alignment(text, question_desc)
        
        assert "overall_score" in result
        assert "addressed_elements" in result
        assert "missing_elements" in result
        assert isinstance(result["overall_score"], float)
        assert isinstance(result["addressed_elements"], list)
        assert isinstance(result["missing_elements"], list)

    def test_check_word_count(self, task_service, mock_nlp):
        """Test word count checking functionality."""
        # Mock document with 5 tokens (defined in fixture)
        doc = mock_nlp()
        
        result = task_service._check_word_count(doc, "argument")
        
        assert "word_count" in result
        assert "meets_requirement" in result
        assert "difference" in result
        assert result["word_count"] == 5  # Based on our mock
        assert result["meets_requirement"] is False  # 5 < 250
        assert result["difference"] == -245  # 5 - 250

    def test_analyze_paragraphs(self, task_service):
        """Test paragraph analysis."""
        doc = MagicMock()
        doc.text = "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3."
        
        result = task_service._analyze_paragraphs(doc)
        
        assert len(result) == 3
        assert "text" in result[0]
        assert "length" in result[0]
        assert result[0]["text"] == "Paragraph 1."
        assert result[1]["text"] == "Paragraph 2."

    def test_calculate_band_score(self, task_service):
        """Test band score calculation."""
        analysis = {
            "topic_relevance": {"topic_adherence": 0.8},
            "coherence_score": 0.7,
            "word_count": {"meets_requirement": True},
            "question_alignment": {"overall_score": 0.7}
        }
        
        result = task_service._calculate_band_score(analysis, "argument")
        
        assert isinstance(result, float)
        assert 1.0 <= result <= 9.0  # IELTS band score range

    def test_identify_strengths(self, task_service):
        """Test strength identification."""
        analysis = {
            "text": "This is a sample text discussing education.",
            "word_count": {"meets_requirement": True, "word_count": 300},
            "topic_relevance": {
                "topic_adherence": 0.8,
                "element_scores": {"position": 0.9, "arguments": 0.8}
            },
            "question_alignment": {
                "overall_score": 0.8,
                "addressed_count": 2,
                "total_elements": 3,
                "addressed_elements": ["education", "benefits"]
            },
            "task_type": "argument"
        }
        
        with patch.object(task_service, "_analyze_discourse_markers", return_value={
            "position": ["believe", "opinion"],
            "evidence": ["because", "example"],
            "contrast": [],
            "conclusion": ["therefore"]
        }):
            result = task_service._identify_strengths(analysis)
            
            assert isinstance(result, list)
            assert len(result) > 0
            assert any("word count" in item.lower() for item in result)

    def test_identify_improvements(self, task_service):
        """Test improvement identification."""
        analysis = {
            "text": "This is a sample text discussing education.",
            "word_count": {"meets_requirement": False, "word_count": 200, "difference": -50},
            "topic_relevance": {
                "topic_adherence": 0.5,
                "element_scores": {"position": 0.4, "arguments": 0.8}
            },
            "question_alignment": {
                "overall_score": 0.6,
                "addressed_count": 1,
                "total_elements": 3,
                "addressed_elements": ["education"],
                "missing_elements": ["challenges", "solutions"]
            },
            "paragraphs": [{"text": "Para 1", "length": 200}],
            "task_type": "argument",
            "question_desc": "Discuss education challenges and solutions."
        }
        
        with patch.object(task_service, "_analyze_discourse_markers", return_value={
            "position": ["believe"],
            "evidence": [],
            "contrast": [],
            "conclusion": []
        }):
            result = task_service._identify_improvements(analysis)
            
            assert isinstance(result, list)
            assert len(result) > 0
            assert any("word count" in item.lower() for item in result)
            assert any("missing elements" in item.lower() for item in result)

    def test_generate_specific_suggestions(self, task_service):
        """Test specific suggestion generation."""
        analysis = {
            "text": "This is a sample text discussing education.",
            "word_count": {"meets_requirement": False, "word_count": 200, "difference": -50},
            "topic_relevance": {
                "topic_adherence": 0.5,
                "element_scores": {"position": 0.4, "arguments": 0.8}
            },
            "question_alignment": {
                "overall_score": 0.6,
                "addressed_elements": ["education"],
                "missing_elements": ["challenges", "solutions"],
                "total_elements": 3,
                "addressed_count": 1
            },
            "paragraphs": [{"text": "Para 1", "length": 200}],
            "task_type": "argument",
            "question_desc": "Discuss education challenges and solutions."
        }
        
        with patch.object(task_service, "_analyze_discourse_markers", return_value={
            "position": ["believe"],
            "evidence": [],
            "contrast": [],
            "conclusion": []
        }):
            result = task_service._generate_specific_suggestions(analysis)
            
            assert isinstance(result, dict)
            assert "word_count" in result
            assert "topic_relevance" in result
            assert "structure" in result
            assert "question_specific" in result
            assert len(result["word_count"]) > 0
            assert len(result["question_specific"]) > 0

    def test_analyze_discourse_markers(self, task_service):
        """Test discourse marker analysis."""
        analysis = {
            "text": "I believe education is important because it provides opportunities. "
                   "However, there are challenges. In conclusion, we need to invest more."
        }
        
        result = task_service._analyze_discourse_markers(analysis)
        
        assert isinstance(result, dict)
        assert "position" in result
        assert "evidence" in result
        assert "contrast" in result
        assert "conclusion" in result
        assert "believe" in result["position"]
        assert "because" in result["evidence"]
        assert "however" in result["contrast"]
        assert "in conclusion" in result["conclusion"]

    def test_error_handling(self, task_service):
        """Test error handling when analyzing submission."""
        with patch.object(task_service, "analyze_task_achievement", side_effect=Exception("Test error")):
            result = task_service.analyze_submission(MagicMock())
            
            assert result["grade"] == 0
            assert result["ielts_score"] == 1
            assert len(result["task_achievement_feedback"]["improvements"]) > 0
            assert len(result["task_achievement_feedback"]["strengths"]) == 0

    @patch("sklearn.metrics.pairwise.cosine_similarity")
    def test_semantic_similarity_calculation(self, mock_cosine, task_service):
        """Test semantic similarity calculation in question alignment."""
        mock_cosine.return_value = np.array([[0.75]])

        text = "Education is important for society's development."
        question = "Discuss the role of education in society."

        # Mock the encode method to return 1D arrays as the actual implementation expects
        with patch.object(task_service.semantic_model, "encode", side_effect=[
            np.array([0.1, 0.2, 0.3]),  # 1D array for text
            np.array([0.2, 0.3, 0.4])   # 1D array for question
        ]):
            analysis = task_service._analyze_question_alignment(text, question)
            assert "overall_score" in analysis
            assert analysis["overall_score"] > 0
            # The mock should now be called since we'll properly reshape the 1D arrays to 2D
            mock_cosine.assert_called_once()