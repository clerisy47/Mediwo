import ReactMarkdown from 'react-markdown';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

export function MarkdownText({ content, className }: MarkdownTextProps) {
  if (!content.trim()) {
    return null;
  }

  const classes = ['markdown-content', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
