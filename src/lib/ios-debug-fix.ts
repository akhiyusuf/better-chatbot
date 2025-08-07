// iOS Debug Tool Compatibility Fix
// This prevents Eruda and other debugging tools from causing script errors on iOS

export function disableProblematicDebugTools() {
  if (typeof window === "undefined") return;

  // Detect iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (!isIOS) return;

  // Prevent Eruda initialization
  Object.defineProperty(window, "eruda", {
    get: () => undefined,
    set: () => {}, // Ignore attempts to set eruda
    configurable: false,
    enumerable: false,
  });

  // Remove any existing debug tool scripts
  const removeDebugScripts = () => {
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script) => {
      const src = script.src || script.innerHTML;
      if (
        src.includes("eruda") ||
        src.includes("vconsole") ||
        (src.includes("debug") && src.includes("mobile"))
      ) {
        script.remove();
      }
    });
  };

  // Run immediately and on DOM changes
  removeDebugScripts();

  // Watch for dynamically added scripts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === "SCRIPT") {
            const script = element as HTMLScriptElement;
            const src = script.src || script.innerHTML;
            if (src.includes("eruda") || src.includes("vconsole")) {
              script.remove();
            }
          }
        }
      });
    });
  });

  observer.observe(document.head, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });

  // Override console methods that might cause issues
  const originalMethods = {
    error: console.error,
    warn: console.warn,
    log: console.log,
  };

  console.error = function (...args) {
    const message = args.join(" ");
    // Filter out known problematic messages
    if (
      message.includes("[Eruda]") ||
      message.includes("eruda.init()") ||
      message.includes("Script error.")
    ) {
      return; // Suppress these errors
    }
    originalMethods.error.apply(console, args);
  };

  console.warn = function (...args) {
    const message = args.join(" ");
    if (message.includes("[Eruda]")) {
      return; // Suppress eruda warnings
    }
    originalMethods.warn.apply(console, args);
  };
}

// Call this as early as possible
if (typeof window !== "undefined") {
  disableProblematicDebugTools();
}
