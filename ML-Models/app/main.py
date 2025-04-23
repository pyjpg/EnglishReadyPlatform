from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from . import schemas
from .database import engine, get_db
from .models.submission import Submission
import nltk  # Keep NLTK for other services
from nltk.tokenize import sent_tokenize
from .services.lexical_service import LexicalService
from .services.taskachievement_service import TaskAchievementService
from .services.CoherenceCohensionService import CoherenceCohesionService
from .services.grammar_service import GrammarService  # New grammar service
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download NLTK data
try:
    nltk.download('punkt', quiet=True)
except Exception as e:
    logger.error(f"Failed to download NLTK punkt: {e}")

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Initialize services
grammar_service = None
lexical_service = None
coherence_service = None    
taskachievement_service = None

@app.on_event("startup")
async def startup_event():
    global grammar_service, lexical_service, taskachievement_service, coherence_service
    try:
        grammar_service = GrammarService()  # Using the new GrammarService implementation
        lexical_service = LexicalService()
        taskachievement_service = TaskAchievementService()
        coherence_service = CoherenceCohesionService()
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
        # Create new submission with updated fields
        db_submission = Submission(
            text=submission.text,
            task_type=submission.task_type,
            question_number=submission.question_number,
            question_desc=submission.question_desc,
            question_requirements=submission.question_requirements
        )
        
        # Analyze all aspects
        raw_grammar_analysis = grammar_service.analyze_grammar(submission.text)
        grammar_score  = raw_grammar_analysis["score"]
        grammar_errors = raw_grammar_analysis.get("errors", []) 
        # Create sentences from text for analysis if not available
        sentences = sent_tokenize(submission.text) if hasattr(nltk, 'sent_tokenize') else [submission.text]
        
        # Convert raw grammar analysis to the format expected by the schema
        grammar_analysis = {
            'overall_score': raw_grammar_analysis['score'],
            'raw_score': raw_grammar_analysis.get('weighted_error_rate', 0),
            'feedback': raw_grammar_analysis['feedback'],
            # Create sentence analysis structure compatible with the expected format
            'sentence_analysis': [],
            # Include the new data fields
            'error_details':   grammar_errors,
            'error_categories': raw_grammar_analysis.get('error_categories', {}),
            'error_rate':       raw_grammar_analysis.get('error_rate', 0),
        }
        
        # Generate sentence analysis from either errors or tokenized sentences
        if grammar_errors: 
            # Use errors to create sentence analysis
            grammar_analysis['sentence_analysis'] = [
                {
                    'sentence': error['context'],
                    'score': max(0.0, 1.0 - (0.2 * (i + 1)))  # Simulated scores decreasing by severity
                } for i, error in enumerate(raw_grammar_analysis.get('errors', []))
            ]
        else:
            # Use tokenized sentences with a standard score
            grammar_analysis['sentence_analysis'] = [
                {
                    'sentence': sentence,
                    'score': raw_grammar_analysis['score'] / 9.0  # Normalize to 0-1 range
                } for sentence in sentences
            ]
        
        lexical_analysis = lexical_service.analyze_lexical(submission.text)
        task_analysis = taskachievement_service.analyze_submission(submission)
        coherence_analysis = coherence_service.analyze_coherence_cohesion(submission.text)
        
        # Calculate IELTS scores (1-9 scale)
        weights = {
            'grammar': 0.25,
            'lexical': 0.25,
            'task_achievement': 0.25,
            'coherence': 0.25
        }

        ielts_score = (
            grammar_analysis['overall_score'] * weights['grammar'] +
            lexical_analysis['overall_score'] * weights['lexical'] +
            task_analysis['ielts_score'] * weights['task_achievement'] +
            coherence_analysis['overall_score'] * weights['coherence']
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
        db_submission.coherence_score = coherence_analysis['overall_score']
        db_submission.coherence_feedback = coherence_analysis['feedback']
        db_submission.coherence_analysis = coherence_analysis

        # Save to DB
        db.add(db_submission)
        db.commit()
        db.refresh(db_submission)

        # Return structured response
        return {
            **db_submission.__dict__,
            'grammar_analysis': grammar_analysis,
            'lexical_analysis': lexical_analysis,
            'coherence_analysis': coherence_analysis,
            'task_achievement_analysis': task_analysis['task_achievement_analysis']
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing submission: {e}", exc_info=True)
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