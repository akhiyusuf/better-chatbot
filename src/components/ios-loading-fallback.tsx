"use client";

import { useEffect, useState } from "react";
import { Button } from "ui/button";

export function IOSLoadingFallback() {
  const [showFallback, setShowFallback] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show fallback after 5 seconds if app hasn't loaded
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, 5000);

      // Hide fallback if app loads successfully
      const hideTimer = setTimeout(() => {
        setShowFallback(false);
      }, 10000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleReload = () => {
    // Clear cache and reload
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();

        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      } catch (e) {
        console.warn("Cache clear failed:", e);
      }

      window.location.reload();
    }
  };

  if (!isIOS || !showFallback) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">Loading...</h2>
        <p className="text-muted-foreground text-sm">
          The app is taking longer than usual to load. This might be due to
          network issues or browser compatibility.
        </p>
        <div className="space-y-2">
          <Button onClick={handleReload} className="w-full">
            Reload App
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFallback(false)}
            className="w-full"
          >
            Continue Waiting
          </Button>
        </div>
      </div>
    </div>
  );
}
