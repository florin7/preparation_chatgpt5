import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  pageName: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.pageName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="card error"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <h2>Error in {this.props.pageName}</h2>
          <p>Something went wrong while loading this page.</p>

          <div
            className="row"
            style={{ justifyContent: "center", gap: "1rem" }}
          >
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onRetry?.();
              }}
              className="primary"
            >
              Try Again
            </button>

            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>

          {this.state.error && (
            <details style={{ marginTop: "1rem", textAlign: "left" }}>
              <summary>Error details</summary>
              <pre
                style={{
                  backgroundColor: "rgba(0,0,0,0.1)",
                  padding: "1rem",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "0.875rem",
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
