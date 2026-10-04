import { useEffect, useRef } from 'react';

// Simple, high-performance Observer Pattern (Event Emitter)
class DashboardRefreshEmitter {
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribe a callback function to be called on refresh event.
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit the refresh event to all subscribed listeners.
   */
  emit(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error("Error executing dashboard refresh listener:", err);
      }
    });
  }
}

// Singleton instance of the emitter
export const dashboardRefreshEmitter = new DashboardRefreshEmitter();

/**
 * Custom hook that subscribes to dashboard refresh events.
 * Uses a ref to maintain a stable event subscription across re-renders.
 * @param onRefresh Callback to fetch fresh data.
 */
export function useDashboardRefresh(onRefresh: () => void): void {
  const savedHandler = useRef(onRefresh);

  useEffect(() => {
    savedHandler.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const listener = () => {
      if (savedHandler.current) {
        savedHandler.current();
      }
    };
    const unsubscribe = dashboardRefreshEmitter.subscribe(listener);
    return () => {
      unsubscribe();
    };
  }, []);
}

/**
 * Globally trigger a dashboard-wide state refresh.
 */
export function triggerDashboardRefresh(): void {
  dashboardRefreshEmitter.emit();
}
