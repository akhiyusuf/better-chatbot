import { IOSCompatibilityChecker } from "@/components/ios-compatibility-checker";
import { IOSCompatibilityTest } from "@/components/ios-compatibility-test";
import dynamic from "next/dynamic";

// Dynamically import PWA status to avoid SSR issues
const PWACacheStatus = dynamic(() => import("@/components/pwa-cache-status"), {
  ssr: false,
  loading: () => <div className="p-4 border rounded-lg">Loading PWA status...</div>
});

export default function IOSTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">iOS Compatibility Test Suite</h1>
        <p className="text-muted-foreground">
          Comprehensive testing for iOS Safari compatibility and performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Compatibility Checker</h2>
          <IOSCompatibilityChecker />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Legacy Test Suite</h2>
          <IOSCompatibilityTest />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">PWA Cache Status</h2>
        <PWACacheStatus />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manual Tests</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-medium">Viewport Height Test</h3>
            <div className="ios-vh-fix bg-blue-100 dark:bg-blue-900 p-4 rounded">
              <p className="text-sm">This box should be exactly 100vh tall</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-medium">Touch Test</h3>
            <button 
              className="w-full p-4 bg-green-100 dark:bg-green-900 rounded touch-manipulation"
              onTouchStart={() => console.log("Touch started")}
              onTouchEnd={() => console.log("Touch ended")}
            >
              Touch this button (check console)
            </button>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-medium">Input Zoom Prevention</h3>
            <input 
              type="text" 
              placeholder="Type here (should not zoom on iOS)"
              className="w-full p-2 border rounded"
              style={{ fontSize: "16px" }}
            />
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <h3 className="font-medium">Scroll Performance</h3>
            <div className="h-32 overflow-y-auto border rounded p-2 ios-scroll-fix">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="p-2 border-b">
                  Scroll item {i + 1} - This should scroll smoothly on iOS
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Performance Indicators</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {typeof window !== "undefined" && window.performance ? 
                Math.round(window.performance.now()) : "N/A"}ms
            </div>
            <p className="text-sm text-muted-foreground">Page Load Time</p>
          </div>

          <div className="p-4 border rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {typeof navigator !== "undefined" ? 
                navigator.hardwareConcurrency || "N/A" : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">CPU Cores</p>
          </div>

          <div className="p-4 border rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {typeof navigator !== "undefined" && (navigator as any).deviceMemory ? 
                `${(navigator as any).deviceMemory}GB` : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">Device Memory</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Testing Instructions</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Open this page on an iPhone or iPad using Safari</li>
          <li>• Check that all compatibility tests pass (green checkmarks)</li>
          <li>• Test touch interactions and scrolling performance</li>
          <li>• Verify that inputs don't cause zoom when focused</li>
          <li>• Rotate device to test viewport height adjustments</li>
          <li>• Check browser console for any errors</li>
        </ul>
      </div>
    </div>
  );
}