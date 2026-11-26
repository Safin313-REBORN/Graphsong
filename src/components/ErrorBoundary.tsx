import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Graphsong error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="wrap" style={{ paddingTop: 64, paddingBottom: 64, maxWidth: 680 }}>
          <div className="card">
            <h1 className="h" style={{ fontSize: 32, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ margin: '0 0 20px' }}>{this.state.message}</p>
            <button
              type="button"
              className="btn p"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.assign('/');
              }}
            >
              Reload Graphsong
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
