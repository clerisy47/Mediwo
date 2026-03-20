export function ProcessingIndicator() {
  return (
    <div className="processing-indicator" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <div>
        <p>AI processing in progress</p>
        <small>Re-processing all uploaded data to update your longitudinal summary.</small>
      </div>
    </div>
  );
}
