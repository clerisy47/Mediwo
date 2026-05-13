import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_ollama import ChatOllama

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
    "patient and an intake assistant, generate a professional Markdown summary "
    "for a doctor. Use a top-level heading, bold key clinical labels, bullet points, "
    "and a markdown table when you can condense symptoms, timeline, allergies, or prior treatments. "
    "Focus on symptoms, timeline, and critical flags like allergies or prior treatments. "
    "Use a structured clinical tone and return Markdown only."
)

DOCTOR_SUGGESTIONS_PROMPT = (
    "You are creating comprehensive clinical note entries for a doctor to document in patient medical records. "
    "Given a patient's medical report summary and intake conversation summary, "
    "generate 8-12 specific clinical recommendations covering: diagnostic tests/investigations, medications, procedures, referrals, lifestyle advice, and follow-up plans. "
    "Each entry should be written as if documenting what the doctor advised, prescribed, or ordered for the patient during consultation. "
    "Format entries to start with action verbs like: 'Patient advised to', 'Counseled patient on', 'Prescribed', 'Ordered', 'Referral to', 'Discussed', 'Educated patient on', 'Scheduled'. "
    "Include specific medications, test names, dosages where appropriate. "
    "Examples of good entries: "
    "'Prescribed Tab Metformin 500mg twice daily with meals for glycemic control' "
    "'Ordered ECG and troponin levels to evaluate for cardiac involvement' "
    "'Patient advised to practice stress management techniques such as meditation or yoga' "
    "'Counseled patient on family history risk factors for cardiovascular disease and need for monitoring' "
    "'Recommended dietary modifications including increase in omega-3 fatty acids and reduction in salt intake' "
    "'Referral to cardiology for further evaluation if symptoms persist beyond 2 weeks' "
    "'Ordered complete blood count and lipid panel to assess baseline metabolic status' "
    "'Prescribed Atorvastatin 20mg at bedtime for cholesterol management' "
    "'Patient educated on chest pain warning signs and advised to seek emergency care if severe symptoms develop' "
    "'Scheduled follow-up appointment in 2 weeks to review test results and adjust treatment plan'. "
    "Return ONLY a numbered list with each clinical note entry on its own line, like:\n"
    "1. Clinical note entry here\n"
    "2. Another clinical note entry here\n"
    "etc.\n"
    "Do not include any other text, headers, or explanations. Only the numbered list."
)


def _get_llm():
    """Get the Ollama LLM."""
    model_name = os.getenv("OLLAMA_MODEL", "mistral-nemo")
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    return ChatOllama(
        model=model_name,
        temperature=0.7,
        base_url=base_url,
    )


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
        return response.content
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
        return summary_response.content
    except Exception as e:
        raise RuntimeError(f"Failed to generate intake summary: {str(e)}")


def generate_doctor_suggestions(
    medical_reports_summary: str,
    conversation_summary: str,
) -> list:
    """Generate discrete doctor-facing suggestions from report and conversation summaries.
    Returns a list of individual suggestion strings."""
    report_text = (medical_reports_summary or "").strip()
    conversation_text = (conversation_summary or "").strip()

    if not report_text and not conversation_text:
        raise RuntimeError("Cannot generate suggestions without report or conversation summary")

    suggestion_request = [
        SystemMessage(content=DOCTOR_SUGGESTIONS_PROMPT),
        HumanMessage(
            content=(
                "Create suggestions from the following patient context.\n\n"
                f"Medical report summary:\n{report_text or 'Not available'}\n\n"
                f"Intake conversation summary:\n{conversation_text or 'Not available'}"
            )
        ),
    ]

    try:
        suggestion_response = _get_llm().invoke(suggestion_request)
        # Parse numbered list into individual suggestions
        suggestions = []
        for line in suggestion_response.content.strip().split('\n'):
            line = line.strip()
            if line and line[0].isdigit():  # Line starts with a number
                # Remove numbering (e.g., "1. " or "1) ")
                cleaned = line.split('.', 1)[-1].split(')', 1)[-1].strip()
                if cleaned:
                    suggestions.append(cleaned)
        return suggestions if suggestions else [suggestion_response.content]  # Fallback if parsing fails
    except Exception as e:
        raise RuntimeError(f"Failed to generate doctor suggestions: {str(e)}")

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