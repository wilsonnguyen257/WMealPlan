import React from 'react';
import logger from '../utils/logger';

/**
 * ErrorBoundary Component
 * 
 * React Error Boundary to catch and handle JavaScript errors in component tree.
 * Displays fallback UI when errors occur and logs errors for debugging.
 * 
 * Features:
 * - Catches errors in child components during rendering, lifecycle, and constructors
 * - Displays user-friendly fallback UI with retry option
 * - Logs errors with stack traces for debugging
 * - Prevents app crashes from propagating unhandled errors
 * 
 * Usage:
 * Wrap your App or specific component trees:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * Note: Error boundaries do NOT catch:
 * - Event handlers (use try-catch)
 * - Asynchronous code (setTimeout, promises)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    logger.error('React Error Boundary caught an error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      errorInfo
    });

    // Store error details in state for display
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F9FAFB',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              backgroundColor: '#FEE2E2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#DC2626" 
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Error Message */}
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: '0.75rem'
            }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{
              fontSize: '1rem',
              color: '#6B7280',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error. Don't worry, your data is safe. 
              Try refreshing the page or click the button below to continue.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '2rem',
                textAlign: 'left',
                backgroundColor: '#F9FAFB',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Error Details (Development Mode)
                </summary>
                <pre style={{
                  fontSize: '0.875rem',
                  color: '#DC2626',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: '0.5rem 0 0 0'
                }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    marginTop: '0.5rem'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#2E7D32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1B5E20'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2E7D32'}
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: 'white',
                  color: '#2E7D32',
                  border: '2px solid #2E7D32',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#F0F9FF';
                  e.target.style.borderColor = '#1B5E20';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#2E7D32';
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
