import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { FileList } from '../../components/patient/FileList';
import {
  FileUploader,
  type UploadedReportPayload,
} from '../../components/patient/FileUploader';
import { ProcessingIndicator } from '../../components/patient/ProcessingIndicator';
import { SummaryCard } from '../../components/patient/SummaryCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';
import { baseMedicalSummary } from '../../data/mockData';
import { parseDocument, saveMedicalReportsSummary, getMedicalReportsSummaries } from '../../services/backendApi';
import type { AsyncState, MedicalSummary, UploadedReport } from '../../types/models';

function buildSummaryFromReports(reports: UploadedReport[], narratives: string[]): MedicalSummary {
  const hasImaging = reports.some((report) => report.type === 'Imaging');
  const hasClinicalDocs = reports.some((report) => report.type === 'Clinical Document');
  const clinicalNarrative = narratives.join('\n\n');

  return {
    pastConditions: [
      'Mild asthma',
      ...(hasImaging ? ['Prior respiratory imaging available'] : []),
      ...(hasClinicalDocs ? ['Clinical follow-up documentation present'] : []),
    ],
    medications: ['Montelukast 10mg at night', 'Salbutamol inhaler as needed'],
    keyHistory: [
      `${reports.length} report(s) consolidated in longitudinal timeline`,
      'Family history of type-2 diabetes',
      'No known drug allergies documented',
    ],
    generatedAt: new Date().toISOString(),
    clinicalNarrative: clinicalNarrative || undefined,
  };
}

export function ProfilePage() {
  const [profileInfo, setProfileInfo] = useState(() => {
    const userStr = localStorage.getItem('user');
    const savedProfileStr = localStorage.getItem('patientProfile');

    const user = userStr ? JSON.parse(userStr) : null;
    const savedProfile = savedProfileStr ? JSON.parse(savedProfileStr) : null;

    return {
      name: savedProfile?.name ?? user?.full_name ?? user?.fullName ?? user?.name ?? 'Patient Name',
      age: savedProfile?.age ?? '31',
      gender: savedProfile?.gender ?? 'Male',
    };
  });
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [summary, setSummary] = useState<MedicalSummary>(baseMedicalSummary);
  const [summaryState, setSummaryState] = useState<AsyncState>('empty');
  const [narratives, setNarratives] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('patientProfile', JSON.stringify(profileInfo));
  }, [profileInfo]);

  // Load saved medical reports summaries on page load
  useEffect(() => {
    const loadSavedSummaries = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user?.id) return;

        const response = await getMedicalReportsSummaries(user.id);
        if (response.success && response.summaries.length > 0) {
          // Load the most recent summary
          const latest = response.summaries[0];
          const previousNarratives = response.summaries.map(s => s.summary);
          
          setNarratives(previousNarratives);
          setSummary(buildSummaryFromReports([], previousNarratives));
          setSummaryState('success');
        }
      } catch (error) {
        console.error('Failed to load saved summaries:', error);
      }
    };

    void loadSavedSummaries();
  }, []);

  const onUploadReports = async (uploaded: UploadedReportPayload[]) => {
    const containsInvalidFile = uploaded.some(({ report }) => /error|corrupt/i.test(report.name));

    if (containsInvalidFile) {
      setSummaryState('error');
      return;
    }

    setSummaryState('processing');

    try {
      const parsedFiles = await Promise.all(
        uploaded.map(async ({ report, file }) => {
          const parsed = await parseDocument(file);
          return { report, parsedSummary: parsed.summary };
        }),
      );

      const nextReports = [...parsedFiles.map((item) => item.report), ...reports];
      const nextNarratives = [...parsedFiles.map((item) => item.parsedSummary), ...narratives];

      setReports(nextReports);
      setNarratives(nextNarratives);
      setSummary(buildSummaryFromReports(nextReports, nextNarratives));
      setSummaryState('success');

      // Save the new summaries to the database
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.id) {
          // Save each new summary to database
          for (const narrative of parsedFiles.map((item) => item.parsedSummary)) {
            await saveMedicalReportsSummary(user.id, narrative);
          }
        }
      } catch (dbError) {
        console.error('Failed to save summaries to database:', dbError);
        // Don't fail the upload if database save fails
      }
    } catch {
      setSummaryState('error');
    }
  };

  const retrySummary = () => {
    if (reports.length === 0) {
      setSummaryState('empty');
      return;
    }

    setSummary(buildSummaryFromReports(reports, narratives));
    setSummaryState('success');
  };

  const summaryUpdatedLabel = useMemo(() => {
    if (summaryState !== 'success') {
      return undefined;
    }

    return `Summary refreshed at ${new Date(summary.generatedAt).toLocaleTimeString()}`;
  }, [summary.generatedAt, summaryState]);

  const onProfileFieldChange =
    (field: 'name' | 'age' | 'gender') => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const nextValue =
        field === 'age' ? event.target.value.replace(/[^\d]/g, '').slice(0, 3) : event.target.value;

      setProfileInfo((previous) => ({
        ...previous,
        [field]: nextValue,
      }));
    };

  return (
    <div className="page-stack">
      <PageHeader
        title="User Profile"
        description="Manage personal details, records, and your continuously updated medical summary."
      />

      <Card title="Personal Info">
        <div className="info-grid profile-info-form">
          <label>
            Name
            <input
              type="text"
              value={profileInfo.name}
              onChange={onProfileFieldChange('name')}
              placeholder="Enter your name"
            />
          </label>
          <label>
            Age
            <input
              type="text"
              inputMode="numeric"
              value={profileInfo.age}
              onChange={onProfileFieldChange('age')}
              placeholder="Enter age"
            />
          </label>
          <label>
            Gender
            <select value={profileInfo.gender} onChange={onProfileFieldChange('gender')}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
        </div>
      </Card>

      <Card title="Uploaded Medical Reports">
        <FileUploader onUpload={onUploadReports} disabled={summaryState === 'processing'} />
        <FileList files={reports} />
      </Card>

      {summaryState === 'empty' && (
        <StateView
          state="empty"
          title="No documents uploaded"
          description="Upload medical reports to auto-generate and maintain your clinical summary."
        />
      )}

      {summaryState === 'processing' && (
        <>
          <StateView state="processing" />
          <ProcessingIndicator />
        </>
      )}

      {summaryState === 'error' && (
        <StateView
          state="error"
          title="Summary processing failed"
          description="A document could not be parsed. Remove the file and retry processing."
          retryAction={retrySummary}
        />
      )}

      {summaryState === 'success' && <SummaryCard summary={summary} updateLabel={summaryUpdatedLabel} />}

      <div className="inline-actions">
        <Button variant="secondary" size="sm" onClick={retrySummary}>
          Re-process Summary
        </Button>
      </div>
    </div>
  );
}
