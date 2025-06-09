

// src/components/ErrorBoundary.js
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };
  
  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="alert alert-danger">
          Something went wrong. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}
