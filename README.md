# Clinic MVP - Patient and Doctor App

This repository contains the MVP for a **Patient and Doctor application** built with **React** and **TailwindCSS**. The MVP covers the core features needed for a clinical assistance platform with patient intake, queue management, and doctor consultation workspace.

---

## Folder Structure

```
frontend/              # React + Tailwind project
├── src/
│   ├── components/    # Shared UI components (Card, Button, etc.)
│   ├── patient/       # Patient pages and components
│   ├── doctor/        # Doctor pages and components
│   ├── App.jsx        # Root app with mode toggle (Patient/Doctor)
│   └── main.jsx       # React DOM render
├── index.html         # HTML entry
├── tailwind.config.js # Tailwind configuration
└── package.json       # Dependencies and scripts
```

---

## Features

### Patient App
- Queue status with position and estimated wait time
- Step-by-step intake questions (text input, adaptive flow)
- Intake completion confirmation

### Doctor App
- Live queue view
- Patient selection
- SOAP-style summary display
- Smart template editor for notes

### Shared Components
- Card
- Button
- Toasts / alerts

---

## Getting Started

### Prerequisites
- Node.js v18+ and npm
- TailwindCSS configured

### Installation

```bash
cd frontend
npm install
```

### Running the App

```bash
npm run dev
```
Open the provided local URL in your browser. You can toggle between **Patient MVP** and **Doctor MVP** using the top buttons.

## Ollama model

The backend uses a local Ollama model. By default the project is configured to use the `mistral-nemo` model. To override this, set the `OLLAMA_MODEL` environment variable (for example: `OLLAMA_MODEL=llama3.2:3b`).

---

## Next Steps / TODO
- Replace hardcoded data with mock API / backend endpoints
- Add document upload + OCR preview in Patient App
- Log clinician interactions for ML / RL integration
- Implement consent modal and privacy controls
- Split Patient and Doctor apps into separate routes or deployments
- Add AI autocomplete / smart suggestions with provenance

---

## Tech Stack
- React 18
- TailwindCSS 3
- Vite (optional, for dev server)

---

## License
MIT License