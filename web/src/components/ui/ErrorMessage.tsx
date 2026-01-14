interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-red-900/20 border border-red-500 rounded-md p-3 ${className}`}>
      <p className="text-red-400">{message}</p>
    </div>
  );
}
