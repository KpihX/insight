import { useEffect, useState } from 'react';
import { useSchedulePatch } from '../contexts/SchedulePatchContext';

export default function SchedulePatchDialog() {
  const { currentSuggestion, applySuggestion, dismissSuggestion } = useSchedulePatch();
  const [draft, setDraft] = useState({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
  });

  useEffect(() => {
    if (!currentSuggestion) return;
    setDraft({
      title: currentSuggestion.patch.title ?? currentSuggestion.title,
      date: currentSuggestion.patch.date ?? '',
      start_time: currentSuggestion.patch.start_time ?? '',
      end_time: currentSuggestion.patch.end_time ?? '',
      location: currentSuggestion.patch.location ?? 'Room 204',
    });
  }, [currentSuggestion]);

  if (!currentSuggestion) return null;

  return (
  <div className="fixed inset-0 z-[120] flex items-center sm:items-center justify-center bg-[rgba(20,17,10,0.18)] backdrop-blur-[2px] px-3 sm:px-4 py-4 sm:py-6">
    {/* Main Container: Added max-h-full and flex flex-col to manage internal height */}
    <div className="w-full max-w-[560px] max-h-full flex flex-col rounded-[24px] border border-[rgba(0,0,0,0.08)] bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.16)] overflow-hidden">
      
      {/* Header: Fixed at the top */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border-light bg-[linear-gradient(135deg,rgba(250,238,218,0.95),rgba(255,255,255,0.95))] shrink-0">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-10 h-10 rounded-2xl bg-[#E7A21A] text-white flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8 1L1 14h14L8 1z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 5.5v4M8 11.5v.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A5A00]">Insight scheduling suggestion</div>
            <h2 className="font-display text-[22px] sm:text-[27px] leading-[1.1] text-text-main mt-1">A new meeting can be added to the timetable.</h2>
            <p className="text-[13px] text-text-2 mt-2 leading-[1.5]">
              {currentSuggestion.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Body: Added overflow-y-auto so the form scrolls if height is limited */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 grid gap-5 overflow-y-auto">
        <div className="rounded-2xl border border-[rgba(15,110,86,0.14)] bg-[rgba(225,245,238,0.75)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-teal-text mb-2">AI-provided summary</div>
          <div className="text-[13px] text-brand-teal-text leading-[1.6]">
            {currentSuggestion.summary}
          </div>
        </div>

        <div className="rounded-2xl border border-border-light bg-surface2 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-3 mb-2">Detected by backend</div>
          <div className="text-[13px] text-text-main leading-[1.6]">
            <div><span className="font-semibold">Event:</span> {currentSuggestion.title}</div>
            {currentSuggestion.senderName && (
              <div><span className="font-semibold">From:</span> {currentSuggestion.senderName}</div>
            )}
            <div><span className="font-semibold">Proposed slot:</span> {currentSuggestion.patch.date} · {currentSuggestion.patch.start_time} – {currentSuggestion.patch.end_time}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[12px] font-semibold text-text-main block mb-1.5">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
              className="w-full bg-bg border border-border-strong rounded-xl px-3 py-2.5 text-[13px] text-text-main focus:outline-none focus:border-[#E7A21A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-text-main block mb-1.5">Date</label>
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft((previous) => ({ ...previous, date: event.target.value }))}
              className="w-full bg-bg border border-border-strong rounded-xl px-3 py-2.5 text-[13px] text-text-main focus:outline-none focus:border-[#E7A21A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-text-main block mb-1.5">Location</label>
            <input
              type="text"
              value={draft.location}
              onChange={(event) => setDraft((previous) => ({ ...previous, location: event.target.value }))}
              className="w-full bg-bg border border-border-strong rounded-xl px-3 py-2.5 text-[13px] text-text-main focus:outline-none focus:border-[#E7A21A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-text-main block mb-1.5">Start time</label>
            <input
              type="time"
              value={draft.start_time}
              onChange={(event) => setDraft((previous) => ({ ...previous, start_time: event.target.value }))}
              className="w-full bg-bg border border-border-strong rounded-xl px-3 py-2.5 text-[13px] text-text-main focus:outline-none focus:border-[#E7A21A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-text-main block mb-1.5">End time</label>
            <input
              type="time"
              value={draft.end_time}
              onChange={(event) => setDraft((previous) => ({ ...previous, end_time: event.target.value }))}
              className="w-full bg-bg border border-border-strong rounded-xl px-3 py-2.5 text-[13px] text-text-main focus:outline-none focus:border-[#E7A21A]"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[rgba(231,162,26,0.45)] bg-[rgba(250,238,218,0.45)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A5A00] mb-2">What will happen</div>
          <div className="text-[13px] text-[#8A5A00] leading-[1.6]">
            Once validated, the meeting will appear on both the Home schedule preview and the full Calendar timetable.
          </div>
        </div>
      </div>

      {/* Footer: Fixed at the bottom */}
      <div className="px-4 sm:px-6 py-4 border-t border-border-light flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-surface2 shrink-0">
        <button
          onClick={dismissSuggestion}
          className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-text-2 hover:text-text-main transition-colors text-left sm:text-center"
        >
          Dismiss for now
        </button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() =>
              applySuggestion({
                sourceEventId: currentSuggestion.sourceEventId,
                title: draft.title,
                date: draft.date,
                start_time: draft.start_time,
                end_time: draft.end_time,
                patch_type: currentSuggestion.patch.patch_type ?? 'meeting',
                location: draft.location,
                savedAt: new Date().toISOString(),
              })
            }
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#E7A21A] hover:bg-[#d19318] transition-colors w-full sm:w-auto"
          >
            Validate and add to timetable
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
