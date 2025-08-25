"use client";

// iOS PWA and Service Worker optimizations
// Addresses iOS Safari's 50MB cache limit and service worker limitations

export class IOSPWAOptimizer {
  private static instance: IOSPWAOptimizer;
  private isIOS: boolean;
  private cacheSize: number = 0;
  private readonly MAX_CACHE_SIZE = 45 * 1024 * 1024; // 45MB (under iOS 50MB limit)

  constructor() {
    this.isIOS = typeof window !== "undefined" && (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  static getInstance(): IOSPWAOptimizer {
    if (!IOSPWAOptimizer.instance) {
      IOSPWAOptimizer.instance = new IOSPWAOptimizer();
    }
    return IOSPWAOptimizer.instance;
  }

  async optimizeForIOS(): Promise<void> {
    if (!this.isIOS || typeof window === "undefined") return;

    try {
      await this.manageCacheSize();
      await this.setupServiceWorkerOptimizations();
      this.setupStorageOptimizations();
      this.setupNetworkOptimizations();
    } catch (error) {
      console.warn("iOS PWA optimization failed:", error);
    }
  }

  private async manageCacheSize(): Promise<void> {
    if (!("caches" in window)) return;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      // Calculate current cache size
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      this.cacheSize = totalSize;

      // If approaching limit, clean up oldest caches
      if (totalSize > this.MAX_CACHE_SIZE) {
        await this.cleanupOldCaches(cacheNames);
      }
    } catch (error) {
      console.warn("Cache size management failed:", error);
    }
  }

  private async cleanupOldCaches(cacheNames: string[]): Promise<void> {
    // Sort cache names and remove oldest ones
    const sortedCaches = cacheNames.sort();
    const cachesToDelete = sortedCaches.slice(0, Math.floor(sortedCaches.length / 2));

    for (const cacheName of cachesToDelete) {
      try {
        await caches.delete(cacheName);
        console.log(`Deleted cache: ${cacheName}`);
      } catch (error) {
        console.warn(`Failed to delete cache ${cacheName}:`, error);
      }
    }
  }

  private async setupServiceWorkerOptimizations(): Promise<void> {
    if (!("serviceWorker" in navigator)) return;

    try {
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Notify user of update instead of auto-reloading
        this.notifyServiceWorkerUpdate();
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "CACHE_UPDATED") {
          this.notifyServiceWorkerUpdate();
        }
      });

      // Register service worker with iOS-specific options
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none", // Important for iOS
      });

      // Check for updates more frequently on iOS
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.warn("Service worker optimization failed:", error);
    }
  }

  private setupStorageOptimizations(): void {
    // Optimize localStorage usage for iOS
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    localStorage.setItem = function(key: string, value: string) {
      try {
        // Check storage quota before setting
        const testKey = `__storage_test_${Date.now()}`;
        originalSetItem.call(this, testKey, "test");
        this.removeItem(testKey);
        
        return originalSetItem.call(this, key, value);
      } catch (error) {
        // Storage full, try to clean up
        console.warn("Storage full, attempting cleanup");
        IOSPWAOptimizer.getInstance().cleanupStorage();
        throw error;
      }
    };

    // Periodic storage cleanup
    setInterval(() => {
      this.cleanupStorage();
    }, 300000); // Every 5 minutes
  }

  private cleanupStorage(): void {
    try {
      // Remove old temporary data
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith("temp_") ||
          key.startsWith("cache_") ||
          key.includes("_old")
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove storage key ${key}:`, error);
        }
      });

      console.log(`Cleaned up ${keysToRemove.length} storage items`);
    } catch (error) {
      console.warn("Storage cleanup failed:", error);
    }
  }

  private setupNetworkOptimizations(): void {
    // Optimize fetch requests for iOS
    const originalFetch = window.fetch;
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const request = new Request(input, init);
      
      // Add iOS-specific headers
      const headers = new Headers(request.headers);
      headers.set("Cache-Control", "public, max-age=31536000");
      
      // For iOS, always include credentials for same-origin requests
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS && request.url.startsWith(window.location.origin)) {
        return originalFetch(request, {
          ...init,
          credentials: "include",
          headers,
        });
      }
      
      return originalFetch(request, { ...init, headers });
    };
  }

  private notifyServiceWorkerUpdate(): void {
    // Create a user-friendly update notification
    if (typeof window !== "undefined" && "Notification" in window) {
      // You can integrate this with your toast system
      console.log("App update available. Please refresh to get the latest version.");
      
      // Optionally show a toast or modal
      const event = new CustomEvent("sw-update-available", {
        detail: { message: "App update available" }
      });
      window.dispatchEvent(event);
    }
  }

  // Public method to check cache health
  async getCacheStatus(): Promise<{
    size: number;
    maxSize: number;
    usage: number;
    healthy: boolean;
  }> {
    await this.manageCacheSize();
    
    return {
      size: this.cacheSize,
      maxSize: this.MAX_CACHE_SIZE,
      usage: (this.cacheSize / this.MAX_CACHE_SIZE) * 100,
      healthy: this.cacheSize < this.MAX_CACHE_SIZE * 0.8,
    };
  }
}

// Auto-initialize on iOS devices
if (typeof window !== "undefined") {
  const optimizer = IOSPWAOptimizer.getInstance();
  
  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      optimizer.optimizeForIOS();
    });
  } else {
    optimizer.optimizeForIOS();
  }
}