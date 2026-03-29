import os
from dotenv import load_dotenv
from langchain_community.document_loaders import UnstructuredPDFLoader
from .timeout_llm import get_timeout_llm

load_dotenv()


def _get_llm():
    """Get the timeout-aware LLM with fallback API keys"""
    return get_timeout_llm(temperature=0)

def summarize_with_ocr(file_path):
    loader = UnstructuredPDFLoader(
        file_path,
        strategy="hi_res",  # Detects layouts/tables
        mode="elements"     # Keeps table structure intact
    )
    docs = loader.load()

    # Get the timeout-aware LLM with fallback
    timeout_llm = _get_llm()
    
    # Build the document content
    full_text = "\n".join([doc.page_content for doc in docs])
    
    # Create the messages for the LLM
    from langchain_core.messages import HumanMessage, SystemMessage
    messages = [
        SystemMessage(content=
            "You are an expert analyst. Summarize the following document. "
            "Pay special attention to the data and relationships in any tables provided.\n\n"
            "No need to mention 'as an AI model' or similar phrases. "
            "No need to mention any details about the user personal information, only show medical information and date of report if mentioned."
        ),
        HumanMessage(content=f"DOCUMENT CONTENT:\n{full_text}")
    ]
    
    print("Generating summary...")
    summary = timeout_llm.invoke(messages)
    
    return summary

if __name__ == "__main__":
    path = "test.pdf" # Put your PDF path here
    if os.path.exists(path):
        result = summarize_with_ocr(path)
        print("\n--- SUMMARY ---\n", result)
    else:
        print("Error: File not found.")