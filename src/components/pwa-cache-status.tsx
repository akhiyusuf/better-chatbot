"use client";

import { useEffect, useState } from "react";
import { IOSPWAOptimizer } from "@/lib/ios-pwa-optimization";
import { Button } from "ui/button";
import { RefreshCw, Database, Wifi, WifiOff } from "lucide-react";

interface CacheStatus {
  size: number;
  maxSize: number;
  usage: number;
  healthy: boolean;
}

export default function PWACacheStatus() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSWRegistration(registration);
      });
    }

    // Load initial cache status
    loadCacheStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheStatus = async () => {
    setIsLoading(true);
    try {
      const optimizer = IOSPWAOptimizer.getInstance();
      const status = await optimizer.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Failed to load cache status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    if (!('caches' in window)) return;
    
    setIsLoading(true);
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Reload cache status
      await loadCacheStatus();
      
      // Show success message
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateServiceWorker = async () => {
    if (!swRegistration) return;
    
    setIsLoading(true);
    try {
      await swRegistration.update();
      console.log('Service worker updated');
    } catch (error) {
      console.error('Failed to update service worker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsageColor = (usage: number): string => {
    if (usage < 50) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 bg-card rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">PWA & Cache Status</h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {cacheStatus && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Cache Usage</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Used:</span>
                <span>{formatBytes(cacheStatus.size)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Limit:</span>
                <span>{formatBytes(cacheStatus.maxSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Usage:</span>
                <span className={getUsageColor(cacheStatus.usage)}>
                  {cacheStatus.usage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Usage bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  cacheStatus.usage < 50 ? 'bg-green-500' :
                  cacheStatus.usage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(cacheStatus.usage, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Status</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Health:</span>
                <span className={cacheStatus.healthy ? 'text-green-600' : 'text-red-600'}>
                  {cacheStatus.healthy ? '✓ Good' : '⚠ Warning'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>SW Active:</span>
                <span className={swRegistration ? 'text-green-600' : 'text-red-600'}>
                  {swRegistration ? '✓ Yes' : '✗ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>PWA Ready:</span>
                <span className={('serviceWorker' in navigator) ? 'text-green-600' : 'text-red-600'}>
                  {('serviceWorker' in navigator) ? '✓ Yes' : '✗ No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={loadCacheStatus}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button
          onClick={clearCache}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          Clear Cache
        </Button>
        
        {swRegistration && (
          <Button
            onClick={updateServiceWorker}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Update SW
          </Button>
        )}
      </div>

      {!cacheStatus?.healthy && cacheStatus && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Cache usage is high ({cacheStatus.usage.toFixed(1)}%). Consider clearing cache to improve performance on iOS devices.
          </p>
        </div>
      )}

      {!isOnline && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You're currently offline. The app is running from cached resources.
          </p>
        </div>
      )}
    </div>
  );
}