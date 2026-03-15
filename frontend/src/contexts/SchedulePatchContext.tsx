import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_DASHBOARD_ROLE,
  DEFAULT_DASHBOARD_STAFF_ID,
  REFRESH_INTERVAL_MS,
  USE_REAL_API,
} from '../config/runtime';
import { getDashboardFeed, getEventDetail } from '../services/api';
import { CalendarPatch, EventDetail } from '../types/api';

export interface SuggestedCalendarPatch {
  sourceEventId: string;
  title: string;
  summary: string;
  senderName?: string;
  senderGroup?: string;
  patch: CalendarPatch;
}

export interface AppliedCalendarPatch {
  sourceEventId: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  patch_type: string;
  location?: string;
  savedAt: string;
}

interface SchedulePatchContextType {
  currentSuggestion: SuggestedCalendarPatch | null;
  appliedPatches: AppliedCalendarPatch[];
  currentToast: LiveEventToast | null;
  dismissSuggestion: () => void;
  applySuggestion: (patch: AppliedCalendarPatch) => void;
}

export interface LiveEventToast {
  eventId: string;
  title: string;
  summary: string;
  senderLabel?: string;
}

const APPLIED_PATCHES_STORAGE_KEY = 'insight.appliedCalendarPatches.v2';
const DISMISSED_PATCHES_STORAGE_KEY = 'insight.dismissedCalendarPatches.v2';

const SchedulePatchContext = createContext<SchedulePatchContextType | undefined>(undefined);

const readArrayFromStorage = (key: string) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const buildPatchSignature = (eventId: string, patch: CalendarPatch) =>
  `${eventId}|${patch.date ?? ''}|${patch.start_time ?? ''}|${patch.end_time ?? ''}|${patch.title ?? ''}`;

