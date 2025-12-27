import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel Error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '50px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h1 style={{ color: '#e74c3c', marginBottom: '20px', fontSize: '24px' }}>
              ⚠️ Something went wrong
            </h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              The admin panel encountered an error. Please try reloading the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '20px', 
                textAlign: 'left',
                marginBottom: '20px'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#3498db',
                  marginBottom: '10px'
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '15px', 
                  borderRadius: '5px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#333',
                  maxHeight: '300px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <button 
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#2980b9'}
              onMouseOut={(e) => e.target.style.background = '#3498db'}
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

export default ErrorBoundary;

