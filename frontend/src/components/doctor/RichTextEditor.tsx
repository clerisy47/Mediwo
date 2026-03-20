interface RichTextEditorProps {
  value: string;
  onChange: (next: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <section className="rich-editor">
      <label htmlFor="doctor-notes">Consultation Notes</label>
      <textarea
        id="doctor-notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Document findings, assessment, and plan..."
      />
    </section>
  );
}
