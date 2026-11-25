import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      let parsedMsg = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as {
          error?: string;
          operationType?: string;
          path?: string;
        };
        if (parsed?.error) {
          parsedMsg = `${parsed.error}${parsed.path ? ` (${parsed.operationType} on ${parsed.path})` : ''}`;
        }
      } catch {
        // Keep plain string message
      }

      return (
        <div className="min-h-screen bg-[#F6F3EE] text-[#181615] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-[#DFD8CE] p-7 space-y-4 shadow-sm">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8E4A36] font-medium block">
              Spaces by Muskan
            </span>
            <h1 className="font-serif text-2xl font-light">
              Something interrupted this view
            </h1>
            <p className="text-xs text-[#6B655E] leading-relaxed break-words">
              {parsedMsg}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#181615] hover:bg-[#8E4A36] text-white text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
