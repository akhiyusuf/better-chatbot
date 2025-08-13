"use client";

import { useEffect } from "react";
import { useIOSDetection } from "./use-ios-detection";

export function useIOSPerformance() {
  const { isIOS, isOldIOS } = useIOSDetection();

  useEffect(() => {
    if (!isIOS) return;

    // iOS-specific performance optimizations
    const optimizations = {
      // Reduce animation complexity on older iOS
      reduceAnimations: () => {
        if (isOldIOS) {
          document.documentElement.style.setProperty("--animation-duration", "0.1s");
          document.documentElement.style.setProperty("--transition-duration", "0.1s");
        }
      },

      // Optimize scroll performance
      optimizeScrolling: () => {
        // Enable hardware acceleration for better scrolling
        document.body.style.transform = "translateZ(0)";
        
        // Optimize touch scrolling
        document.body.style.webkitOverflowScrolling = "touch";
        
        // Prevent iOS bounce on body
        document.body.style.overscrollBehavior = "none";
      },

      // Memory management for iOS
      memoryManagement: () => {
        // Clean up unused resources periodically
        const cleanup = () => {
          // Force garbage collection hint
          if ((window as any).gc) {
            (window as any).gc();
          }
          
          // Clear unused images from memory
          const images = document.querySelectorAll("img");
          images.forEach((img) => {
            if (!img.offsetParent && img.src) {
              // Image is not visible, can be optimized
              img.loading = "lazy";
            }
          });
        };

        // Run cleanup every 30 seconds on iOS
        const cleanupInterval = setInterval(cleanup, 30000);
        
        // Cleanup on page visibility change
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            cleanup();
          }
        });

        return () => clearInterval(cleanupInterval);
      },

      // Optimize touch events
      optimizeTouchEvents: () => {
        // Add passive touch listeners for better performance
        const passiveOptions = { passive: true };
        
        document.addEventListener("touchstart", () => {}, passiveOptions);
        document.addEventListener("touchmove", () => {}, passiveOptions);
        document.addEventListener("touchend", () => {}, passiveOptions);
      },

      // Prevent iOS Safari zoom on input focus
      preventInputZoom: () => {
        const inputs = document.querySelectorAll("input, textarea, select");
        inputs.forEach((input) => {
          const element = input as HTMLElement;
          if (element.style.fontSize === "" || parseFloat(element.style.fontSize) < 16) {
            element.style.fontSize = "16px";
          }
        });

        // Watch for dynamically added inputs
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const inputs = element.querySelectorAll("input, textarea, select");
                inputs.forEach((input) => {
                  const inputElement = input as HTMLElement;
                  if (inputElement.style.fontSize === "" || parseFloat(inputElement.style.fontSize) < 16) {
                    inputElement.style.fontSize = "16px";
                  }
                });
              }
            });
          });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
      },

      // Optimize viewport handling
      optimizeViewport: () => {
        let ticking = false;
        
        const updateViewport = () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              const vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty("--vh", `${vh}px`);
              ticking = false;
            });
            ticking = true;
          }
        };

        window.addEventListener("resize", updateViewport, { passive: true });
        window.addEventListener("orientationchange", () => {
          setTimeout(updateViewport, 100);
        });

        // Initial update
        updateViewport();

        return () => {
          window.removeEventListener("resize", updateViewport);
        };
      },
    };

    // Apply all optimizations
    optimizations.reduceAnimations();
    optimizations.optimizeScrolling();
    optimizations.optimizeTouchEvents();
    
    const cleanupMemory = optimizations.memoryManagement();
    const cleanupInputs = optimizations.preventInputZoom();
    const cleanupViewport = optimizations.optimizeViewport();

    // Cleanup function
    return () => {
      cleanupMemory?.();
      cleanupInputs?.();
      cleanupViewport?.();
    };
  }, [isIOS, isOldIOS]);

  return {
    isOptimized: isIOS,
    isOldDevice: isOldIOS,
  };
}