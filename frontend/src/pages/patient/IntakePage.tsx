import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

interface IntakeQuestion {
  prompt: string;
  options: string[];
}

interface ChatMessage {
  role: 'ai' | 'patient';
  message: string;
}

const questions: IntakeQuestion[] = [
  {
    prompt: 'What is the main symptom you want to discuss today?',
    options: ['Dry cough', 'Headache', 'Fever', 'Stomach discomfort'],
  },
  {
    prompt: 'How long have these symptoms been present?',
    options: ['1-2 days', '3-5 days', '1 week', 'More than 2 weeks'],
  },
  {
    prompt: 'How severe are your symptoms right now?',
    options: ['Mild', 'Moderate', 'Severe'],
  },
];

export function IntakePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      message: 'Hi, I am your intake assistant. I will ask a few questions to prepare your consultation.',
    },
    { role: 'ai', message: questions[0].prompt },
  ]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[questionIndex];

  const appendPatientResponse = (value: string) => {
    if (questionIndex === 2 && value === 'Severe') {
      setMessages((prev) => [
        ...prev,
        { role: 'patient', message: value },
        { role: 'ai', message: 'Do you currently have chest pain or shortness of breath?' },
      ]);
      setQuestionIndex(questions.length);
      return;
    }

    const nextIndex = questionIndex + 1;

    if (nextIndex >= questions.length) {
      setCompleted(true);
      setMessages((prev) => [
        ...prev,
        { role: 'patient', message: value },
        { role: 'ai', message: 'Thank you. Your pre-consultation intake is complete and shared with your doctor.' },
      ]);
      return;
    }

    setQuestionIndex(nextIndex);
    setMessages((prev) => [
      ...prev,
      { role: 'patient', message: value },
      { role: 'ai', message: questions[nextIndex].prompt },
    ]);
  };

  const submitText = () => {
    const value = textInput.trim();
    if (!value) {
      return;
    }
    setTextInput('');
    appendPatientResponse(value);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Pre-Consultation Intake"
        description="Answer AI-led adaptive questions to reduce consultation start time."
      />

      <Card className="chat-card">
        <div className="chat-thread">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-bubble ${message.role === 'ai' ? 'chat-ai' : 'chat-patient'}`}
            >
              {message.message}
            </div>
          ))}
        </div>

        {!completed && currentQuestion && (
          <div className="quick-options">
            {currentQuestion.options.map((option) => (
              <button
                type="button"
                key={option}
                className="btn btn-ghost btn-sm"
                onClick={() => appendPatientResponse(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {!completed && (
          <div className="chat-input-row">
            <input
              type="text"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Type your response"
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={submitText}>
              Send
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
