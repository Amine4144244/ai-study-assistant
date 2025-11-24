import re
from typing import List, Dict, Any
import os
import requests


class GroqClient:
    """Simple Groq REST client wrapper.

    Notes:
    - Configure `GROQ_API_KEY` and `GROQ_API_URL` in environment variables.
    - Do NOT hard-code API keys in source. Keep keys out of git.
    - Payload/response parsing is intentionally permissive to support
      different Groq response shapes. Adjust according to your account.
    """
    def __init__(self, api_key: str | None = None, api_url: str | None = None, model: str | None = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.api_url = api_url or os.getenv("GROQ_API_URL")
        self.model = model or os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile"

        if not self.api_key or not self.api_url:
            raise ValueError("GROQ_API_KEY and GROQ_API_URL environment variables must be set to use GroqClient")

    def generate(self, prompt: str, max_tokens: int = 1024, temperature: float = 0.7, timeout: int = 60, system_message: str = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Use OpenAI-compatible format for Groq API
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        try:
            # Groq uses OpenAI-compatible endpoint
            api_endpoint = self.api_url
            if not api_endpoint.endswith('/chat/completions'):
                api_endpoint = api_endpoint.rstrip('/') + '/chat/completions'
            
            resp = requests.post(api_endpoint, json=payload, headers=headers, timeout=timeout)
            resp.raise_for_status()
            data = resp.json()

            # Extract from OpenAI-compatible response
            if isinstance(data, dict):
                if "choices" in data and len(data["choices"]) > 0:
                    choice = data["choices"][0]
                    if "message" in choice and "content" in choice["message"]:
                        return choice["message"]["content"].strip()
                    if "text" in choice:
                        return choice["text"].strip()
                
                # Fallback patterns
                if "output" in data and isinstance(data["output"], str):
                    return data["output"].strip()
                if "text" in data and isinstance(data["text"], str):
                    return data["text"].strip()

            # Fallback: return raw JSON string
            return str(data)
        except requests.exceptions.RequestException as e:
            # Network error - provide helpful fallback
            raise ConnectionError(f"Unable to connect to Groq API: {str(e)}. Please check your internet connection and API configuration.")

def clean_text(text: str) -> str:
    """Clean and preprocess text"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep Arabic, French, and English characters
    text = re.sub(r'[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF.,!?;:\-\'\"()]', ' ', text)
    return text.strip()

def detect_language_advanced(text: str) -> str:
    """Advanced language detection using character frequency"""
    arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    french_chars = len(re.findall(r'[a-zA-Z]', text))
    total_chars = len(re.findall(r'[a-zA-Z\u0600-\u06FF]', text))
    
    if total_chars == 0:
        return 'english'
    
    arabic_ratio = arabic_chars / total_chars
    
    if arabic_ratio > 0.3:
        return 'arabic'
    else:
        return 'french'  # Default to French for Moroccan context

def extract_key_terms(text: str) -> List[str]:
    """Extract key terms from text"""
    # Simple term extraction - in production, use NLP libraries
    words = re.findall(r'\b\w+\b', text.lower())
    # Remove common words
    common_words = {'le', 'la', 'de', 'et', 'à', 'en', 'est', 'du', 'des', 'les', 'un', 'une', 'dans', 'sur', 'pour', 'avec', 'par', 'qui', 'que', 'ce', 'cette', 'ces', 'il', 'elle', 'ils', 'elles', 'nous', 'vous', 'moi', 'toi', 'lui', 'leur', 'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'ceci', 'cela', 'celui', 'celle', 'ceux', 'celles', 'tout', 'toute', 'tous', 'toutes', 'chaque', 'chacun', 'chacune', 'aucun', 'aucune', 'personne', 'rien', 'jamais', 'toujours', 'souvent', 'parfois', 'rarement', 'maintenant', 'hier', 'demain', 'aujourd', 'ici', 'là', 'où', 'quand', 'comment', 'pourquoi', 'combien', 'quel', 'quelle', 'quels', 'quelles', 'quel', 'quelle', 'quels', 'quelles', 'quelque', 'quelques', 'autre', 'autres', 'même', 'mêmes', 'tel', 'telle', 'tels', 'telles', 'tellement', 'tellement', 'assez', 'très', 'plus', 'moins', 'autant', 'tant', 'si', 'aussi', 'ainsi', 'donc', 'alors', 'car', 'mais', 'ou', 'ni', 'donc', 'or', 'et', 'puis', 'ensuite', 'd\'abord', 'enfin', 'tout', 'tous', 'toutes', 'chacun', 'chacune', 'aucun', 'aucune', 'personne', 'rien', 'jamais', 'toujours', 'souvent', 'parfois', 'rarement', 'maintenant', 'hier', 'demain', 'aujourd', 'ici', 'là', 'où', 'quand', 'comment', 'pourquoi', 'combien', 'quel', 'quelle', 'quels', 'quelles', 'quel', 'quelle', 'quels', 'quelles', 'quelque', 'quelques', 'autre', 'autres', 'même', 'mêmes', 'tel', 'telle', 'tels', 'telles', 'tellement', 'tellement', 'assez', 'très', 'plus', 'moins', 'autant', 'tant', 'si', 'aussi', 'ainsi', 'donc', 'alors', 'car', 'mais', 'ou', 'ni', 'donc', 'or', 'et', 'puis', 'ensuite', 'd\'abord', 'enfin'}
    
    terms = [word for word in words if word not in common_words and len(word) > 2]
    return list(set(terms))[:20]  # Return top 20 unique terms

def format_response_for_frontend(response: str, language: str) -> Dict[str, Any]:
    """Format AI response for frontend display"""
    return {
        "response": response,
        "language": language,
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "type": "ai_response"
    }