"use client";

import { useIOSDetection } from "@/hooks/use-ios-detection";
import { useEffect, useState } from "react";
import { Button } from "ui/button";

export function IOSCompatibilityTest() {
  const { isIOS, isSafari, iosVersion, isOldIOS } = useIOSDetection();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isIOS) return;

    const runTests = () => {
      const results: Record<string, boolean> = {};

      // Test 1: Viewport height calculation
      try {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
        results.viewportHeight = true;
      } catch (_e) {
        results.viewportHeight = false;
      }

      // Test 2: Touch events
      try {
        results.touchEvents = "ontouchstart" in window;
      } catch (_e) {
        results.touchEvents = false;
      }

      // Test 3: CSS custom properties
      try {
        const testEl = document.createElement("div");
        testEl.style.setProperty("--test", "1px");
        results.cssCustomProperties =
          testEl.style.getPropertyValue("--test") === "1px";
      } catch (_e) {
        results.cssCustomProperties = false;
      }

      // Test 4: Local storage
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        results.localStorage = true;
      } catch (_e) {
        results.localStorage = false;
      }

      // Test 5: Eruda prevention
      results.erudaPrevented = typeof window.eruda === "undefined";

      setTestResults(results);
    };

    runTests();
  }, [isIOS]);

  if (!isIOS) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          iOS compatibility tests are only available on iOS devices.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg border space-y-4">
      <h3 className="font-semibold">iOS Compatibility Status</h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Device: {isIOS ? "iOS" : "Other"}</div>
        <div>Browser: {isSafari ? "Safari" : "Other"}</div>
        <div>iOS Version: {iosVersion || "Unknown"}</div>
        <div>Old iOS: {isOldIOS ? "Yes" : "No"}</div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Compatibility Tests:</h4>
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className="flex justify-between items-center">
            <span className="text-sm capitalize">
              {test.replace(/([A-Z])/g, " $1").toLowerCase()}
            </span>
            <span
              className={`text-sm ${passed ? "text-green-600" : "text-red-600"}`}
            >
              {passed ? "✓ Pass" : "✗ Fail"}
            </span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        size="sm"
        className="w-full"
      >
        Reload Page
      </Button>
    </div>
  );
}
