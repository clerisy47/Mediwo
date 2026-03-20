import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

load_dotenv()
api_keys = os.getenv("GOOGLE_API_KEY", "").split(",")
api_keys = [key.strip() for key in api_keys if key.strip()]

llm = None

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


def _get_llm():
    global llm

    if llm is not None:
        return llm

    if not api_keys:
        raise RuntimeError("GOOGLE_API_KEY is not configured.")

    primary_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_keys[0])
    fallback_models = [
        ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=key)
        for key in api_keys[1:]
    ]

    llm = primary_model.with_fallbacks(fallback_models)
    return llm


def get_initial_message():
    return "Hello, I am your Mediwo Assistant. What brings you to the clinic today?"


def generate_assistant_reply(conversation):
    chat_history = [SystemMessage(content=SYSTEM_PROMPT)]

    for item in conversation:
        role = item.get("role")
        message = item.get("message", "")

        if role == "patient":
            chat_history.append(HumanMessage(content=message))
        else:
            chat_history.append(AIMessage(content=message))

    response = _get_llm().invoke(chat_history)
    return response.content


def generate_intake_summary(conversation):
    conversation_text = "\n".join(
        [f"{item.get('role', 'unknown').title()}: {item.get('message', '')}" for item in conversation]
    )

    summary_request = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=f"Summarize this conversation:\n\n{conversation_text}"),
    ]

    summary_response = _get_llm().invoke(summary_request)
    return summary_response.content

def run_mediwo_chatbot():
    print("--- Mediwo Terminal Intake (Type 'exit' to finish) ---")

    conversation = []
    initial_msg = get_initial_message()
    print(f"Assistant: {initial_msg}")
    conversation.append({"role": "ai", "message": initial_msg})

    while True:
        user_input = input("Patient: ")

        if user_input.lower() in ['exit', 'done', 'quit']:
            break

        conversation.append({"role": "patient", "message": user_input})
        assistant_reply = generate_assistant_reply(conversation)
        print(f"Assistant: {assistant_reply}")
        conversation.append({"role": "ai", "message": assistant_reply})

    print("\n" + "-"*30)
    print("Generating Intelligent Clinical Summary...")
    print("-"*30 + "\n")

    print(generate_intake_summary(conversation))

if __name__ == "__main__":
    run_mediwo_chatbot()