import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

api_keys = os.getenv("GOOGLE_API_KEY", "").split(",")
api_keys = [key.strip() for key in api_keys if key.strip()]

# Create primary model and fallback models
primary_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, google_api_key=api_keys[0])
fallback_models = [
    ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, google_api_key=key)
    for key in api_keys[1:]
]

llm = primary_model.with_fallbacks(fallback_models)

def summarize_with_ocr(file_path):
    loader = UnstructuredPDFLoader(
        file_path,
        strategy="hi_res",  # Detects layouts/tables
        mode="elements"     # Keeps table structure intact
    )
    docs = loader.load()

    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(
            "You are an expert analyst. Summarize the following document. "
            "Pay special attention to the data and relationships in any tables provided.\n\n"
            "No need to mention 'as an AI model' or similar phrases."
            "No need to mention any details about the user personal information, only show medical information and date of report if mentioned."
        ),
        HumanMessagePromptTemplate.from_template("DOCUMENT CONTENT:\n{text}"),
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    full_text = "\n".join([doc.page_content for doc in docs])
    print("📝 Generating summary...")
    summary = chain.invoke({"text": full_text})
    
    return summary

if __name__ == "__main__":
    path = "test.pdf" # Put your PDF path here
    if os.path.exists(path):
        result = summarize_with_ocr(path)
        print("\n--- SUMMARY ---\n", result)
    else:
        print("Error: File not found.")