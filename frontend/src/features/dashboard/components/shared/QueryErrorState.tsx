import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, isApiError, tokenStorage } from "../../api";
import { LOGIN_PATH } from "../../constants/paths";
import ErrorState from "./ErrorState";

type QueryErrorStateProps = {
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
};

/**
 * One error panel for any page that loads data:
 *  - 401 (missing / invalid / expired token): "log in again" button (retrying can't help)
 *  - anything else: the server's own message + Try again
 */
export default function QueryErrorState({ error, onRetry, isRetrying = false }: QueryErrorStateProps) {
  const qc = useQueryClient();
  const sessionProblem = isApiError(error) && error.status === 401;

  if (sessionProblem) {
    return (
      <ErrorState
  message="Your session is invalid or has expired. Please log in again."
  onRetry={() => {
    tokenStorage.clear();
    qc.clear();
    window.location.assign(LOGIN_PATH);
  }}
/>
    );
  }
  return <ErrorState message={getErrorMessage(error)} onRetry={onRetry} isRetrying={isRetrying} />;
}
