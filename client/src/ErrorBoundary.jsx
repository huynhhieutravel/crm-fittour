import React from 'react';
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', height: '100vh', width: '100vw', zIndex: 999999, position: 'fixed', top: 0, left: 0, overflow: 'auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>⚠️ LỖI PHẦN MỀM (CRASH)</h1>
          <p>Sếp hãy chụp lại màn hình này và gửi cho em nhé!</p>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171', whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
