interface SuggestionDropdownProps {
  title: string;
  suggestions: string[];
  onAccept: (value: string) => void;
  onIgnore: (value: string) => void;
}

export function SuggestionDropdown({
  title,
  suggestions,
  onAccept,
  onIgnore,
}: SuggestionDropdownProps) {
  return (
    <section className="suggestion-dropdown">
      <h4>{title}</h4>
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion}>
            <p>{suggestion}</p>
            <div className="suggestion-actions">
              <button type="button" className="btn btn-success btn-sm" onClick={() => onAccept(suggestion)}>
                Accept
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onIgnore(suggestion)}>
                Ignore
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
