from dotenv import load_dotenv
import os
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()
api_keys = os.getenv("GOOGLE_API_KEY", "").split(",")
api_keys = [key.strip() for key in api_keys if key.strip()]


def initialize_llm(l):
    """Initialize LLM with fallback to multiple API keys."""
    for api_key in api_keys:
        try:
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
        except Exception as e:
            print(f"Failed to initialize with API key: {str(e)[:50]}...")
            continue
    raise RuntimeError("Failed to initialize LLM with any available API key")


def invoke_llm_with_fallback(llm, messages, api_keys):
    """Invoke LLM with fallback to next API key if current one fails."""
    try:
        return llm.invoke(messages)
    except Exception as e:
        print(f"API request failed: {str(e)[:50]}... Trying fallback API key...")
        # Try reinitializing with next available API key
        for api_key in api_keys:
            try:
                fallback_llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash", google_api_key=api_key
                )
                return fallback_llm.invoke(messages)
            except Exception:
                continue
        raise RuntimeError("All API keys exhausted, no response generated")

llm = initialize_llm(api_keys)
