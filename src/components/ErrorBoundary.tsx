import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console or error reporting service
    console.error("Error caught by boundary:", error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="error-boundary"
          style={{
            padding: "2rem",
            textAlign: "center",
            border: "1px solid #e53e3e",
            borderRadius: "8px",
            backgroundColor: "#fed7d7",
            margin: "1rem",
          }}
        >
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <details style={{ marginTop: "1rem", textAlign: "left" }}>
            <summary>Error details</summary>
            <pre
              style={{
                backgroundColor: "#fff",
                padding: "1rem",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "0.875rem",
              }}
            >
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error("Error caught by hook:", error, errorInfo);
    // You could also send to an error reporting service here
  }, []);
}
