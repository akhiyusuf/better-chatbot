"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class IOSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error("iOS Error Boundary caught an error:", error, errorInfo);

    // Check if it's an iOS-specific error
    const isIOSError =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      (error.message.includes("eruda") ||
        error.message.includes("Script error") ||
        error.message.includes("Non-Error promise rejection") ||
        error.message.includes("client-side exception") ||
        error.message.includes("ChunkLoadError") ||
        error.message.includes("Loading chunk") ||
        error.message.includes("Loading CSS chunk"));

    if (isIOSError) {
      // Handle iOS-specific errors gracefully
      console.warn("iOS-specific error handled:", error.message);

      // Try to recover by clearing cache and reloading after a delay
      setTimeout(() => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => registration.unregister());
          });
        }
        window.location.reload();
      }, 2000);
    }
  }

  handleReload = () => {
    // Clear any problematic state and reload
    if (typeof window !== "undefined") {
      // Clear localStorage items that might cause issues
      try {
        localStorage.removeItem("app-theme-v2");
        sessionStorage.clear();
      } catch (_e) {
        // Ignore storage errors
      }

      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // iOS-friendly error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">
              We encountered an issue loading the app. This might be due to a
              compatibility issue with your browser.
            </p>
            <div className="space-y-2">
              <Button onClick={this.handleReload} className="w-full">
                Reload App
              </Button>
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false })}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
