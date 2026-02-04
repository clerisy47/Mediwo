import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

load_dotenv()
api_keys = os.getenv("GOOGLE_API_KEY", "").split(",")
api_keys = [key.strip() for key in api_keys if key.strip()]

primary_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_keys[0])
fallback_models = [
    ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=key)
    for key in api_keys[1:]
]

llm = primary_model.with_fallbacks(fallback_models)

SYSTEM_PROMPT = (
    "You are 'Mediwo Assistant,' an intelligent preliminary medical intake tool. "
    "Your goal is to interview the patient before they see the doctor. "
    "Ask concise, one-at-a-time questions about their chief complaint, duration, "
    "severity, and relevant history. Be empathetic but professional. "
)

SUMMARY_PROMPT = (
    "You are a medical scribe. Based on the following conversation between a "
    "patient and an intake assistant, generate a professional 2-paragraph summary "
    "for a doctor. Focus on symptoms, timeline, and critical flags like allergies "
    "or prior treatments. Use a structured clinical tone."
)

def run_mediwo_chatbot():
    chat_history = [SystemMessage(content=SYSTEM_PROMPT)]
    print("--- Mediwo Terminal Intake (Type 'exit' to finish) ---")
    
    initial_msg = "Hello, I am your Mediwo Assistant. What brings you to the clinic today?"
    print(f"Assistant: {initial_msg}")
    chat_history.append(AIMessage(content=initial_msg))

    while True:
        user_input = input("Patient: ")
        
        if user_input.lower() in ['exit', 'done', 'quit']:
            break
            
        chat_history.append(HumanMessage(content=user_input))
        
        response = llm.invoke(chat_history)
        print(f"Assistant: {response.content}")
        chat_history.append(AIMessage(content=response.content))

    print("\n" + "-"*30)
    print("Generating Intelligent Clinical Summary...")
    print("-"*30 + "\n")
    
    conversation_text = "\n".join([f"{type(m).__name__}: {m.content}" for m in chat_history[1:]])
    
    summary_request = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=f"Summarize this conversation:\n\n{conversation_text}")
    ]
    
    summary_response = llm.invoke(summary_request)
    print(summary_response.content)

if __name__ == "__main__":
    run_mediwo_chatbot()