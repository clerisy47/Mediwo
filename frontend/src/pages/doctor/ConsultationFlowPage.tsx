import { useMemo, useState } from 'react';
import { InlineHints } from '../../components/doctor/InlineHints';
import { RichTextEditor } from '../../components/doctor/RichTextEditor';
import { SuggestionDropdown } from '../../components/doctor/SuggestionDropdown';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MarkdownText } from '../../components/ui/MarkdownText';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';
import { StepIndicator } from '../../components/ui/StepIndicator';
import {
  aiClinicalSummary,
  aiSuggestions,
  historyBullets,
  intakeSymptoms,
  sampleReports,
} from '../../data/mockData';
import type { AsyncState } from '../../types/models';

const flowSteps = [
  'Patient Overview + AI Summary',
  'Smart Documentation Editor',
  'Finalize Consultation',
];

export function ConsultationFlowPage() {
  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState('');
  const [acceptedHints, setAcceptedHints] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<AsyncState>('empty');

  const appendSuggestion = (text: string) => {
    if (acceptedHints.includes(text)) {
      return;
    }

    setAcceptedHints((prev) => [...prev, text]);
    setNotes((prev) => `${prev}${prev ? '\n' : ''}- ${text}`);
  };

  const ignoreSuggestion = () => {
    return;
  };

  const notesWordCount = useMemo(() => {
    return notes.trim() ? notes.trim().split(/\s+/).length : 0;
  }, [notes]);

  const saveConsultation = () => {
    setSaveState('processing');

    window.setTimeout(() => {
      setSaveState('success');
    }, 1000);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Consultation Flow"
        description="Fixed step-based workflow for consistency, speed, and structured clinical records."
      />

      <StepIndicator steps={flowSteps} activeStep={step} />

      {step === 1 && (
        <section className="consultation-grid">
          <Card title="Patient Overview" subtitle="Intake and longitudinal context">
            <div className="overview-block">
              <h4>Patient Info</h4>
              <p>Aarav Singh · 41 years · Token A-19</p>
            </div>

            <div className="overview-block">
              <h4>Symptoms (from intake)</h4>
              <ul>
                {intakeSymptoms.map((symptom) => (
                  <li key={symptom}>{symptom}</li>
                ))}
              </ul>
            </div>

            <div className="overview-block">
              <h4>History</h4>
              <ul>
                {historyBullets.map((history) => (
                  <li key={history}>{history}</li>
                ))}
              </ul>
            </div>

            <div className="overview-block">
              <h4>Uploaded Reports</h4>
              <ul>
                {sampleReports.map((report) => (
                  <li key={report.id}>{report.name}</li>
                ))}
              </ul>
            </div>
          </Card>

          <Card title="AI Generated Clinical Summary" subtitle="Read-only clinical context">
            <Badge tone="info">Read-only</Badge>
            <MarkdownText content={aiClinicalSummary.join('\n\n')} className="clinical-paragraph" />
            <Button onClick={() => setStep(2)}>Next → Proceed to Documentation</Button>
          </Card>
        </section>
      )}

      {step === 2 && (
        <section className="editor-layout">
          <Card title="Smart Documentation Editor" subtitle="Accept, ignore, or manually edit AI suggestions">
            <RichTextEditor value={notes} onChange={setNotes} />
            <p className="muted-text">Word count: {notesWordCount}</p>
            <InlineHints acceptedHints={acceptedHints} />
          </Card>

          <section className="suggestions-panel">
            <SuggestionDropdown
              title="Symptoms"
              suggestions={aiSuggestions.symptoms}
              onAccept={appendSuggestion}
              onIgnore={ignoreSuggestion}
            />
            <SuggestionDropdown
              title="Diagnoses"
              suggestions={aiSuggestions.diagnoses}
              onAccept={appendSuggestion}
              onIgnore={ignoreSuggestion}
            />
            <SuggestionDropdown
              title="Prescriptions"
              suggestions={aiSuggestions.prescriptions}
              onAccept={appendSuggestion}
              onIgnore={ignoreSuggestion}
            />
          </section>

          <div className="step-actions">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back to Overview
            </Button>
            <Button onClick={() => setStep(3)}>Next → Finalize Consultation</Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="page-stack">
          <Card title="Finalize Consultation" subtitle="Save notes and complete this encounter">
            <p className="muted-text">
              Review complete notes and ensure diagnosis and prescription sections are finalized.
            </p>
            {notes.trim() ? (
              <MarkdownText content={notes} className="final-notes-preview" />
            ) : (
              <div className="final-notes-preview empty">No documentation added yet.</div>
            )}
            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back to Editor
              </Button>
              <Button variant="success" onClick={saveConsultation}>
                Save Notes
              </Button>
              <Button onClick={saveConsultation}>Complete Consultation</Button>
            </div>
          </Card>

          {saveState === 'processing' && <StateView state="processing" />}
          {saveState === 'success' && (
            <StateView
              state="success"
              title="Consultation completed"
              description="Clinical notes saved and OPD queue has moved to the next patient."
            />
          )}
        </section>
      )}
    </div>
  );
}
