import React from 'react';
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  componentDidCatch(error, errorInfo) { this.setState({ hasError: true, error, errorInfo }); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white', overflow: 'auto', maxHeight: '100vh' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
