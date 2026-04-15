import React from 'react';

// Catches render-time errors anywhere below it in the tree and renders a
// branded fallback instead of a blank white screen. Without this, a single
// bad fetch response or prop can nuke the whole page for the customer.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error('App error:', err, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page fade-in">
          <div className="empty-state">
            <h1 className="page-title">Something went wrong</h1>
            <p>We hit an unexpected error. Please refresh or head back to the homepage.</p>
            <button className="btn-back" onClick={this.handleReset}>Back to Home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
