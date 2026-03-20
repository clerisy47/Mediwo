import { useRef } from 'react';
import type { UploadedReport } from '../../types/models';

export interface UploadedReportPayload {
  report: UploadedReport;
  file: File;
}

interface FileUploaderProps {
  onUpload: (files: UploadedReportPayload[]) => void;
  disabled?: boolean;
}

export function FileUploader({ onUpload, disabled = false }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;

    if (!selected || selected.length === 0) {
      return;
    }

    const nextFiles: UploadedReportPayload[] = Array.from(selected).map((file) => {
      const report: UploadedReport = {
        id: crypto.randomUUID(),
        name: file.name,
        uploadedAt: new Date().toISOString().slice(0, 10),
        type: file.type.includes('image') ? 'Imaging' : 'Clinical Document',
      };

      return { report, file };
    });

    onUpload(nextFiles);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <section className="file-uploader">
      <div>
        <h4>Upload Medical Reports</h4>
        <p>Add lab reports, scans, discharge summaries, or prescriptions.</p>
      </div>
      <label className={`upload-dropzone ${disabled ? 'upload-disabled' : ''}`.trim()}>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          multiple
          disabled={disabled}
          onChange={onFileChange}
        />
        <strong>Click to upload</strong>
        <span>PDF, JPG, PNG, DOC accepted</span>
      </label>
    </section>
  );
}
