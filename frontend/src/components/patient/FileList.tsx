import type { UploadedReport } from '../../types/models';

interface FileListProps {
  files: UploadedReport[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return <p className="muted-text">No reports uploaded yet.</p>;
  }

  return (
    <ul className="file-list" aria-label="Uploaded files">
      {files.map((file) => (
        <li key={file.id}>
          <div>
            <p>{file.name}</p>
            <small>
              {file.type} · Uploaded on {file.uploadedAt}
            </small>
          </div>
          <button type="button" className="btn btn-ghost btn-sm">
            View
          </button>
        </li>
      ))}
    </ul>
  );
}