export function SchedulePatchProvider({ children }: { children: React.ReactNode }) {
  const [currentSuggestion, setCurrentSuggestion] = useState<SuggestedCalendarPatch | null>(null);
  const [appliedPatches, setAppliedPatches] = useState<AppliedCalendarPatch[]>(() => readArrayFromStorage(APPLIED_PATCHES_STORAGE_KEY));
  const [dismissedSignatures, setDismissedSignatures] = useState<string[]>(() => readArrayFromStorage(DISMISSED_PATCHES_STORAGE_KEY));
  const [toastQueue, setToastQueue] = useState<LiveEventToast[]>([]);
  const [currentToast, setCurrentToast] = useState<LiveEventToast | null>(null);
  const seenEventIds = useRef<Set<string>>(new Set());
  const suggestionInFlight = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(APPLIED_PATCHES_STORAGE_KEY, JSON.stringify(appliedPatches));
    }
  }, [appliedPatches]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISSED_PATCHES_STORAGE_KEY, JSON.stringify(dismissedSignatures));
    }
  }, [dismissedSignatures]);

  useEffect(() => {
    if (!USE_REAL_API) return;

    let cancelled = false;

    const fetchLiveEvents = async () => {
      try {
        const feed = await getDashboardFeed(
          DEFAULT_DASHBOARD_ROLE,
          DEFAULT_DASHBOARD_STAFF_ID,
          undefined,
          undefined,
          50
        );

        const items = feed.items || [];
        const liveEventIds = new Set(items.map((item) => item.id));

        seenEventIds.current = new Set(
          Array.from(seenEventIds.current).filter((id: string) => liveEventIds.has(id))
        );

        setDismissedSignatures((previous) =>
          previous.filter((signature) => liveEventIds.has(signature.split('|')[0] ?? ''))
        );
        setAppliedPatches((previous) =>
          previous.filter((patch) => liveEventIds.has(patch.sourceEventId))
        );

        const freshItems = items.filter(
          (item) => !seenEventIds.current.has(item.id) && !item.id.startsWith('SEED-EVENT-')
        );

        if (freshItems.length === 0) {
          if (!items.some((item) => item.id === suggestionInFlight.current)) {
            suggestionInFlight.current = null;
          }
          if (!items.some((item) => item.id === currentSuggestion?.sourceEventId)) {
            setCurrentSuggestion(null);
          }
          return;
        }

        for (const item of freshItems) {
          if (cancelled) return;

          try {
            const detail = await getEventDetail(item.id);
            if (cancelled) return;

            const patch = detail.assist?.calendar_patch;
            const shouldRender = patch?.should_render === true;

            if (shouldRender && patch) {
              const signature = buildPatchSignature(item.id, patch);
              const alreadyApplied = appliedPatches.some((entry) => buildPatchSignature(entry.sourceEventId, entry) === signature);
              const alreadyDismissed = dismissedSignatures.includes(signature);

              if (!alreadyApplied && !alreadyDismissed && suggestionInFlight.current !== item.id) {
                suggestionInFlight.current = item.id;
                setCurrentSuggestion(buildSuggestion(item.id, detail));
              }
            } else {
              setToastQueue((previous) => [
                ...previous,
                {
                  eventId: item.id,
                  title: item.title,
                  summary: item.summary,
                  senderLabel: item.sender_label,
                },
              ]);
            }

            seenEventIds.current.add(item.id);
          } catch (error) {
            console.warn(`Will retry live event ${item.id} on next refresh`, error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch live event notifications', error);
      }
    };

    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [appliedPatches, currentSuggestion?.sourceEventId, dismissedSignatures]);

  useEffect(() => {
    if (currentToast || toastQueue.length === 0) return;

    const [nextToast, ...rest] = toastQueue;
    setCurrentToast(nextToast);
    setToastQueue(rest);
  }, [currentToast, toastQueue]);

  useEffect(() => {
    if (!currentToast) return;

    const timeout = setTimeout(() => {
      setCurrentToast(null);
    }, 4200);

    return () => clearTimeout(timeout);
  }, [currentToast]);

  const contextValue = useMemo<SchedulePatchContextType>(
    () => ({
      currentSuggestion,
      appliedPatches,
      currentToast,
      dismissSuggestion: () => {
        if (!currentSuggestion) return;
        const signature = buildPatchSignature(currentSuggestion.sourceEventId, currentSuggestion.patch);
        suggestionInFlight.current = null;
        setDismissedSignatures((previous) => Array.from(new Set([...previous, signature])));
        setCurrentSuggestion(null);
      },
      applySuggestion: (patch) => {
        const signature = buildPatchSignature(patch.sourceEventId, patch);
        suggestionInFlight.current = null;
        setAppliedPatches((previous) => {
          const next = previous.filter((entry) => entry.sourceEventId !== patch.sourceEventId);
          return [...next, patch];
        });
        setDismissedSignatures((previous) => previous.filter((entry) => entry !== signature));
        setCurrentSuggestion(null);
      },
    }),
    [appliedPatches, currentSuggestion, currentToast]
  );

  return <SchedulePatchContext.Provider value={contextValue}>{children}</SchedulePatchContext.Provider>;
}

export function useSchedulePatch() {
  const context = useContext(SchedulePatchContext);
  if (!context) throw new Error('useSchedulePatch must be used within SchedulePatchProvider');
  return context;
}

const buildSuggestion = (eventId: string, detail: EventDetail): SuggestedCalendarPatch => ({
  sourceEventId: eventId,
  title: detail.title,
  summary: detail.summary,
  senderName: detail.sender?.name,
  senderGroup: detail.sender?.group,
  patch: {
    should_render: detail.assist?.calendar_patch?.should_render === true,
    patch_type: detail.assist?.calendar_patch?.patch_type ?? 'meeting',
    date: detail.assist?.calendar_patch?.date ?? '',
    start_time: detail.assist?.calendar_patch?.start_time ?? '14:00',
    end_time: detail.assist?.calendar_patch?.end_time ?? '15:00',
    title: detail.assist?.calendar_patch?.title ?? detail.title,
    location: detail.assist?.calendar_patch?.location ?? 'Room 204',
  },
});
