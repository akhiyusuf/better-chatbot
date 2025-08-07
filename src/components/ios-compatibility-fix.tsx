"use client";

import { useEffect } from "react";
import { disableProblematicDebugTools } from "@/lib/ios-debug-fix";

// TypeScript declarations for iOS polyfills
declare global {
  interface Window {
    eruda?: any;
  }
}

type IdleRequestCallback = (deadline: {
  timeRemaining(): number;
  didTimeout: boolean;
}) => void;

export function IOSCompatibilityFix() {
  useEffect(() => {
    // iOS WebKit compatibility fixes
    if (typeof window !== "undefined") {
      // Apply debug tool fixes first
      disableProblematicDebugTools();

      // iOS Safari polyfills and fixes
      if (!window.requestIdleCallback) {
        (window as any).requestIdleCallback = function (
          cb: IdleRequestCallback,
        ) {
          return setTimeout(
            () => cb({ timeRemaining: () => 50, didTimeout: false }),
            1,
          );
        };
        (window as any).cancelIdleCallback = function (id: number) {
          clearTimeout(id);
        };
      }
      // Fix for iOS viewport issues
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        );
      } else {
        // Create viewport meta tag if it doesn't exist
        const meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content =
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
        document.head.appendChild(meta);
      }

      // Add iOS-specific meta tags
      const addMetaTag = (name: string, content: string) => {
        if (!document.querySelector(`meta[name="${name}"]`)) {
          const meta = document.createElement("meta");
          meta.name = name;
          meta.content = content;
          document.head.appendChild(meta);
        }
      };

      addMetaTag("apple-mobile-web-app-capable", "yes");
      addMetaTag("apple-mobile-web-app-status-bar-style", "default");
      addMetaTag("format-detection", "telephone=no");

      // Fix iOS Safari 100vh issue by setting CSS custom property
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      };

      setViewportHeight();
      window.addEventListener("resize", setViewportHeight);
      window.addEventListener("orientationchange", () => {
        setTimeout(setViewportHeight, 100);
      });

      // Error handling for iOS Safari
      const originalConsoleError = console.error;
      console.error = function (...args: any[]) {
        // Filter out known iOS Safari issues
        const message = args.join(" ");
        if (
          message.includes("eruda") ||
          message.includes("Script error") ||
          message.includes("Non-Error promise rejection")
        ) {
          return; // Suppress these errors on iOS
        }
        originalConsoleError.apply(console, args);
      };

      // iOS-specific CSS fixes
      const style = document.createElement("style");
      style.textContent = `
        /* iOS Safari fixes */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Fix for iOS Safari dvh fallback */
        .ios-vh-fix {
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
        }
        
        .ios-min-vh-55 {
          min-height: 55vh;
          min-height: calc(var(--vh, 1vh) * 55);
        }
        
        /* Prevent iOS Safari bounce */
        html, body {
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Fix input zoom on iOS */
        input, textarea, select {
          font-size: 16px !important;
        }
        
        /* Fix for iOS Safari address bar */
        @supports (-webkit-touch-callout: none) {
          .ios-safe-area {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
        
        /* Additional iOS Safari compatibility */
        @supports (-webkit-touch-callout: none) {
          /* iOS-specific styles */
          .ios-scroll-fix {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
          }
          
          /* Fix for iOS Safari rendering issues */
          .ios-transform-fix {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }
        }
      `;
      document.head.appendChild(style);

      return () => {
        window.removeEventListener("resize", setViewportHeight);
        window.removeEventListener("orientationchange", setViewportHeight);
      };
    }
  }, []);

  return null;
}
