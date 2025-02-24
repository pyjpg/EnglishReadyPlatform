from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from . import schemas
from .database import engine, get_db
from .models.submission import Submission
from transformers import pipeline
import nltk
from nltk.tokenize import sent_tokenize
from .services.lexical_service import LexicalService
from .services.taskachievement_service import TaskAchievementService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download NLTK data
try:
    nltk.download('punkt', quiet=True)
except Exception as e:
    logger.error(f"Failed to download NLTK punkt: {e}")

class GrammarService:
    def __init__(self):
        try:
            # Load the CoLA model for grammatical acceptability
            self.grammar_checker = pipeline(
                "text-classification",
                model="textattack/bert-base-uncased-COLA",
                device=-1  # Use CPU. Change to 0 for GPU
            )
            logger.info("Grammar checker model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load grammar checker model: {e}")
            raise RuntimeError("Failed to initialize grammar service")

    def analyze_grammar(self, text: str) -> dict:
        try:
            # Split text into sentences
            sentences = sent_tokenize(text)

            if not sentences:
                raise ValueError("No valid sentences found in the text")

            # Analyze each sentence
            sentence_scores = []
            total_score = 0

            for sentence in sentences:
                result = self.grammar_checker(sentence)[0]
                score = result['score']
                sentence_scores.append({
                    'sentence': sentence,
                    'score': score
                })
                total_score += score

            # Calculate average score and convert to IELTS scale (1-9)
            avg_score = total_score / len(sentences)
            ielts_grammar_score = self._convert_to_ielts_scale(avg_score)

            return {
                'overall_score': round(ielts_grammar_score, 1),
                'raw_score': round(avg_score, 3),
                'sentence_analysis': sentence_scores,
                'feedback': self._generate_feedback(avg_score)
            }
        except Exception as e:
            logger.error(f"Error analyzing grammar: {e}")
            raise

    def _convert_to_ielts_scale(self, cola_score: float) -> float:
        return 1 + (cola_score * 8)

    def _generate_feedback(self, score: float) -> str:
        if score > 0.8:
            return "Excellent grammar with sophisticated structures."
        elif score > 0.6:
            return "Good grammar with occasional errors that don't impede understanding."
        elif score > 0.4:
            return "Adequate grammar but with noticeable errors."
        else:
            return "Significant grammatical errors that affect understanding."

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Initialize GrammarService
grammar_service = None
lexical_service = None
taskachievement_service = None
@app.on_event("startup")
async def startup_event():
    global grammar_service, lexical_service, taskachievement_service
    try:
        grammar_service = GrammarService()
        lexical_service = LexicalService()
        taskachievement_service = TaskAchievementService()
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/submit-writing", response_model=schemas.submission.SubmissionResponse)
async def submit_writing(
    submission: schemas.submission.SubmissionCreate,
    db: Session = Depends(get_db)
):
    try:
        # Create new submission
        db_submission = Submission(
            text=submission.text,
            task_type=submission.task_type,
            question_number=submission.question_number
        )
        
        # Analyze all aspects
        grammar_analysis = grammar_service.analyze_grammar(submission.text)
        lexical_analysis = lexical_service.analyze_lexical(submission.text)
        task_analysis = taskachievement_service.analyze_submission(submission)
        
        # Calculate IELTS scores (1-9 scale)
        weights = {
            'grammar': 0.33,
            'lexical': 0.33,
            'task_achievement': 0.34
        }

        ielts_score = (
            grammar_analysis['overall_score'] * weights['grammar'] +
            lexical_analysis['overall_score'] * weights['lexical'] +
            task_analysis['ielts_score'] * weights['task_achievement']
        )
        
        # Round IELTS score to nearest 0.5
        ielts_score = round(ielts_score * 2) / 2
        ielts_score = max(1.0, min(9.0, ielts_score))
        
        # Convert IELTS score to percentage (1-9 → 0-100)
        percentage_grade = ((ielts_score - 1) / 8) * 100
        
        # Update submission with analysis results
        db_submission.grade = percentage_grade
        db_submission.ielts_score = ielts_score
        db_submission.grammar_feedback = grammar_analysis['feedback']
        db_submission.raw_grammar_score = grammar_analysis['raw_score']
        db_submission.grammar_analysis = grammar_analysis
        db_submission.lexical_feedback = lexical_analysis['feedback']
        db_submission.lexical_score = lexical_analysis['overall_score']
        db_submission.lexical_analysis = lexical_analysis
        db_submission.task_achievement_score = task_analysis['ielts_score']
        db_submission.task_achievement_feedback = task_analysis['task_achievement_feedback']
        db_submission.task_achievement_analysis = task_analysis['task_achievement_analysis']

        # Save to DB
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)

        # Return structured response
        return {
            **db_submission.__dict__,
            'grammar_analysis': grammar_analysis,
            'lexical_analysis': lexical_analysis,
            'task_achievement_analysis': task_analysis['task_achievement_analysis']
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/submissions/{submission_id}", response_model=schemas.submission.SubmissionResponse)
async def get_submission(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

# Health check endpoint
@app.get("/health")
async def health_check():
    if grammar_service is None or lexical_service is None:
        raise HTTPException(status_code=503, detail="Services not initialized")
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)