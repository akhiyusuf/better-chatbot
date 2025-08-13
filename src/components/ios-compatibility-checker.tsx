"use client";

import { useIOSDetection } from "@/hooks/use-ios-detection";
import { useEffect, useState } from "react";
import { Button } from "ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface CompatibilityTest {
  name: string;
  description: string;
  test: () => boolean;
  critical: boolean;
}

export function IOSCompatibilityChecker() {
  const { isIOS, isSafari, iosVersion, isOldIOS } = useIOSDetection();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);

  const compatibilityTests: CompatibilityTest[] = [
    {
      name: "Viewport Height",
      description: "CSS viewport height calculation works correctly",
      critical: true,
      test: () => {
        try {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty("--test-vh", `${vh}px`);
          const computed = getComputedStyle(document.documentElement).getPropertyValue("--test-vh");
          document.documentElement.style.removeProperty("--test-vh");
          return computed.includes("px");
        } catch {
          return false;
        }
      },
    },
    {
      name: "Touch Events",
      description: "Touch event support is available",
      critical: true,
      test: () => "ontouchstart" in window,
    },
    {
      name: "Local Storage",
      description: "Local storage is accessible and writable",
      critical: true,
      test: () => {
        try {
          localStorage.setItem("ios-test", "test");
          const result = localStorage.getItem("ios-test") === "test";
          localStorage.removeItem("ios-test");
          return result;
        } catch {
          return false;
        }
      },
    },
    {
      name: "CSS Custom Properties",
      description: "CSS custom properties (variables) work correctly",
      critical: true,
      test: () => {
        try {
          const testEl = document.createElement("div");
          testEl.style.setProperty("--test-prop", "test-value");
          return testEl.style.getPropertyValue("--test-prop") === "test-value";
        } catch {
          return false;
        }
      },
    },
    {
      name: "IntersectionObserver",
      description: "IntersectionObserver API is available",
      critical: false,
      test: () => typeof IntersectionObserver !== "undefined",
    },
    {
      name: "RequestIdleCallback",
      description: "RequestIdleCallback API is available",
      critical: false,
      test: () => typeof requestIdleCallback !== "undefined",
    },
    {
      name: "Format Detection Disabled",
      description: "Safari auto-detection is properly disabled",
      critical: true,
      test: () => {
        const metaTag = document.querySelector('meta[name="format-detection"]');
        return metaTag?.getAttribute("content")?.includes("telephone=no") || false;
      },
    },
    {
      name: "Debug Tools Blocked",
      description: "Problematic debug tools are prevented from loading",
      critical: true,
      test: () => typeof (window as any).eruda === "undefined",
    },
    {
      name: "Passive Touch Events",
      description: "Touch events are properly configured as passive",
      critical: false,
      test: () => {
        try {
          let supportsPassive = false;
          const opts = Object.defineProperty({}, "passive", {
            get() {
              supportsPassive = true;
              return false;
            },
          });
          window.addEventListener("test", () => {}, opts);
          return supportsPassive;
        } catch {
          return false;
        }
      },
    },
    {
      name: "Dynamic Viewport Units",
      description: "Modern dynamic viewport units (dvh) are supported",
      critical: false,
      test: () => CSS.supports("height", "100dvh"),
    },
  ];

  const runCompatibilityTests = async () => {
    setIsRunning(true);
    const results: Record<string, boolean> = {};

    for (const test of compatibilityTests) {
      try {
        results[test.name] = test.test();
      } catch {
        results[test.name] = false;
      }
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isIOS) {
      runCompatibilityTests();
    }
  }, [isIOS]);

  if (!isIOS) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Non-iOS Device Detected</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          iOS compatibility tests are only relevant for iOS devices. Your current device should work without iOS-specific fixes.
        </p>
      </div>
    );
  }

  const criticalTests = compatibilityTests.filter(t => t.critical);
  const nonCriticalTests = compatibilityTests.filter(t => !t.critical);
  
  const criticalPassed = criticalTests.filter(t => testResults[t.name]).length;
  const criticalTotal = criticalTests.length;
  const nonCriticalPassed = nonCriticalTests.filter(t => testResults[t.name]).length;
  const nonCriticalTotal = nonCriticalTests.length;

  const overallHealth = criticalPassed === criticalTotal ? "good" : criticalPassed > criticalTotal * 0.7 ? "warning" : "error";

  return (
    <div className="p-4 bg-card rounded-lg border space-y-4">
      <div className="flex items-center gap-2">
        {overallHealth === "good" && <CheckCircle className="h-5 w-5 text-green-600" />}
        {overallHealth === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
        {overallHealth === "error" && <XCircle className="h-5 w-5 text-red-600" />}
        <h3 className="font-semibold">iOS Compatibility Status</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm bg-muted p-3 rounded">
        <div>Device: iOS {iosVersion || "Unknown"}</div>
        <div>Browser: {isSafari ? "Safari" : "Other"}</div>
        <div>Legacy iOS: {isOldIOS ? "Yes (< iOS 14)" : "No"}</div>
        <div>Status: {overallHealth === "good" ? "✅ Good" : overallHealth === "warning" ? "⚠️ Issues" : "❌ Problems"}</div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-2">
            Critical Tests ({criticalPassed}/{criticalTotal} passed)
          </h4>
          <div className="space-y-1">
            {criticalTests.map((test) => (
              <div key={test.name} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-xs text-muted-foreground">{test.description}</div>
                </div>
                <span className={`text-sm font-medium ${
                  testResults[test.name] ? "text-green-600" : "text-red-600"
                }`}>
                  {isRunning ? "..." : testResults[test.name] ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">
            Enhancement Tests ({nonCriticalPassed}/{nonCriticalTotal} passed)
          </h4>
          <div className="space-y-1">
            {nonCriticalTests.map((test) => (
              <div key={test.name} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-xs text-muted-foreground">{test.description}</div>
                </div>
                <span className={`text-sm font-medium ${
                  testResults[test.name] ? "text-green-600" : "text-yellow-600"
                }`}>
                  {isRunning ? "..." : testResults[test.name] ? "✓" : "○"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={runCompatibilityTests}
          variant="outline"
          size="sm"
          disabled={isRunning}
        >
          {isRunning ? "Testing..." : "Re-run Tests"}
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Reload Page
        </Button>
      </div>

      {overallHealth !== "good" && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Some compatibility issues detected. The app should still work, but you may experience reduced functionality or performance on this iOS device.
          </p>
        </div>
      )}
    </div>
  );
}