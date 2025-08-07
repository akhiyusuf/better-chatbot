// Safari iOS 15 compatibility polyfills

// Check if we're in a browser environment
if (typeof window !== "undefined") {
  // Polyfill for named capture groups in regex (not supported in Safari iOS 15)
  const originalRegExpTest = RegExp.prototype.test;
  const originalRegExpExec = RegExp.prototype.exec;

  // Override RegExp methods to handle named capture groups gracefully
  RegExp.prototype.test = function (str: string) {
    try {
      return originalRegExpTest.call(this, str);
    } catch (error) {
      if (
        error instanceof SyntaxError &&
        error.message.includes("invalid group specifier name")
      ) {
        // Convert named capture groups to regular groups
        const source = this.source.replace(/\(\?<[^>]+>/g, "(");
        const fallbackRegex = new RegExp(source, this.flags);
        return fallbackRegex.test(str);
      }
      throw error;
    }
  };

  RegExp.prototype.exec = function (str: string) {
    try {
      return originalRegExpExec.call(this, str);
    } catch (error) {
      if (
        error instanceof SyntaxError &&
        error.message.includes("invalid group specifier name")
      ) {
        // Convert named capture groups to regular groups
        const source = this.source.replace(/\(\?<[^>]+>/g, "(");
        const fallbackRegex = new RegExp(source, this.flags);
        return fallbackRegex.exec(str);
      }
      throw error;
    }
  };

  // Prevent Eruda from auto-initializing
  if (typeof window !== "undefined") {
    // Block eruda if it tries to load
    Object.defineProperty(window, "eruda", {
      get() {
        return {
          init: () => {},
          show: () => {},
          hide: () => {},
          destroy: () => {},
        };
      },
      set() {
        // Prevent eruda from being set
      },
      configurable: false,
    });
  }

  // Add error boundary for chunk loading errors
  window.addEventListener("error", (event) => {
    if (
      event.message?.includes("ChunkLoadError") ||
      event.message?.includes("Loading chunk")
    ) {
      console.warn("Chunk loading error detected, attempting to reload...");
      // Prevent the error from bubbling up
      event.preventDefault();
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Handle unhandled promise rejections (chunk loading failures)
  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason?.message?.includes("ChunkLoadError") ||
      event.reason?.message?.includes("Loading chunk")
    ) {
      console.warn("Chunk loading promise rejection detected");
      event.preventDefault();
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}
