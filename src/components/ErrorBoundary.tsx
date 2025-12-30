import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * レンダリング中のエラーをキャッチしてクラッシュを防ぐError Boundary
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログを出力（本番環境ではエラートラッキングサービスに送信）
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが指定されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーページ
      return <DefaultErrorPage error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorPageProps {
  error: Error | null;
  onReset: () => void;
}

/**
 * デフォルトのエラーページ
 */
function DefaultErrorPage({ error, onReset }: DefaultErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-surface-50 dark:bg-surface-950">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
        アプリケーションエラー
      </h1>
      <p className="text-surface-800 dark:text-surface-200 mb-4 max-w-md">
        予期しないエラーが発生しました。アプリケーションを再読み込みしてください。
      </p>
      {error && (
        <details className="mb-4 max-w-2xl w-full text-left">
          <summary className="cursor-pointer text-sm text-surface-600 dark:text-surface-400 mb-2">
            エラー詳細
          </summary>
          <pre className="p-4 bg-surface-100 dark:bg-surface-900 rounded-lg text-xs overflow-auto">
            {error.toString()}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
      >
        再試行
      </button>
    </div>
  );
}
