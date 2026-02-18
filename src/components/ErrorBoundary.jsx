import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary caught error', {
      error: error.toString(),
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack
    });
    // Also log to console for easier debugging
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page or try again.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">Error Details (Dev Mode)</summary>
                <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{this.state.error.toString()}</pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-[10px]">{this.state.error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
