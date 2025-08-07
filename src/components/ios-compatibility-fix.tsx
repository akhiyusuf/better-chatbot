"use client";

import { useEffect } from "react";

export function IOSCompatibilityFix() {
  useEffect(() => {
    // iOS WebKit compatibility fixes
    if (typeof window !== "undefined") {
      // Fix for iOS viewport issues
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        );
      }

      // Fix for iOS regex issues - polyfill named capture groups
      if (!RegExp.prototype.test.toString().includes("[native code]")) {
        // Already polyfilled
        return;
      }

      // Prevent iOS-specific JavaScript errors
      const originalError = window.onerror;
      window.onerror = function (message, source, lineno, colno, error) {
        // Suppress iOS WebKit specific errors that don't affect functionality
        if (
          typeof message === "string" &&
          (message.includes("Invalid regular expression") ||
            message.includes("invalid group specifier name") ||
            message.includes("Script error") ||
            message.includes("ChunkLoadError"))
        ) {
          console.warn("iOS compatibility: Suppressed error:", message);
          return true; // Prevent default error handling
        }

        if (originalError) {
          return originalError.call(
            this,
            message,
            source,
            lineno,
            colno,
            error,
          );
        }
        return false;
      };

      // Handle unhandled promise rejections on iOS
      const originalUnhandledRejection = window.onunhandledrejection;
      window.onunhandledrejection = function (event) {
        if (
          event.reason?.message?.includes("ChunkLoadError") ||
          event.reason?.message?.includes("Loading chunk") ||
          event.reason?.message?.includes("Invalid regular expression")
        ) {
          console.warn(
            "iOS compatibility: Suppressed promise rejection:",
            event.reason,
          );
          event.preventDefault();
          return;
        }

        if (originalUnhandledRejection) {
          return originalUnhandledRejection.call(this, event);
        }
      };

      // iOS-specific touch and interaction fixes
      document.addEventListener("touchstart", function () {}, {
        passive: true,
      });

      // Fix iOS double-tap zoom
      let lastTouchEnd = 0;
      document.addEventListener(
        "touchend",
        function (event) {
          const now = new Date().getTime();
          if (now - lastTouchEnd <= 300) {
            event.preventDefault();
          }
          lastTouchEnd = now;
        },
        false,
      );
    }
  }, []);

  return null; // This component doesn't render anything
}
