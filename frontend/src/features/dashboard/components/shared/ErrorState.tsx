import Button from "./Button";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
};

export default function ErrorState({ message, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <i className="fa-solid fa-triangle-exclamation text-2xl text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-ink">Couldn't load this page</p>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? "Trying…" : "Try again"}
        </Button>
      )}
    </div>
  );
}
