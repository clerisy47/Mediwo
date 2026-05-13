"""
Timeout-aware LLM wrapper for the local Ollama model.
If a model call fails or times out, surface a clear runtime error.
"""
import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from typing import List
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage
from dotenv import load_dotenv

load_dotenv()

# Timeout in seconds
TIMEOUT_SECONDS = 60


def get_model_name() -> str:
    """Load the Ollama model name from the environment."""
    return os.getenv("OLLAMA_MODEL", "mistral-nemo")


def get_base_url() -> str:
    """Load the Ollama server URL from the environment."""
    return os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")


class TimeoutLLM:
    """LLM wrapper that implements timeout for a local Ollama chat model."""
    
    def __init__(self, model_name: str | None = None, temperature: float = 0.7):
        self.model_name = model_name or get_model_name()
        self.temperature = temperature
        self.base_url = get_base_url()
        self._create_model()

    def _create_model(self):
        """Create the Ollama chat model client."""
        self.model = ChatOllama(
            model=self.model_name,
            temperature=self.temperature,
            base_url=self.base_url,
        )
    
    def _invoke_with_timeout(self, messages: List[BaseMessage], timeout: int = TIMEOUT_SECONDS):
        """Invoke model with a hard timeout in a worker thread."""
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(self.model.invoke, messages)
            try:
                return future.result(timeout=timeout)
            except FuturesTimeoutError:
                future.cancel()
                raise TimeoutError(f"Model call timed out after {timeout} seconds")
    
    def invoke(self, messages: List[BaseMessage]) -> str:
        """
        Invoke model with timeout and raise a clear error on failure.
        
        Args:
            messages: List of messages to send to the model
            
        Returns:
            Response content from the model
        """
        try:
            print(f"\n[LLM Call] Using Ollama model {self.model_name} at {self.base_url}")
            result = self._invoke_with_timeout(messages, timeout=TIMEOUT_SECONDS)
            return result.content

        except TimeoutError:
            raise RuntimeError(
                f"Ollama model '{self.model_name}' timed out after {TIMEOUT_SECONDS} seconds"
            )

        except Exception as e:
            raise RuntimeError(
                f"Failed to generate a response from Ollama model '{self.model_name}' at {self.base_url}: {str(e)}"
            )


# Global instance
_timeout_llm = None


def get_timeout_llm(temperature: float = 0.7) -> TimeoutLLM:
    """Get or create the global TimeoutLLM instance."""
    global _timeout_llm
    
    # Create fresh instance each time to avoid stale state
    _timeout_llm = TimeoutLLM(temperature=temperature)
    return _timeout_llm
