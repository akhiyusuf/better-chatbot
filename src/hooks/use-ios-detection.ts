"use client";

import { useEffect, useState } from "react";

export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [iosVersion, setIOSVersion] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent;

      // Detect iOS
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      // Detect Safari
      const isSafariBrowser =
        /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

      // Extract iOS version
      let version: number | null = null;
      if (isIOSDevice) {
        const match = userAgent.match(/OS (\d+)_(\d+)/);
        if (match) {
          version = parseInt(match[1], 10);
        }
      }

      setIsIOS(isIOSDevice);
      setIsSafari(isSafariBrowser);
      setIOSVersion(version);
    }
  }, []);

  return {
    isIOS,
    isSafari,
    iosVersion,
    isOldIOS: iosVersion !== null && iosVersion < 14,
    supportsModernFeatures: iosVersion !== null && iosVersion >= 14,
  };
}
