import { useSchedulePatch } from '../contexts/SchedulePatchContext';

export default function LiveEventToast() {
  const { currentToast } = useSchedulePatch();

  if (!currentToast) return null;

  return (
    <div className="fixed top-[68px] right-4 z-[130] w-[min(560px,calc(100vw-2rem))] animate-live-toast-in">
      <div className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.96)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md overflow-hidden">
        <div className="px-4 py-3 border-b border-border-light bg-[linear-gradient(135deg,rgba(226,245,241,0.95),rgba(255,255,255,0.95))]">
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-teal-text">
            New live event{currentToast.senderLabel ? ` · ${currentToast.senderLabel}` : ''}
          </div>
          <div className="mt-1 text-[15px] font-semibold text-text-main leading-[1.35]">
            {currentToast.title}
          </div>
        </div>
        <div className="px-4 py-3 text-[13px] text-text-2 leading-[1.5] bg-surface">
          {currentToast.summary}
        </div>
      </div>
    </div>
  );
}
