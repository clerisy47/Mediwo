interface StepIndicatorProps {
  steps: string[];
  activeStep: number;
}

export function StepIndicator({ steps, activeStep }: StepIndicatorProps) {
  return (
    <ol className="step-indicator" aria-label="Consultation progress">
      {steps.map((step, index) => {
        const number = index + 1;
        const state = number < activeStep ? 'done' : number === activeStep ? 'active' : 'upcoming';

        return (
          <li key={step} className={`step-item step-${state}`}>
            <span className="step-index">{number}</span>
            <span className="step-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
