from typing import Dict, Any, List
import spacy
from transformers import pipeline
from sentence_transformers import SentenceTransformer
import nltk
import logging
from ..schemas.submission import SubmissionCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskAchievementService:
    def __init__(self):
        try:
            # Load NLP models
            self.nlp = spacy.load("en_core_web_md")
            self.semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
            self.text_classifier = pipeline("zero-shot-classification")

            # Download required NLTK data
            nltk.download("punkt", quiet=True)
            nltk.download("wordnet", quiet=True)

            # Task type requirements
            self.task_requirements = {
                "argument": {
                    "min_words": 250,
                    "elements": ["position", "arguments", "examples", "conclusion"],
                    "paragraph_structure": ["introduction", "body", "conclusion"],
                },
                "discussion": {
                    "min_words": 250,
                    "elements": ["overview", "multiple_views", "opinion", "conclusion"],
                    "paragraph_structure": ["introduction", "view1", "view2", "conclusion"],
                },
                "problem_solution": {
                    "min_words": 250,
                    "elements": ["problem", "causes", "solutions", "evaluation"],
                    "paragraph_structure": ["introduction", "problems", "solutions", "conclusion"],
                },
            }

            # Discourse markers
            self.discourse_markers = {
                "position": ["believe", "opinion", "agree", "disagree", "argue", "think"],
                "evidence": ["because", "since", "research", "studies", "example", "instance"],
                "contrast": ["however", "although", "despite", "nevertheless", "while"],
                "conclusion": ["therefore", "thus", "consequently", "in conclusion", "overall"],
            }

            logger.info("Task Achievement service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Task Achievement service: {e}")
            raise

    def analyze_submission(self, submission: SubmissionCreate) -> Dict[str, Any]:
        """Analyze a submission and return structured results."""
        try:
            if not submission.text or not submission.task_type:
                raise ValueError("Missing required submission fields: text and task_type")

            text = submission.text.strip()
            task_type = submission.task_type.lower()

            analysis = self.analyze_task_achievement(text=text, task_type=task_type)

            # Convert band score to percentage
            grade_percentage = (analysis["band_score"] - 1) * (100 / 8)

            return {
                "grade": max(0, min(100, grade_percentage)),
                "ielts_score": max(1, min(9, analysis["band_score"])),
                "task_achievement_score": analysis["band_score"],
                "task_achievement_feedback": {
                    "strengths": analysis["feedback"]["strengths"],
                    "improvements": analysis["feedback"]["improvements"],
                    "specific_suggestions": self._generate_specific_suggestions(analysis)
                },
                "task_achievement_analysis": {
                    "band_score": analysis["band_score"],
                    "component_scores": analysis["component_scores"],
                    "detailed_analysis": self._generate_detailed_analysis(analysis),
                    "feedback": {
                        "strengths": analysis["feedback"]["strengths"],
                        "improvements": analysis["feedback"]["improvements"],
                        "specific_suggestions": self._generate_specific_suggestions(analysis)
                    }
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing submission: {e}")
            return self._generate_error_response()

    def analyze_task_achievement(self, *, text: str, task_type: str) -> Dict[str, Any]:
        """Main analysis method for task achievement."""
        try:
            doc = self.nlp(text)

            # Perform analysis
            analysis = {
                "topic_relevance": self._analyze_topic_relevance(text, task_type),
                "word_count": self._check_word_count(doc, task_type),
                "paragraphs": self._analyze_paragraphs(doc),
                "coherence_score": self._analyze_coherence(doc)
            }

            # Calculate band score
            band_score = self._calculate_band_score(analysis, task_type)

            # Compile feedback
            strengths = self._identify_strengths(analysis)
            improvements = self._identify_improvements(analysis)

            return {
                "band_score": band_score,
                "component_scores": {
                    "topic_relevance": analysis["topic_relevance"]["topic_adherence"],
                    "coherence": analysis["coherence_score"],
                    "word_count": 1.0 if analysis["word_count"]["meets_requirement"] else 0.5
                },
                "feedback": {
                    "strengths": strengths,
                    "improvements": improvements
                },
                **analysis  # Include full analysis for detailed feedback
            }

        except Exception as e:
            logger.error(f"Error analyzing task achievement: {e}")
            return self._generate_error_response()

    def _analyze_topic_relevance(self, text: str, task_type: str) -> Dict[str, Any]:
        """Analyze topic adherence using classification."""
        try:
            # Use task-specific topics based on task type
            candidate_topics = self.task_requirements[task_type]["elements"]

            classification = self.text_classifier(
                text, 
                candidate_labels=candidate_topics,
                multi_label=True
            )

            # Calculate average score across all relevant elements
            topic_score = sum(classification["scores"]) / len(classification["scores"])

            return {
                "topic_adherence": topic_score,
                "element_scores": dict(zip(classification["labels"], classification["scores"])),
                "is_on_topic": topic_score > 0.5
            }

        except Exception as e:
            logger.error(f"Error in topic relevance analysis: {e}")
            return {"topic_adherence": 0.5, "element_scores": {}, "is_on_topic": True}

    def _check_word_count(self, doc, task_type: str) -> Dict[str, Any]:
        """Check if response meets word count requirements."""
        word_count = sum(1 for token in doc if token.is_alpha)
        min_required = self.task_requirements.get(task_type, {}).get("min_words", 250)

        return {
            "word_count": word_count,
            "meets_requirement": word_count >= min_required,
            "difference": word_count - min_required,
        }

    def _analyze_paragraphs(self, doc) -> List[Dict[str, Any]]:
        """Analyze paragraph structure and content."""
        paragraphs = [sent.text for sent in doc.sents]
        return [{"text": para, "length": len(para.split())} for para in paragraphs]

    def _analyze_coherence(self, doc) -> float:
        """Analyze text coherence using discourse markers."""
        total_markers = 0
        for category, markers in self.discourse_markers.items():
            for marker in markers:
                if marker in doc.text.lower():
                    total_markers += 1
        
        # Normalize coherence score (0-1)
        return min(1.0, total_markers / 10)  # Expect about 10 markers for full score

    def _calculate_band_score(self, analysis: Dict[str, Any], task_type: str) -> float:
        """Calculate the IELTS band score based on task achievement analysis."""
        try:
            weights = {
                "topic_relevance": 0.4,
                "coherence": 0.4,
                "word_count": 0.2
            }

            topic_score = analysis["topic_relevance"]["topic_adherence"]
            coherence_score = analysis["coherence_score"]
            meets_word_count = analysis["word_count"]["meets_requirement"]

            # Calculate weighted score
            weighted_score = (
                (topic_score * weights["topic_relevance"]) +
                (coherence_score * weights["coherence"]) +
                (1.0 if meets_word_count else 0.5) * weights["word_count"]
            )

            # Convert to IELTS band scale (1-9)
            band_score = 1 + (weighted_score * 8)
            return round(max(1.0, min(9.0, band_score)), 1)

        except Exception as e:
            logger.error(f"Error calculating band score: {e}")
            return 1.0

    def _identify_strengths(self, analysis: Dict[str, Any]) -> List[str]:
        """Identify strengths in the submission."""
        strengths = []
        
        if analysis["word_count"]["meets_requirement"]:
            strengths.append("Meets the required word count")
        
        if analysis["topic_relevance"]["topic_adherence"] > 0.7:
            strengths.append("Strong topic relevance and task achievement")
        
        if analysis["coherence_score"] > 0.7:
            strengths.append("Good use of cohesive devices and clear structure")
        
        return strengths

    def _identify_improvements(self, analysis: Dict[str, Any]) -> List[str]:
        """Identify areas for improvement."""
        improvements = []
        
        if not analysis["word_count"]["meets_requirement"]:
            diff = analysis["word_count"]["difference"]
            improvements.append(f"Increase word count by {abs(diff)} words to meet the minimum requirement")
        
        if analysis["topic_relevance"]["topic_adherence"] < 0.6:
            improvements.append("Improve coverage of key task elements")
        
        if analysis["coherence_score"] < 0.6:
            improvements.append("Use more discourse markers to improve coherence")
        
        return improvements

    def _generate_specific_suggestions(self, analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate specific suggestions based on the analysis results."""
        suggestions = {
            "word_count": [],
            "topic_relevance": [],
            "structure": [],
            "general": []
        }

        # Word count suggestions
        if not analysis["word_count"]["meets_requirement"]:
            diff = abs(analysis["word_count"]["difference"])
            suggestions["word_count"].append(
                f"Add approximately {diff} more words to meet the minimum requirement"
            )

        # Topic relevance suggestions
        if "element_scores" in analysis["topic_relevance"]:
            weak_elements = [
                element for element, score in 
                analysis["topic_relevance"]["element_scores"].items()
                if score < 0.6
            ]
            if weak_elements:
                suggestions["topic_relevance"].extend(
                    f"Strengthen coverage of '{element}'" for element in weak_elements
                )

        # Structure suggestions
        if analysis["coherence_score"] < 0.6:
            suggestions["structure"].extend([
                "Use more linking words to connect ideas",
                "Ensure each paragraph has a clear main idea",
                "Use appropriate discourse markers to show relationships between ideas"
            ])

        # Add default suggestion if none were generated
        if not any(suggestions.values()):
            suggestions["general"].append(
                "Review the task requirements and ensure all aspects are addressed"
            )

        return suggestions

    def _generate_detailed_analysis(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed analysis of the submission."""
        return {
            "structure_analysis": {
                "paragraphs": analysis.get("paragraphs", []),
                "coherence": analysis.get("coherence_score", 0.0)
            },
            "content_analysis": {
                "topic_relevance": analysis.get("topic_relevance", {}),
                "discourse_markers": self._analyze_discourse_markers(analysis)
            },
            "word_count_analysis": analysis.get("word_count", {})
        }

    def _analyze_discourse_markers(self, analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """Analyze the use of discourse markers in the text."""
        try:
            text = analysis.get("text", "").lower()
            found_markers = {
                category: [
                    marker for marker in markers 
                    if marker in text
                ]
                for category, markers in self.discourse_markers.items()
            }
            return found_markers
        except Exception:
            return {category: [] for category in self.discourse_markers.keys()}

    def _generate_error_response(self) -> Dict[str, Any]:
        """Generate a properly structured error response."""
        error_suggestions = {
            "submission": ["Please try submitting your text again"],
            "formatting": ["Ensure your text is properly formatted"],
            "requirements": ["Check that your submission meets the minimum requirements"]
        }
        
        return {
            "grade": 0,
            "ielts_score": 1,
            "task_achievement_score": 1.0,
            "task_achievement_feedback": {
                "strengths": [],
                "improvements": ["Could not analyze text properly"],
                "specific_suggestions": error_suggestions
            },
            "task_achievement_analysis": {
                "band_score": 1.0,
                "component_scores": {
                    "topic_relevance": 1.0,
                    "coherence": 1.0,
                    "word_count": 1.0
                },
                "detailed_analysis": {
                    "structure_analysis": {
                        "paragraphs": [],
                        "coherence": 0.0
                    },
                    "content_analysis": {
                        "topic_relevance": {},
                        "discourse_markers": {}
                    },
                    "word_count_analysis": {
                        "word_count": 0,
                        "meets_requirement": False,
                        "difference": -250
                    }
                },
                "feedback": {
                    "strengths": [],
                    "improvements": ["Could not analyze text properly"],
                    "specific_suggestions": error_suggestions
                }
            }
        }