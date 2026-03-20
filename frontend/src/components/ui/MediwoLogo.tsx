interface MediwoLogoProps {
  compact?: boolean;
}

export function MediwoLogo({ compact = false }: MediwoLogoProps) {
  return (
    <span className="mediwo-logo" aria-label="Mediwo">
      <svg
        className="mediwo-logo-mark"
        viewBox="0 0 44 44"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="mediwoMarkGradient" x1="6" x2="38" y1="6" y2="38">
            <stop offset="0" stopColor="#0e7490" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="40" height="40" rx="12" fill="url(#mediwoMarkGradient)" />
        <path
          d="M10 29V14l6.6 10.1L22 14l5.4 10.1L34 14v15"
          fill="none"
          stroke="#e6fffb"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
      {!compact && (
        <span className="mediwo-logo-wordmark">
          <span>MEDI</span>
          <span>WO</span>
        </span>
      )}
    </span>
  );
}
