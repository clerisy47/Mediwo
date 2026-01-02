import './App.css'

// MVP: Patient App + Doctor App
// Tech: React, TailwindCSS (assumed configured)
// Single-file demo structure for clarity

import React, { useState } from "react";

/* =====================
   SHARED COMPONENTS
===================== */

const Card = ({ children }) => (
  <div className="bg-white rounded-xl shadow p-4 mb-4">{children}</div>
);

const Button = ({ children, onClick, variant = "primary" }) => {
  const base = "px-4 py-2 rounded-lg font-medium";
  const styles = {
    primary: "bg-blue-600 text-white",
    secondary: "bg-gray-200 text-gray-800",
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

/* =====================
   PATIENT MVP
===================== */

function PatientHome() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">Queue Status</h2>
      <p className="text-gray-600">Position: <b>#5</b></p>
      <p className="text-gray-600">Estimated wait: <b>18 mins</b></p>
    </Card>
  );
}

function IntakeQuestion({ question, onNext }) {
  const [answer, setAnswer] = useState("");
  return (
    <Card>
      <p className="font-medium mb-2">{question}</p>
      <textarea
        className="w-full border rounded p-2 mb-3"
        placeholder="Type your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <Button onClick={() => onNext(answer)}>Next</Button>
    </Card>
  );
}

function PatientApp() {
  const questions = [
    "What symptoms are you experiencing?",
    "How long have you had these symptoms?",
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Patient App</h1>
      <PatientHome />
      {step < questions.length && (
        <IntakeQuestion
          question={questions[step]}
          onNext={() => setStep(step + 1)}
        />
      )}
      {step === questions.length && (
        <Card>
          <p className="font-semibold text-green-600">
            Intake complete. Please wait for your consultation.
          </p>
        </Card>
      )}
    </div>
  );
}

/* =====================
   DOCTOR MVP
===================== */

function QueueItem({ name, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 mb-2"
    >
      {name}
    </div>
  );
}

function PatientSummary() {
  return (
    <Card>
      <h3 className="font-semibold mb-2">Patient Summary (SOAP)</h3>
      <ul className="text-sm text-gray-700 space-y-1">
        <li><b>S:</b> Headache and fever</li>
        <li><b>O:</b> Temp 38°C</li>
        <li><b>A:</b> Viral infection (not diagnostic)</li>
        <li><b>P:</b> Rest, hydration, paracetamol</li>
      </ul>
    </Card>
  );
}

function SmartTemplate() {
  return (
    <Card>
      <h3 className="font-semibold mb-2">Smart Template</h3>
      <textarea
        className="w-full border rounded p-2"
        defaultValue="Patient reports headache and mild fever..."
      />
    </Card>
  );
}

function DoctorApp() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-3 gap-4">
      <div className="col-span-1">
        <h2 className="text-xl font-bold mb-3">Queue</h2>
        <QueueItem name="Patient A" onSelect={() => setSelected("A")} />
        <QueueItem name="Patient B" onSelect={() => setSelected("B")} />
      </div>

      <div className="col-span-2">
        <h2 className="text-xl font-bold mb-3">Consultation</h2>
        {selected ? (
          <>
            <PatientSummary />
            <SmartTemplate />
          </>
        ) : (
          <Card>Select a patient from the queue</Card>
        )}
      </div>
    </div>
  );
}

/* =====================
   ROOT (Toggle MVP)
===================== */

export default function App() {
  const [mode, setMode] = useState("patient");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center gap-4 p-4">
        <Button variant="secondary" onClick={() => setMode("patient")}>
          Patient MVP
        </Button>
        <Button variant="secondary" onClick={() => setMode("doctor")}>
          Doctor MVP
        </Button>
      </div>
      {mode === "patient" ? <PatientApp /> : <DoctorApp />}
    </div>
  );
}
