import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-red-50 p-8">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-red-900">Something went wrong.</h1>
          <p className="mt-2 text-center text-red-700">
            An unexpected error occurred on this page. Our "Auto-Heal" system has prevented the entire application from crashing.
          </p>
          <pre className="mt-4 w-full max-w-lg overflow-auto rounded-md bg-red-100 p-4 text-xs text-red-800">
            {this.state.error?.toString()}
          </pre>
          <Button 
            className="mt-6 bg-red-600 hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try to reload component
          </Button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;