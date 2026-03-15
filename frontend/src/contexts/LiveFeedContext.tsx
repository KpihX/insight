import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDashboardFeed } from '../services/api';
import { DashboardFeedItem } from '../types/api';
import {
  DEFAULT_DASHBOARD_ROLE,
  DEFAULT_DASHBOARD_STAFF_ID,
  REFRESH_INTERVAL_MS,
  USE_REAL_API,
} from '../config/runtime';

interface LiveFeedContextType {
  items: DashboardFeedItem[];
  loading: boolean;
  lastUpdatedAt: string | null;
}

const LiveFeedContext = createContext<LiveFeedContextType | undefined>(undefined);

export function LiveFeedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DashboardFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(USE_REAL_API);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!USE_REAL_API) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchFeed = async () => {
      try {
        const feed = await getDashboardFeed(
          DEFAULT_DASHBOARD_ROLE,
          DEFAULT_DASHBOARD_STAFF_ID,
          undefined,
          undefined,
          50
        );

        if (cancelled) return;
        setItems(feed.items || []);
        setLastUpdatedAt(new Date().toISOString());
      } catch (error) {
        console.error('Failed to fetch shared live feed', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const value = useMemo<LiveFeedContextType>(
    () => ({
      items,
      loading,
      lastUpdatedAt,
    }),
    [items, loading, lastUpdatedAt]
  );

  return <LiveFeedContext.Provider value={value}>{children}</LiveFeedContext.Provider>;
}

export function useLiveFeed() {
  const context = useContext(LiveFeedContext);
  if (!context) throw new Error('useLiveFeed must be used within LiveFeedProvider');
  return context;
}
