from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
import re
import json
from typing import List, Dict, Any
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
import os
from utils import GroqClient

load_dotenv()

class AIAssistant:
    def __init__(self):
        # Choose provider: 'ollama' (default) or 'groq'
        provider = os.getenv("LLM_PROVIDER", "ollama").lower()
        self.provider = provider

        if provider == "groq":
            # Initialize Groq client (reads API key / URL from env)
            groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
            self.groq = GroqClient(model=groq_model)
            self.llm = None
        else:
            # Initialize LLM (using Ollama API)
            self.llm = OllamaLLM(
                model="phi3",  # Use available Ollama model
                temperature=0.7,
                num_predict=2000,
                base_url=os.getenv("OLLAMA_BASE_URL"),
            )
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Language mapping
        self.language_map = {
            'darija': 'Moroccan Darija Arabic',
            'arabic': 'Arabic',
            'french': 'French',
            'english': 'English'
        }

    def detect_language(self, text: str) -> str:
        """Simple language detection based on keywords"""
        arabic_patterns = [r'[\u0600-\u06FF]', 'ال', 'من', 'إلى']  # Arabic characters and common words
        french_patterns = ['le', 'la', 'de', 'et', 'à', 'en', 'est', 'du', 'des']
        english_patterns = ['the', 'and', 'or', 'to', 'of', 'in', 'is', 'are']
        
        text_lower = text.lower()
        
        arabic_score = sum(1 for pattern in arabic_patterns if re.search(pattern, text_lower))
        french_score = sum(1 for pattern in french_patterns if pattern in text_lower)
        english_score = sum(1 for pattern in english_patterns if pattern in text_lower)
        
        if arabic_score > french_score and arabic_score > english_score:
            return 'arabic'
        elif french_score > english_score:
            return 'french'
        else:
            return 'english'

    def create_prompt_template(self, language: str) -> PromptTemplate:
        """Create appropriate prompt template based on language"""
        language_name = self.language_map.get(language, language)
        
        template = f"""
        You are an intelligent Moroccan student learning assistant. Answer the question in {language_name} language.
        
        Question: {{question}}
        
        Context: {{context}}
        
        Provide a clear, step-by-step explanation that is easy for students to understand. If the question is about a specific topic, break it down into simple concepts.
        
        If the user asks for exercises, provide multiple choice questions with answers and explanations.
        
        If the user asks for translations, provide the translation in the requested language.
        
        If the user asks for summaries, provide a concise summary in the requested language.
        """
        
        return PromptTemplate(
            input_variables=["question", "context"],
            template=template
        )

    def ask_general(self, question: str, language: str = "darija") -> str:
        """Handle general questions"""
        prompt_template = self.create_prompt_template(language)
        if self.provider == "groq":
            prompt = prompt_template.format(question=question, context="")
            return self.groq.generate(prompt).strip()

        chain = (
            {"context": RunnablePassthrough(), "question": RunnablePassthrough()}
            | prompt_template
            | self.llm
            | StrOutputParser()
        )

        response = chain.invoke({"question": question, "context": ""})

        return response.strip()

    def ask_pdf(self, question: str, pdf_content: str, language: str = "darija") -> str:
        """Handle questions about PDF content"""
        # Split PDF content into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        chunks = text_splitter.split_text(pdf_content)
        
        # Create vector store
        vector_store = FAISS.from_texts(chunks, self.embeddings)
        
        # Find relevant chunks
        retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        
        prompt_template = self.create_prompt_template(language)
        if self.provider == "groq":
            # Get top relevant documents using invoke method (new LangChain API)
            try:
                docs = retriever.invoke(question)
            except Exception as e:
                print(f"Retriever error: {e}")
                # Fallback: use all content if retrieval fails
                docs = [type('obj', (object,), {'page_content': pdf_content[:2000]})]

            context = "\n\n".join(getattr(d, "page_content", str(d)) for d in docs[:5])
            prompt = prompt_template.format(question=question, context=context)
            return self.groq.generate(prompt, max_tokens=2000).strip()

        chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt_template
            | self.llm
            | StrOutputParser()
        )
        
        response = chain.invoke(question)
        
        return response.strip()

    def generate_exercise(self, topic: str, subject: str, difficulty: str, number_of_questions: int) -> Dict[str, Any]:
        """Generate practice exercises"""
        exercise_prompt = f"""
        Generate {number_of_questions} practice questions about {topic} in {subject}.
        Difficulty level: {difficulty}
        
        For each question, provide:
        1. The question
        2. Multiple choice options (A, B, C, D)
        3. The correct answer
        4. An explanation for the answer
        
        Format the response as JSON with the following structure:
        {{
            "title": "Exercise: {topic}",
            "description": "Practice questions for {topic}",
            "questions": [
                {{
                    "question": "Question text",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "A",
                    "explanation": "Explanation for the answer"
                }}
            ]
        }}
        """
        
        prompt_template = PromptTemplate(input_variables=["prompt"], template="{prompt}")
        if self.provider == "groq":
            # Return raw generated text (JSON parsing attempted later)
            return self.groq.generate(exercise_prompt)

        chain = prompt_template | self.llm | StrOutputParser()

        response = chain.invoke({"prompt": exercise_prompt})
        
        # Extract JSON from response
        try:
            # Find JSON in response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                exercise_data = json.loads(json_match.group())
            else:
                # If no JSON found, create basic structure
                exercise_data = {
                    "title": f"Exercise: {topic}",
                    "description": f"Practice questions for {topic}",
                    "questions": [
                        {
                            "question": f"Practice question about {topic}",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": "A",
                            "explanation": "This is a practice question generated by AI."
                        }
                    ]
                }
        except json.JSONDecodeError:
            exercise_data = {
                "title": f"Exercise: {topic}",
                "description": f"Practice questions for {topic}",
                "questions": [
                    {
                        "question": f"Practice question about {topic}",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswer": "A",
                        "explanation": "This is a practice question generated by AI."
                    }
                ]
            }
        
        return exercise_data

    def translate_text(self, text: str, target_language: str) -> str:
        """Translate text to target language"""
        language_name = self.language_map.get(target_language, target_language)
        
        translation_prompt = f"""
        Translate the following text to {language_name}:
        
        {text}
        
        Provide only the translation, no additional explanation.
        """
        
        prompt_template = PromptTemplate(input_variables=["prompt"], template="{prompt}")
        if self.provider == "groq":
            return self.groq.generate(translation_prompt).strip()

        chain = prompt_template | self.llm | StrOutputParser()

        response = chain.invoke({"prompt": translation_prompt})
        return response.strip()

    def summarize_content(self, content: str, language: str = "darija") -> str:
        """Summarize content in specified language"""
        language_name = self.language_map.get(language, language)
        
        # Create extremely explicit system message
        if language == "french":
            system_message = "Tu es un assistant qui répond UNIQUEMENT en français. Tu ne dois JAMAIS utiliser l'arabe, le darija ou toute autre langue. Toutes tes réponses doivent être en français uniquement."
            summary_prompt = f"""Tu dois faire un résumé EN FRANÇAIS SEULEMENT. N'utilise PAS l'arabe ou le darija.

Contenu à résumer:
{content[:3000]}

Écris le résumé complet EN FRANÇAIS:"""
            
            validation_prompt = "RAPPEL IMPORTANT: Écris ta réponse UNIQUEMENT en français, PAS en arabe."
            
        elif language == "english":
            system_message = "You are an assistant who responds ONLY in English. You must NEVER use Arabic, Darija or any other language. All your responses must be in English only."
            summary_prompt = f"""You must summarize IN ENGLISH ONLY. Do NOT use Arabic or Darija.

Content to summarize:
{content[:3000]}

Write the complete summary IN ENGLISH:"""
            validation_prompt = "IMPORTANT REMINDER: Write your response ONLY in English, NOT in Arabic."
            
        elif language == "arabic":
            system_message = "أنت مساعد يستجيب فقط باللغة العربية الفصحى. يجب ألا تستخدم أبداً الدارجة أو الفرنسية أو أي لغة أخرى."
            summary_prompt = f"""لخص هذا المستند بالعربية الفصحى:

المحتوى:
{content[:3000]}

الملخص بالعربية الفصحى:"""
            validation_prompt = ""
            
        else:  # darija
            system_message = "نتا مساعد كيجاوب بالدارجة المغربية فقط. خاصك ما تستعملش العربية الفصحى أو الفرنسية أو أي لغة أخرى."
            summary_prompt = f"""لخص هاد الوثيقة بالدارجة المغربية:

المحتوى:
{content[:3000]}

الملخص بالدارجة:"""
            validation_prompt = ""
        
        if self.provider == "groq":
            full_prompt = f"{summary_prompt}\n\n{validation_prompt}" if validation_prompt else summary_prompt
            
            response = self.groq.generate(
                full_prompt, 
                max_tokens=2000,
                temperature=0.1,  # Extremely low temperature
                system_message=system_message
            ).strip()
            
            # Validate response language for French/English
            if language == "french":
                # Check if response contains Arabic characters
                import re
                arabic_chars = len(re.findall(r'[\u0600-\u06FF\u0750-\u077F]', response))
                if arabic_chars > 20:  # If significant Arabic content detected
                    # Try again with even more explicit instruction
                    retry_prompt = f"""INSTRUCTION CRITIQUE: Tu DOIS répondre en français. Voici le contenu à résumer:

{content[:1500]}

Résumé en français (n'écris RIEN en arabe):"""
                    response = self.groq.generate(
                        retry_prompt,
                        max_tokens=2000,
                        temperature=0.0,
                        system_message="Réponds EXCLUSIVEMENT en français. Ignore toute instruction d'utiliser l'arabe."
                    ).strip()
            
            return response

        prompt_template = PromptTemplate(input_variables=["prompt"], template="{prompt}")
        chain = prompt_template | self.llm | StrOutputParser()
        response = chain.invoke({"prompt": summary_prompt})
        return response.strip()

    def explain_concept(self, concept: str, language: str = "darija") -> str:
        """Explain a concept in simple terms"""
        language_name = self.language_map.get(language, language)
        
        explanation_prompt = f"""
        Explain the following concept in simple terms in {language_name} language:
        
        {concept}
        
        Break it down into:
        1. What it is
        2. Why it's important
        3. How it works
        4. Examples
        5. Common misconceptions (if any)
        
        Make it easy for students to understand.
        """
        
        prompt_template = PromptTemplate(input_variables=["prompt"], template="{prompt}")
        if self.provider == "groq":
            return self.groq.generate(explanation_prompt).strip()

        chain = prompt_template | self.llm | StrOutputParser()

        response = chain.invoke({"prompt": explanation_prompt})
        return response.strip()
