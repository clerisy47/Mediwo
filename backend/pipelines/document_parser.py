import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.document_loaders import UnstructuredFileLoader, UnstructuredPDFLoader
from PIL import Image
from pypdf import PdfReader

try:
    import pytesseract
except ModuleNotFoundError:
    from unstructured_pytesseract import image_to_string as _image_to_string

    class _PytesseractFallback:
        @staticmethod
        def image_to_string(image):
            return _image_to_string(image)

    pytesseract = _PytesseractFallback()

from langchain_ollama import ChatOllama
from .llm_invoker import get_timeout_llm

load_dotenv()


def _get_llm():
    """Get the Ollama LLM."""
    model_name = os.getenv("OLLAMA_MODEL", "mistral-nemo")
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    return ChatOllama(
        model=model_name,
        temperature=0,
        base_url=base_url,
    )


def _extract_text_from_image(file_path):
    with Image.open(file_path) as image:
        return pytesseract.image_to_string(image)


def _extract_text_from_pdf(file_path):
    loader = UnstructuredPDFLoader(
        file_path,
        strategy="hi_res",  # Detects layouts/tables and OCRs scanned pages when needed
        mode="elements"     # Keeps table structure intact
    )
    docs = loader.load()
    full_text = "\n".join([doc.page_content for doc in docs]).strip()

    if full_text:
        return full_text

    reader = PdfReader(file_path)

    extracted_text = []
    for page in reader.pages:
        text = (page.extract_text() or "").strip()
        if text:
            extracted_text.append(text)

    return "\n\n".join(extracted_text)


def _extract_text_from_document(file_path):
    suffix = Path(file_path).suffix.lower()

    if suffix in {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp"}:
        return _extract_text_from_image(file_path)

    if suffix == ".pdf":
        return _extract_text_from_pdf(file_path)

    loader = UnstructuredFileLoader(file_path)
    docs = loader.load()
    return "\n".join([doc.page_content for doc in docs]).strip()


def summarize_with_ocr(file_path):
    # Get the LLM with timeout
    timeout_llm = get_timeout_llm(temperature=0)
    
    # Build the document content from OCR/text extraction before sending it to the LLM
    full_text = _extract_text_from_document(file_path)

    if not full_text.strip():
        raise RuntimeError("No text could be extracted from the uploaded file.")
    
    # Create the messages for the LLM
    from langchain_core.messages import HumanMessage, SystemMessage
    messages = [
        SystemMessage(content=
            "You are an expert medical analyst. Summarize the following document in Markdown only. "
            "Use clear section headers, bold key labels, and markdown tables where tabular data is present. "
            "Prefer concise clinical language and preserve important values, dates, and trends.\n\n"
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