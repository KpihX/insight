import { DEBUG_LIVE_EVENTS } from '../config/runtime';
import { useSchedulePatch } from '../contexts/SchedulePatchContext';

export default function LiveDebugPanel() {
  const { debugEntries, currentSuggestion, appliedPatches } = useSchedulePatch();

  if (!DEBUG_LIVE_EVENTS) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[140] w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.96)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md overflow-hidden">
      <div className="px-4 py-3 border-b border-border-light bg-surface2">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-3">Live debug</div>
        <div className="mt-1 text-[12px] text-text-2">
          suggestion: {currentSuggestion?.sourceEventId ?? 'none'} · applied: {appliedPatches.length}
        </div>
      </div>
      <div className="max-h-[260px] overflow-y-auto px-4 py-3 text-[11px] leading-[1.5] text-text-main bg-surface">
        {debugEntries.length === 0 ? (
          <div className="text-text-3">No live debug entries yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {debugEntries.slice().reverse().map((entry, index) => (
              <div key={`${index}-${entry}`} className="rounded-xl bg-surface2 border border-border-light px-3 py-2 break-words">
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
