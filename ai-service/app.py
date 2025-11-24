from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from agent import AIAssistant
import asyncio

load_dotenv()

app = FastAPI(title="Taalim AI Agent", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Assistant
ai_assistant = AIAssistant()

class QuestionRequest(BaseModel):
    question: str
    language: str = "darija"
    userId: str = None

class PDFQuestionRequest(BaseModel):
    question: str
    pdfContent: str
    language: str = "darija"
    userId: str = None

class ExerciseRequest(BaseModel):
    topic: str
    subject: str
    difficulty: str = "medium"
    numberOfQuestions: int = 5
    userId: str = None

@app.get("/")
async def root():
    return {"message": "Taalim AI Agent is running"}

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    """Handle general questions"""
    try:
        response = ai_assistant.ask_general(request.question, request.language)
        return {"response": response}
    except Exception as e:
        print(f"An error occurred in /ask: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-pdf")
async def ask_pdf_question(request: PDFQuestionRequest):
    """Handle questions about specific PDF content"""
    try:
        response = ai_assistant.ask_pdf(request.question, request.pdfContent, request.language)
        return {"response": response}
    except Exception as e:
        print(f"An error occurred in /ask-pdf: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-exercise")
async def generate_exercise(request: ExerciseRequest):
    """Generate practice exercises"""
    try:
        exercise = ai_assistant.generate_exercise(
            request.topic,
            request.subject,
            request.difficulty,
            request.numberOfQuestions
        )
        return exercise
    except Exception as e:
        print(f"An error occurred in /generate-exercise: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate")
async def translate_text(request: QuestionRequest):
    """Translate text to specified language"""
    try:
        translation = ai_assistant.translate_text(request.question, request.language)
        return {"translation": translation}
    except Exception as e:
        print(f"An error occurred in /translate: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
async def summarize_text(request: PDFQuestionRequest):
    """Summarize PDF content"""
    try:
        summary = ai_assistant.summarize_content(request.pdfContent, request.language)
        return {"summary": summary}
    except Exception as e:
        print(f"An error occurred in /summarize: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)