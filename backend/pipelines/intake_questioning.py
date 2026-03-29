import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from .timeout_llm import get_timeout_llm

load_dotenv()

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
    """Get the timeout-aware LLM with fallback API keys"""
    return get_timeout_llm(temperature=0.7)


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

    try:
        response = _get_llm().invoke(chat_history)
        return response
    except Exception as e:
        raise RuntimeError(f"Failed to generate assistant reply: {str(e)}")


def generate_intake_summary(conversation):
    conversation_text = "\n".join(
        [f"{item.get('role', 'unknown').title()}: {item.get('message', '')}" for item in conversation]
    )

    summary_request = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=f"Summarize this conversation:\n\n{conversation_text}"),
    ]

    try:
        summary_response = _get_llm().invoke(summary_request)
        return summary_response
    except Exception as e:
        raise RuntimeError(f"Failed to generate intake summary: {str(e)}")

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