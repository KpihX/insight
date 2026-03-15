import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEBUG_LIVE_EVENTS,
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
  debugEntries: string[];
  dismissSuggestion: () => void;
  applySuggestion: (patch: AppliedCalendarPatch) => void;
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

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const appliedPatchesEqual = (left: AppliedCalendarPatch[], right: AppliedCalendarPatch[]) =>
  left.length === right.length &&
  left.every((value, index) =>
    value.sourceEventId === right[index]?.sourceEventId &&
    value.title === right[index]?.title &&
    value.date === right[index]?.date &&
    value.start_time === right[index]?.start_time &&
    value.end_time === right[index]?.end_time &&
    value.patch_type === right[index]?.patch_type &&
    value.location === right[index]?.location &&
    value.savedAt === right[index]?.savedAt
  );

declare global {
  interface Window {
    __insightLiveDebug__?: string[];
  }
}

const debugLiveEvents = (...args: unknown[]) => {
  if (!DEBUG_LIVE_EVENTS) return;
  const line = args
    .map((value) => {
      if (typeof value === 'string') return value;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join(' ');

  if (typeof window !== 'undefined') {
    const next = [...(window.__insightLiveDebug__ ?? []), `${new Date().toISOString()} ${line}`].slice(-40);
    window.__insightLiveDebug__ = next;
    window.dispatchEvent(new CustomEvent('insight-live-debug'));
  }
  console.log('[insight/live-events]', ...args);
};

export function SchedulePatchProvider({ children }: { children: React.ReactNode }) {
  const [currentSuggestion, setCurrentSuggestion] = useState<SuggestedCalendarPatch | null>(null);
  const [appliedPatches, setAppliedPatches] = useState<AppliedCalendarPatch[]>(() => readArrayFromStorage(APPLIED_PATCHES_STORAGE_KEY));
  const [dismissedSignatures, setDismissedSignatures] = useState<string[]>(() => readArrayFromStorage(DISMISSED_PATCHES_STORAGE_KEY));
  const [debugEntries, setDebugEntries] = useState<string[]>(() =>
    typeof window !== 'undefined' ? window.__insightLiveDebug__ ?? [] : []
  );
  const seenEventIds = useRef<Set<string>>(new Set());
  const suggestionInFlight = useRef<string | null>(null);
  const appliedPatchesRef = useRef<AppliedCalendarPatch[]>(appliedPatches);
  const dismissedSignaturesRef = useRef<string[]>(dismissedSignatures);
  const currentSuggestionRef = useRef<SuggestedCalendarPatch | null>(currentSuggestion);
  const pollInFlight = useRef(false);

  useEffect(() => {
    appliedPatchesRef.current = appliedPatches;
  }, [appliedPatches]);

  useEffect(() => {
    dismissedSignaturesRef.current = dismissedSignatures;
  }, [dismissedSignatures]);

  useEffect(() => {
    currentSuggestionRef.current = currentSuggestion;
  }, [currentSuggestion]);

  useEffect(() => {
    if (!DEBUG_LIVE_EVENTS || typeof window === 'undefined') return;

    const sync = () => setDebugEntries([...(window.__insightLiveDebug__ ?? [])]);
    window.addEventListener('insight-live-debug', sync);
    return () => window.removeEventListener('insight-live-debug', sync);
  }, []);

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
      if (pollInFlight.current) {
        debugLiveEvents('poll skipped because previous run is still in flight');
        return;
      }

      pollInFlight.current = true;

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

        debugLiveEvents('feed snapshot', {
          itemCount: items.length,
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            action_required: item.action_required,
            assist: item.assist?.calendar_patch ?? null,
          })),
          currentSuggestion: currentSuggestionRef.current?.sourceEventId ?? null,
          appliedPatches: appliedPatchesRef.current.map((patch) => ({
            sourceEventId: patch.sourceEventId,
            title: patch.title,
            date: patch.date,
            start_time: patch.start_time,
            end_time: patch.end_time,
          })),
        });

        seenEventIds.current = new Set(
          Array.from(seenEventIds.current).filter((id: string) => liveEventIds.has(id))
        );

        setDismissedSignatures((previous) =>
          {
            const next = previous.filter((signature) => liveEventIds.has(signature.split('|')[0] ?? ''));
            return arraysEqual(previous, next) ? previous : next;
          }
        );
        setAppliedPatches((previous) =>
          {
            const next = previous.filter((patch) => liveEventIds.has(patch.sourceEventId));
            return appliedPatchesEqual(previous, next) ? previous : next;
          }
        );

        const freshItems = items.filter(
          (item) => !seenEventIds.current.has(item.id) && !item.id.startsWith('SEED-EVENT-')
        );

        debugLiveEvents('fresh items', freshItems.map((item) => ({
          id: item.id,
          title: item.title,
          assist: item.assist?.calendar_patch ?? null,
        })));

        if (freshItems.length === 0) {
          if (!items.some((item) => item.id === suggestionInFlight.current)) {
            suggestionInFlight.current = null;
          }
          if (!items.some((item) => item.id === currentSuggestionRef.current?.sourceEventId)) {
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

            debugLiveEvents('detail resolved', {
              id: item.id,
              title: detail.title,
              summary: detail.summary,
              patch,
              shouldRender,
            });

            if (shouldRender && patch) {
              const signature = buildPatchSignature(item.id, patch);
              const alreadyApplied = appliedPatchesRef.current.some((entry) => buildPatchSignature(entry.sourceEventId, entry) === signature);
              const alreadyDismissed = dismissedSignaturesRef.current.includes(signature);

              debugLiveEvents('time-event decision', {
                id: item.id,
                signature,
                alreadyApplied,
                alreadyDismissed,
                suggestionInFlight: suggestionInFlight.current,
              });

              if (!alreadyApplied && !alreadyDismissed && suggestionInFlight.current !== item.id) {
                suggestionInFlight.current = item.id;
                debugLiveEvents('opening schedule suggestion', {
                  id: item.id,
                  title: detail.title,
                  patch,
                });
                setCurrentSuggestion(buildSuggestion(item.id, detail));
              }
            }

            seenEventIds.current.add(item.id);
            debugLiveEvents('marked as seen', item.id);
          } catch (error) {
            console.warn(`Will retry live event ${item.id} on next refresh`, error);
            debugLiveEvents('detail fetch failed, will retry', {
              id: item.id,
              error,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch live event notifications', error);
        debugLiveEvents('feed fetch failed', error);
      } finally {
        pollInFlight.current = false;
      }
    };

    fetchLiveEvents();
    const interval = setInterval(fetchLiveEvents, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const contextValue = useMemo<SchedulePatchContextType>(
    () => ({
      currentSuggestion,
      appliedPatches,
      debugEntries,
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
    [appliedPatches, currentSuggestion, debugEntries]
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
