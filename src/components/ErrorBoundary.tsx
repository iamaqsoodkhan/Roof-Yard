import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 dark:bg-[#100406] text-stone-900 dark:text-stone-100">
          <div className="max-w-md w-full rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#1b090c] p-6 text-center shadow-xl">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 mb-5">
              We hit an unexpected hiccup loading this view. Please refresh to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              Reload Roof Yard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
