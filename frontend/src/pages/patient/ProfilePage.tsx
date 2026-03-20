import { useEffect, useMemo, useState } from 'react';
import { FileList } from '../../components/patient/FileList';
import { FileUploader } from '../../components/patient/FileUploader';
import { ProcessingIndicator } from '../../components/patient/ProcessingIndicator';
import { SummaryCard } from '../../components/patient/SummaryCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';
import { baseMedicalSummary } from '../../data/mockData';
import type { AsyncState, MedicalSummary, UploadedReport } from '../../types/models';

function buildSummaryFromReports(reports: UploadedReport[]): MedicalSummary {
  const hasImaging = reports.some((report) => report.type === 'Imaging');
  const hasClinicalDocs = reports.some((report) => report.type === 'Clinical Document');

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
  };
}

export function ProfilePage() {
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [summary, setSummary] = useState<MedicalSummary>(baseMedicalSummary);
  const [summaryState, setSummaryState] = useState<AsyncState>('empty');

  useEffect(() => {
    if (summaryState !== 'processing') {
      return;
    }

    const timer = window.setTimeout(() => {
      setSummary(buildSummaryFromReports(reports));
      setSummaryState('success');
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [reports, summaryState]);

  const onUploadReports = (uploaded: UploadedReport[]) => {
    const containsInvalidFile = uploaded.some((report) => /error|corrupt/i.test(report.name));

    if (containsInvalidFile) {
      setSummaryState('error');
      return;
    }

    setReports((prev) => [...uploaded, ...prev]);
    setSummaryState('processing');
  };

  const retrySummary = () => {
    if (reports.length === 0) {
      setSummaryState('empty');
      return;
    }

    setSummaryState('processing');
  };

  const summaryUpdatedLabel = useMemo(() => {
    if (summaryState !== 'success') {
      return undefined;
    }

    return `Summary refreshed at ${new Date(summary.generatedAt).toLocaleTimeString()}`;
  }, [summary.generatedAt, summaryState]);

  return (
    <div className="page-stack">
      <PageHeader
        title="User Profile"
        description="Manage personal details, records, and your continuously updated medical summary."
      />

      <Card title="Personal Info">
        <div className="info-grid">
          <p>
            <strong>Name:</strong> Utsav Acharya
          </p>
          <p>
            <strong>Age:</strong> 31
          </p>
          <p>
            <strong>Gender:</strong> Male
          </p>
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
