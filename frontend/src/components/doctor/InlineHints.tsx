interface InlineHintsProps {
  acceptedHints: string[];
}

export function InlineHints({ acceptedHints }: InlineHintsProps) {
  if (acceptedHints.length === 0) {
    return <p className="muted-text">No AI hints accepted yet.</p>;
  }

  return (
    <section className="inline-hints" aria-label="Accepted AI hints">
      {acceptedHints.map((hint) => (
        <span key={hint} className="hint-chip">
          {hint}
        </span>
      ))}
    </section>
  );
}
