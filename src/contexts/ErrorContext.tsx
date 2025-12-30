import { getErrorMessage } from "@/lib/error";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";

interface ErrorContextValue {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * エラー状態を管理するContext Provider
 */
export function ErrorProvider({ children }: ErrorProviderProps) {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (error) {
        setError(getErrorMessage(error));
        return undefined;
      }
    },
    []
  );

  return (
    <ErrorContext.Provider value={{ error, setError, clearError, withErrorHandling }}>
      {children}
    </ErrorContext.Provider>
  );
}

/**
 * ErrorContextを使用するカスタムフック
 */
export function useError(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
