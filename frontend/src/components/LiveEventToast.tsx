import { useSchedulePatch } from '../contexts/SchedulePatchContext';

export default function LiveEventToast() {
  const { currentToast } = useSchedulePatch();

  if (!currentToast) return null;

  return (
    <div className="fixed top-[68px] left-1/2 -translate-x-1/2 z-[110] pointer-events-none px-4 animate-live-toast-in">
      <div className="pointer-events-auto min-w-[340px] max-w-[560px] rounded-2xl border border-[rgba(15,110,86,0.16)] bg-[rgba(255,255,255,0.92)] shadow-[0_16px_50px_rgba(15,110,86,0.16)] backdrop-blur-[10px] px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-teal-bg text-brand-teal flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 4.5h10M3 8h10M3 11.5h6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-teal-text">
              New live event{currentToast.senderLabel ? ` · ${currentToast.senderLabel}` : ''}
            </div>
            <div className="text-[14px] font-semibold text-text-main leading-[1.3] mt-0.5">
              {currentToast.title}
            </div>
            <div className="text-[12px] text-text-2 leading-[1.45] mt-1">
              {currentToast.summary}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
