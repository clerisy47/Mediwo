import type { AsyncState } from '../../types/models';

interface StateViewProps {
  state: AsyncState;
  title?: string;
  description?: string;
  retryAction?: () => void;
}

const defaults: Record<AsyncState, { title: string; description: string }> = {
  loading: {
    title: 'Loading data',
    description: 'Please wait while we fetch the latest details.',
  },
  processing: {
    title: 'Processing with AI',
    description: 'The system is analyzing uploaded records and refreshing insights.',
  },
  empty: {
    title: 'No data available yet',
    description: 'As new information arrives, it will appear here automatically.',
  },
  error: {
    title: 'Something went wrong',
    description: 'We could not load this section right now. Please retry.',
  },
  success: {
    title: 'Updated successfully',
    description: 'The latest details are now available.',
  },
};

export function StateView({ state, title, description, retryAction }: StateViewProps) {
  const resolvedTitle = title ?? defaults[state].title;
  const resolvedDescription = description ?? defaults[state].description;

  return (
    <section className={`state-view state-${state}`}>
      <div className="state-dot" aria-hidden="true" />
      <div>
        <h4>{resolvedTitle}</h4>
        <p>{resolvedDescription}</p>
      </div>
      {state === 'error' && retryAction && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={retryAction}>
          Retry
        </button>
      )}
    </section>
  );
}
