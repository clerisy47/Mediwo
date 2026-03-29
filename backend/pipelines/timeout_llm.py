"""
Timeout-aware LLM wrapper with API key fallback.
If a model call fails, retry with another randomly selected API key.
"""
import asyncio
import os
import random
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage
from dotenv import load_dotenv

load_dotenv()

# Timeout in seconds
TIMEOUT_SECONDS = 60


def get_api_keys() -> List[str]:
    """Load and parse API keys from environment"""
    api_keys = os.getenv("GOOGLE_API_KEY", "").split(",")
    api_keys = [key.strip() for key in api_keys if key.strip()]
    return api_keys


class TimeoutLLM:
    """LLM wrapper that implements timeout with fallback to alternative API keys."""
    
    def __init__(self, model_name: str = "gemini-2.5-flash", temperature: float = 0.7):
        self.model_name = model_name
        self.temperature = temperature
        self.api_keys = get_api_keys()
        
        if not self.api_keys:
            raise RuntimeError("GOOGLE_API_KEY is not configured.")
        
        self.current_key_index = 0
        self._create_model(random.randrange(len(self.api_keys)))
    
    def _create_model(self, key_index: int):
        """Create model with a specific API key index"""
        self.current_key_index = key_index
        current_key = self.api_keys[key_index]
        self.model = ChatGoogleGenerativeAI(
            model=self.model_name,
            temperature=self.temperature,
            google_api_key=current_key
        )
    
    async def _invoke_async(self, messages: List[BaseMessage], timeout: int = TIMEOUT_SECONDS):
        """Invoke model with timeout"""
        try:
            # LangChain doesn't have native async invoke, so we run in executor with timeout
            loop = asyncio.get_event_loop()
            result = await asyncio.wait_for(
                loop.run_in_executor(None, lambda: self.model.invoke(messages)),
                timeout=timeout
            )
            return result
        except asyncio.TimeoutError:
            raise TimeoutError(f"Model call timed out after {timeout} seconds")
    
    def invoke(self, messages: List[BaseMessage]) -> str:
        """
        Invoke model with timeout and fallback to next API key if timeout occurs.
        
        Args:
            messages: List of messages to send to the model
            
        Returns:
            Response content from the model
            
        Raises:
            RuntimeError: If all API keys fail
        """
        key_indexes = list(range(len(self.api_keys)))
        random.shuffle(key_indexes)
        max_attempts = len(key_indexes)

        for attempt, key_index in enumerate(key_indexes, start=1):
            self._create_model(key_index)

            try:
                print(f"\n[LLM Call] Using random API key #{self.current_key_index + 1}/{len(self.api_keys)}")
                
                # Try to run with timeout
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    result = loop.run_until_complete(
                        self._invoke_async(messages, timeout=TIMEOUT_SECONDS)
                    )
                    return result.content
                finally:
                    loop.close()
                    
            except TimeoutError:
                print(f"[TIMEOUT] API key #{self.current_key_index + 1} timed out after {TIMEOUT_SECONDS}s")

                if attempt >= max_attempts:
                    raise RuntimeError(
                        f"All {max_attempts} API keys timed out after {TIMEOUT_SECONDS}s each"
                    )
                print("[FALLBACK] Retrying with another random API key")
            
            except Exception as e:
                print(f"[ERROR] API key #{self.current_key_index + 1} failed: {str(e)}")

                if attempt >= max_attempts:
                    raise RuntimeError(
                        f"All {max_attempts} API keys failed. Last error: {str(e)}"
                    )
                print("[FALLBACK] Retrying with another random API key")
        
        raise RuntimeError("Failed to get response from any API key")


# Global instance
_timeout_llm = None


def get_timeout_llm(temperature: float = 0.7) -> TimeoutLLM:
    """Get or create the global TimeoutLLM instance"""
    global _timeout_llm
    
    # Create fresh instance each time to avoid stale state
    _timeout_llm = TimeoutLLM(model_name="gemini-2.5-flash", temperature=temperature)
    return _timeout_llm
