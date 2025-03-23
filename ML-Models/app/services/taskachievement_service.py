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
            
            # Get question details if available
            question_desc = getattr(submission, 'question_desc', None)
            question_requirements = getattr(submission, 'question_requirements', None)

            analysis = self.analyze_task_achievement(
                text=text, 
                task_type=task_type,
                question_desc=question_desc,
                question_requirements=question_requirements
            )

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

    def analyze_task_achievement(self, *, text: str, task_type: str, 
                           question_desc: str = None, 
                           question_requirements: str = None) -> Dict[str, Any]:
        """Main analysis method for task achievement."""
        try:
            doc = self.nlp(text)

            # Perform analysis
            analysis = {
                "text": text,  # Store the original text for reference
                "topic_relevance": self._analyze_topic_relevance(
                    text, task_type, question_desc, question_requirements
                ),
                "word_count": self._check_word_count(doc, task_type),
                "paragraphs": self._analyze_paragraphs(doc),
                # Note: coherence is calculated elsewhere but kept for reference
                "coherence_score": 0.0,  # Placeholder, not used in task achievement score
                "question_alignment": self._analyze_question_alignment(
                    text, question_desc, question_requirements
                ) if question_desc or question_requirements else None
            }

            # Calculate band score with improved weighting
            band_score = self._calculate_band_score(analysis, task_type)

            # Compile feedback
            strengths = self._identify_strengths(analysis)
            improvements = self._identify_improvements(analysis)

            return {
                "band_score": band_score,
                "component_scores": {
                    "topic_relevance": analysis["topic_relevance"]["topic_adherence"],
                    # Coherence removed from component scores
                    "word_count": 1.0 if analysis["word_count"]["meets_requirement"] else 0.5,
                    "question_alignment": analysis.get("question_alignment", {}).get("overall_score", 0.5) 
                    if analysis.get("question_alignment") else 0.5
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
    
    def _analyze_topic_relevance(self, text: str, task_type: str, 
                               question_desc: str = None, 
                               question_requirements: str = None) -> Dict[str, Any]:
        """Analyze topic adherence using classification and semantic similarity."""
        try:
            # Use task-specific topics based on task type
            candidate_topics = self.task_requirements[task_type]["elements"]

            # Zero-shot classification for task elements
            classification = self.text_classifier(
                text, 
                candidate_labels=candidate_topics,
                multi_label=True
            )
            
            # Calculate base topic score from task type requirements
            base_topic_score = sum(classification["scores"]) / len(classification["scores"])
            
            # Calculate semantic similarity with question if available
            question_similarity = 0.0
            if question_desc or question_requirements:
                question_text = " ".join(filter(None, [question_desc, question_requirements]))
                # Get embeddings
                text_embedding = self.semantic_model.encode(text)
                question_embedding = self.semantic_model.encode(question_text)
                
                # Compute cosine similarity
                from sklearn.metrics.pairwise import cosine_similarity
                import numpy as np
                question_similarity = float(cosine_similarity(
                    [text_embedding], [question_embedding]
                )[0][0])
                
            # Final topic score: weighted combination of base score and question similarity
            final_topic_score = base_topic_score
            if question_desc or question_requirements:
                # Give more weight to question similarity when available
                final_topic_score = (base_topic_score * 0.4) + (question_similarity * 0.6)

            return {
                "topic_adherence": final_topic_score,
                "element_scores": dict(zip(classification["labels"], classification["scores"])),
                "question_similarity": question_similarity if question_desc or question_requirements else None,
                "is_on_topic": final_topic_score > 0.5
            }

        except Exception as e:
            logger.error(f"Error in topic relevance analysis: {e}")
            return {"topic_adherence": 0.5, "element_scores": {}, "is_on_topic": True}

    def _analyze_question_alignment(self, text: str, question_desc: str = None, 
                                  question_requirements: str = None) -> Dict[str, Any]:
        """Analyze how well the submission aligns with the specific question."""
        if not question_desc and not question_requirements:
            return None
            
        try:
            combined_question = " ".join(filter(None, [question_desc, question_requirements]))
            
            # Extract key phrases from question
            question_doc = self.nlp(combined_question)
            key_phrases = [
                chunk.text for chunk in question_doc.noun_chunks
                if len(chunk.text.split()) > 1 or not chunk.root.is_stop
            ]
            
            # Check if key phrases are addressed in the text
            text_doc = self.nlp(text)
            text_lower = text_doc.text.lower()
            
            addressed_phrases = []
            missing_phrases = []
            
            for phrase in key_phrases:
                phrase_lower = phrase.lower()
                # Check for exact phrase or semantic similarity using word vectors
                if phrase_lower in text_lower:
                    addressed_phrases.append(phrase)
                else:
                    # Check for semantic similarity
                    phrase_vec = self.nlp(phrase).vector
                    similarity_scores = []
                    
                    # Compare with each sentence
                    for sent in text_doc.sents:
                        if len(sent.text.strip()) > 0:
                            sent_vec = sent.vector
                            from numpy import dot
                            from numpy.linalg import norm
                            
                            # Calculate cosine similarity
                            cos_sim = dot(phrase_vec, sent_vec) / (norm(phrase_vec) * norm(sent_vec)) 
                            similarity_scores.append(cos_sim)
                    
                    # If any sentence has high similarity, consider the phrase addressed
                    if similarity_scores and max(similarity_scores) > 0.6:
                        addressed_phrases.append(phrase)
                    else:
                        missing_phrases.append(phrase)
            
            # Calculate alignment score
            if not key_phrases:
                alignment_score = 0.5  # Default if no key phrases found
            else:
                alignment_score = len(addressed_phrases) / len(key_phrases)
                
            return {
                "overall_score": alignment_score,
                "addressed_elements": addressed_phrases,
                "missing_elements": missing_phrases,
                "total_elements": len(key_phrases),
                "addressed_count": len(addressed_phrases)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing question alignment: {e}")
            return {"overall_score": 0.5, "addressed_elements": [], "missing_elements": []}

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
        text = doc.text
        paragraphs = text.split('\n\n')
        if len(paragraphs) <= 1:
            # Try with single newline if double newline doesn't work
            paragraphs = text.split('\n')
            if len(paragraphs) <= 1:
                # Fall back to sentence-based paragraphs
                paragraphs = [sent.text for sent in doc.sents]
        
        return [{"text": para.strip(), "length": len(para.split())} for para in paragraphs if para.strip()]

    def _analyze_coherence(self, doc) -> float:
        """Analyze text coherence using discourse markers."""
        total_markers = 0
        marker_occurrences = {}
        
        for category, markers in self.discourse_markers.items():
            marker_occurrences[category] = []
            for marker in markers:
                text_lower = doc.text.lower()
                if marker in text_lower:
                    total_markers += 1
                    marker_occurrences[category].append(marker)
        
        # Check distribution of markers across categories
        category_counts = [len(markers) for markers in marker_occurrences.values()]
        has_balanced_distribution = all(count > 0 for count in category_counts)
        
        # Normalize coherence score (0-1)
        marker_score = min(1.0, total_markers / 10)  # Expect about 10 markers for full score
        
        # Bonus for balanced distribution
        distribution_bonus = 0.2 if has_balanced_distribution else 0.0
        final_score = min(1.0, marker_score + distribution_bonus)
        
        return final_score

    def _calculate_band_score(self, analysis: Dict[str, Any], task_type: str) -> float:
        """Calculate the IELTS band score based on task achievement analysis."""
        try:
            # Adjust weights to emphasize question alignment when available
            if analysis.get("question_alignment"):
                weights = {
                    "topic_relevance": 0.3,
                    "coherence": 0.0,
                    "word_count": 0.1,
                    "question_alignment": 0.3
                }
            else:
                weights = {
                    "topic_relevance": 0.5,
                    "coherence": 0.0,
                    "word_count": 0.2
                }

            topic_score = analysis["topic_relevance"]["topic_adherence"]
            coherence_score = analysis["coherence_score"]
            meets_word_count = analysis["word_count"]["meets_requirement"]
            word_count_score = 1.0 if meets_word_count else 0.5
            
            # Add question alignment if available
            question_alignment_score = 0.0
            if analysis.get("question_alignment"):
                question_alignment_score = analysis["question_alignment"]["overall_score"]
            
            # Calculate weighted score
            weighted_score = (
                (topic_score * weights["topic_relevance"]) +
                (coherence_score * weights["coherence"]) +
                (word_count_score * weights["word_count"])
            )
            
            # Add question alignment component if available
            if analysis.get("question_alignment"):
                weighted_score += (question_alignment_score * weights["question_alignment"])

            # Convert to IELTS band scale (1-9)
            band_score = 1 + (weighted_score * 8)
            return round(max(1.0, min(9.0, band_score)), 1)

        except Exception as e:
            logger.error(f"Error calculating band score: {e}")
            return 1.0

    def _identify_strengths(self, analysis: Dict[str, Any]) -> List[str]:
        """Identify strengths in the submission with specific examples from the text."""
        strengths = []
        text = analysis.get("text", "")
        
        if analysis["word_count"]["meets_requirement"]:
            word_count = analysis["word_count"]["word_count"]
            required = self.task_requirements.get(analysis.get("task_type", ""), {}).get("min_words", 250)
            strengths.append(f"Meets the required word count ({word_count} words, exceeding the minimum of {required})")
        
        if analysis["topic_relevance"]["topic_adherence"] > 0.7:
            # Extract strong elements with high scores
            if "element_scores" in analysis["topic_relevance"]:
                strong_elements = [
                    element for element, score in 
                    analysis["topic_relevance"]["element_scores"].items()
                    if score > 0.7
                ]
                if strong_elements:
                    elements_text = ", ".join(strong_elements[:3])
                    strengths.append(f"Strong coverage of key elements: {elements_text}")
                else:
                    strengths.append("Strong topic relevance and task achievement")
        
        # Add question-specific strength with examples
        if analysis.get("question_alignment") and analysis["question_alignment"]["overall_score"] > 0.7:
            addressed_count = analysis["question_alignment"]["addressed_count"]
            total = analysis["question_alignment"]["total_elements"]
            addressed_elements = analysis["question_alignment"]["addressed_elements"]
            
            if addressed_elements:
                example_elements = ", ".join(addressed_elements[:3])
                if len(addressed_elements) > 3:
                    example_elements += f", and {len(addressed_elements) - 3} more"
                strengths.append(f"Successfully addressed {addressed_count} out of {total} key elements including: {example_elements}")
            else:
                strengths.append(f"Successfully addressed {addressed_count} out of {total} key elements from the question")
        
        # Add specific discourse marker strengths with examples from the text
        marker_categories = self._analyze_discourse_markers(analysis)
        for category, markers in marker_categories.items():
            if len(markers) >= 2:
                category_name = category.replace("_", " ").title()
                
                # Find actual instances in text
                examples = []
                for marker in markers[:2]:  # Limit to 2 markers for examples
                    # Find a sentence or phrase containing this marker
                    lower_text = text.lower()
                    start_idx = lower_text.find(marker)
                    if start_idx >= 0:
                        # Extract partial sentence around marker (up to 60 chars)
                        context_start = max(0, start_idx - 30)
                        context_end = min(len(text), start_idx + len(marker) + 30)
                        
                        # Find sentence boundaries
                        while context_start > 0 and text[context_start] not in ".!?\n":
                            context_start -= 1
                        if context_start > 0:
                            context_start += 1  # Move past the punctuation
                            
                        while context_end < len(text) and text[context_end] not in ".!?\n":
                            context_end += 1
                        
                        example = text[context_start:context_end].strip()
                        if example:
                            examples.append(f'"{example}"')
                
                if examples:
                    strengths.append(f"Effective use of {category_name} markers, for example: {examples[0]}")
                else:
                    strengths.append(f"Effective use of {category_name} markers ({', '.join(markers[:3])})")
        
        return strengths

    def _identify_improvements(self, analysis: Dict[str, Any]) -> List[str]:
        """Identify areas for improvement with specific examples from the text."""
        improvements = []
        text = analysis.get("text", "")
        
        if not analysis["word_count"]["meets_requirement"]:
            diff = abs(analysis["word_count"]["difference"])
            current = analysis["word_count"]["word_count"]
            required = self.task_requirements.get(analysis.get("task_type", ""), {}).get("min_words", 250)
            improvements.append(f"Increase word count by {diff} words to meet the minimum requirement (currently {current}/{required})")
        
        if analysis["topic_relevance"]["topic_adherence"] < 0.6:
            # Identify weak elements
            if "element_scores" in analysis["topic_relevance"]:
                weak_elements = [
                    element for element, score in 
                    analysis["topic_relevance"]["element_scores"].items()
                    if score < 0.5
                ]
                if weak_elements:
                    elements_text = ", ".join(weak_elements[:3])
                    improvements.append(f"Improve coverage of key task elements: {elements_text}")
                else:
                    improvements.append("Improve coverage of key task elements")
        
        # Add question-specific improvements with concrete suggestions
        if analysis.get("question_alignment") and analysis["question_alignment"]["overall_score"] < 0.7:
            missing_elements = analysis["question_alignment"]["missing_elements"]
            if missing_elements:
                if len(missing_elements) <= 3:
                    elements_text = ", ".join(missing_elements)
                    
                    # Add specific suggestion based on question content
                    question_desc = analysis.get("question_desc", "")
                    if question_desc and any(element.lower() in question_desc.lower() for element in missing_elements):
                        improvements.append(f"Address missing elements from the question: {elements_text}. Consider expanding on how they relate to the main topic.")
                    else:
                        improvements.append(f"Address missing elements from the question: {elements_text}")
                else:
                    improvements.append(f"Address {len(missing_elements)} missing elements from the question including: {', '.join(missing_elements[:3])}")
        
        # Check discourse marker balance
        marker_categories = self._analyze_discourse_markers(analysis)
        empty_categories = [
            category.replace("_", " ").title() 
            for category, markers in marker_categories.items() 
            if not markers
        ]
        
        if empty_categories:
            missing_types = ", ".join(empty_categories)
            # Provide examples of missing marker types
            examples = []
            for category in empty_categories[:2]:  # Limit to first 2 categories
                category_lower = category.lower().replace(" ", "_")
                if category_lower in self.discourse_markers:
                    marker_examples = ", ".join(self.discourse_markers[category_lower][:3])
                    examples.append(f"{category} markers (such as: {marker_examples})")
            
            if examples:
                improvements.append(f"Include {missing_types} discourse markers. Consider adding {' and '.join(examples)}")
            else:
                improvements.append(f"Include {missing_types} discourse markers to strengthen your response")
        
        # Analyze paragraph structure if needed
        if analysis.get("paragraphs") and len(analysis["paragraphs"]) < 3:
            improvements.append("Structure your response with more paragraphs to better organize your ideas (aim for at least 4-5 paragraphs)")
        
        return improvements

    def _generate_specific_suggestions(self, analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate specific suggestions based on the analysis results with examples from the text."""
        suggestions = {
            "word_count": [],
            "topic_relevance": [],
            "structure": [],
            "question_specific": [],
            "general": []
        }
        
        text = analysis.get("text", "")
        task_type = analysis.get("task_type", "")

        # Word count suggestions
        if not analysis["word_count"]["meets_requirement"]:
            diff = abs(analysis["word_count"]["difference"])
            current = analysis["word_count"]["word_count"]
            required = self.task_requirements.get(task_type, {}).get("min_words", 250)
            
            suggestions["word_count"].append(
                f"Add approximately {diff} more words to meet the minimum requirement of {required} words (currently {current})"
            )
            
            # Add specific content expansion suggestions based on task type
            if task_type == "argument":
                suggestions["word_count"].append(
                    "Consider adding more examples or evidence to support your main arguments"
                )
            elif task_type == "discussion":
                suggestions["word_count"].append(
                    "Expand on both perspectives with additional details or examples"
                )
            elif task_type == "problem_solution":
                suggestions["word_count"].append(
                    "Provide more detailed explanations of the causes or solutions you've identified"
                )

        # Topic relevance suggestions with examples from requirements
        if "element_scores" in analysis.get("topic_relevance", {}):
            weak_elements = [
                element for element, score in 
                analysis["topic_relevance"]["element_scores"].items()
                if score < 0.6
            ]
            
            if weak_elements:
                for element in weak_elements[:2]:  # Limit to first 2 weak elements
                    # Customize suggestion based on element type and task type
                    if element == "position" and task_type == "argument":
                        suggestions["topic_relevance"].append(
                            "State your position more clearly using phrases like 'I believe that...' or 'In my opinion...'"
                        )
                    elif element == "arguments" and task_type == "argument":
                        suggestions["topic_relevance"].append(
                            "Strengthen your arguments with more specific reasoning and evidence"
                        )
                    elif element == "examples" and task_type in ["argument", "discussion"]:
                        suggestions["topic_relevance"].append(
                            "Include more concrete examples to illustrate your points"
                        )
                    elif element == "multiple_views" and task_type == "discussion":
                        suggestions["topic_relevance"].append(
                            "Present alternative perspectives more clearly, using phrases like 'On the other hand...' or 'Others argue that...'"
                        )
                    elif element == "problem" and task_type == "problem_solution":
                        suggestions["topic_relevance"].append(
                            "Describe the problem in more detail, including its scope and impact"
                        )
                    elif element == "solutions" and task_type == "problem_solution":
                        suggestions["topic_relevance"].append(
                            "Expand on your proposed solutions with more specific details about implementation"
                        )
                    else:
                        suggestions["topic_relevance"].append(
                            f"Strengthen coverage of '{element}' in your response"
                        )

        # Structure suggestions
        if analysis.get("paragraphs") and len(analysis["paragraphs"]) < 3:
            task_structure = self.task_requirements.get(task_type, {}).get("paragraph_structure", [])
            if task_structure:
                structure_text = ", ".join(task_structure)
                suggestions["structure"].append(
                    f"Structure your response with paragraphs for: {structure_text}"
                )
            else:
                suggestions["structure"].append(
                    "Structure your response with at least 4 paragraphs: introduction, 2-3 body paragraphs, and conclusion"
                )
        
        # Check discourse marker balance
        marker_categories = self._analyze_discourse_markers(analysis)
        empty_categories = [
            category for category, markers in marker_categories.items() 
            if not markers
        ]
        
        if empty_categories:
            for category in empty_categories[:2]:  # Limit to first 2 categories
                if category in self.discourse_markers:
                    marker_examples = ", ".join(self.discourse_markers[category][:3])
                    suggestions["structure"].append(
                        f"Include {category.replace('_', ' ')} markers such as: '{marker_examples}'"
                    )

        # Question-specific suggestions
        if analysis.get("question_alignment") and analysis["question_alignment"]["missing_elements"]:
            missing = analysis["question_alignment"]["missing_elements"]
            for element in missing[:3]:  # Limit to first 3 to avoid overwhelming
                suggestions["question_specific"].append(f"Address '{element}' in your response")
                
                # Add context from question if available
                question_desc = analysis.get("question_desc", "")
                if question_desc and element.lower() in question_desc.lower():
                    # Find context for this element in the question
                    start_idx = question_desc.lower().find(element.lower())
                    if start_idx >= 0:
                        # Extract partial sentence around element
                        context_start = max(0, start_idx - 20)
                        context_end = min(len(question_desc), start_idx + len(element) + 20)
                        
                        while context_start > 0 and question_desc[context_start] not in ".!?\n":
                            context_start -= 1
                        if context_start > 0:
                            context_start += 1
                            
                        while context_end < len(question_desc) and question_desc[context_end] not in ".!?\n":
                            context_end += 1
                        
                        context = question_desc[context_start:context_end].strip()
                        if context:
                            suggestions["question_specific"].append(
                                f"From the question: \"{context}\" - make sure to address this point"
                            )
                    
            if len(missing) > 3:
                suggestions["question_specific"].append(f"Also address {len(missing) - 3} other elements from the question")

        # Add default suggestion if none were generated
        if not any(suggestions.values()):
            suggestions["general"].append(
                "Review the task requirements and ensure all aspects are addressed"
            )
            
            # Add task-specific general suggestions
            if task_type == "argument":
                suggestions["general"].append(
                    "Make sure your position is clear and supported by strong arguments and examples"
                )
            elif task_type == "discussion":
                suggestions["general"].append(
                    "Ensure you've presented multiple perspectives before giving your own opinion"
                )
            elif task_type == "problem_solution":
                suggestions["general"].append(
                    "Check that you've thoroughly described both the problem and potential solutions"
                )

        return suggestions

    def _generate_detailed_analysis(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed analysis of the submission."""
        detailed = {
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
        
        # Add question-specific analysis if available
        if analysis.get("question_alignment"):
            detailed["question_alignment"] = analysis["question_alignment"]
            
        return detailed

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