import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardBrief, getDashboardFeed } from '../services/api';
import { DashboardBrief, DashboardFeedItem } from '../types/api';
import { useTasks } from '../contexts/TasksContext';
import {
  DEFAULT_DASHBOARD_ROLE,
  DEFAULT_DASHBOARD_STAFF_ID,
  REFRESH_INTERVAL_MS,
} from '../config/runtime';
import { computeWellbeingMetrics } from '../utils/wellbeing';

export default function Home() {
  const navigate = useNavigate();
  const { tasks: actionItems, toggleTaskDone, doneTasks } = useTasks();
  const [brief, setBrief] = useState<DashboardBrief | null>(null);
  const [recentItems, setRecentItems] = useState<DashboardFeedItem[]>([]);
  const [sortMode, setSortMode] = useState<'urgency' | 'newest' | 'theme'>('urgency');

  const wellbeing = useMemo(
    () => computeWellbeingMetrics(actionItems, doneTasks, brief?.stats.deadlines),
    [actionItems, doneTasks, brief?.stats.deadlines]
  );
  const pendingActionItems = wellbeing.pendingActionItems;
  const highlightedCalendarPatch = [...recentItems, ...pendingActionItems]
    .map(item => item.assist?.calendar_patch)
    .find(patch => patch?.should_render);

  const scheduleHighlight = highlightedCalendarPatch?.should_render
    ? `${highlightedCalendarPatch.title}${highlightedCalendarPatch.start_time ? ` at ${highlightedCalendarPatch.start_time}` : ''}`
    : null;

  const suggestedActions = pendingActionItems.slice(0, 2);
  const refreshSeconds = Math.round(REFRESH_INTERVAL_MS / 1000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const briefData = await getDashboardBrief(DEFAULT_DASHBOARD_ROLE, DEFAULT_DASHBOARD_STAFF_ID);
        setBrief(briefData);
        
        // Fetch recent items for Inbox preview (no action required filter)
        const recentFeed = await getDashboardFeed(
          DEFAULT_DASHBOARD_ROLE,
          DEFAULT_DASHBOARD_STAFF_ID,
          undefined,
          undefined,
          4
        );
        setRecentItems(recentFeed.items || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const renderTodoItem = (item: DashboardFeedItem, isUrgent: boolean) => {
    const isDone = doneTasks.has(item.id);
    
    // Determine tag colors based on sender_label or category
    let tagClass = "bg-brand-teal-bg text-brand-teal-text";
    if (item.sender_label?.toLowerCase().includes('admin')) tagClass = "bg-brand-blue-bg text-brand-blue-text";
    if (item.sender_label?.toLowerCase().includes('parent')) tagClass = "bg-brand-amber-bg text-brand-amber-text";

    return (
      <div 
        key={item.id} 
        onClick={() => toggleTaskDone(item.id)}
        className={`flex items-start gap-[10px] p-[9px_10px] rounded-[10px] mb-[5px] border-[0.5px] cursor-pointer transition-colors duration-150 ${
          isUrgent 
            ? 'bg-brand-red-bg border-[rgba(226,75,74,0.15)] hover:bg-[#f8dede]' 
            : 'bg-surface2 border-border-light hover:bg-bg'
        }`}
      >
        <div className={`w-4 h-4 rounded border-[1.5px] shrink-0 mt-[1px] flex items-center justify-center transition-colors duration-150 ${
          isDone 
            ? 'bg-brand-teal border-brand-teal' 
            : isUrgent ? 'border-brand-red' : 'border-border-strong'
        }`}>
          {isDone && (
            <div className="w-2 h-[5px] border-l-[1.5px] border-b-[1.5px] border-white -rotate-45 -translate-y-[1px]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium mb-[2px] leading-[1.3] ${
            isDone ? 'line-through opacity-50' : isUrgent ? 'text-brand-red-text' : 'text-text-main'
          }`}>
            {item.title}
          </div>
          <div className="flex items-center gap-[6px] flex-wrap">
            <span className="text-[11.5px] text-text-3">{item.time_label}</span>
            {item.sender_label && (
              <span className={`text-[10px] px-[6px] py-[1px] rounded font-medium ${tagClass}`}>
                {item.sender_label}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTodoList = () => {
    if (sortMode === 'urgency') {
      const urgent = actionItems.filter(i => i.urgent);
      const important = actionItems.filter(i => !i.urgent && i.important);
      const regular = actionItems.filter(i => !i.urgent && !i.important);
      
      return (
        <>
          {urgent.length > 0 && (
            <>
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-text-3 mt-0 mb-[6px]">Urgent</div>
              {urgent.map(item => renderTodoItem(item, true))}
            </>
          )}
          {important.length > 0 && (
            <>
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-text-3 mt-[10px] mb-[6px]">Important</div>
              {important.map(item => renderTodoItem(item, false))}
            </>
          )}
          {regular.length > 0 && (
            <>
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-text-3 mt-[10px] mb-[6px]">Regular</div>
              {regular.map(item => renderTodoItem(item, false))}
            </>
          )}
        </>
      );
    } else if (sortMode === 'theme') {
      const columns = [
        {
          title: 'Meetings/Calls',
          items: actionItems.filter(i => ['action_request', 'schedule_change'].includes(i.category))
        },
        {
          title: 'E-mail',
          items: actionItems.filter(i => ['general', 'administrative_notice'].includes(i.category))
        },
        {
          title: 'Questions & Forms',
          items: actionItems.filter(i => ['absence_report', 'deadline_or_form'].includes(i.category))
        },
        {
          title: 'Class & Admin',
          items: actionItems.filter(i => ['class', 'admin'].includes(i.category))
        },
        {
          title: 'Other',
          items: actionItems.filter(i => !['action_request', 'schedule_change', 'general', 'administrative_notice', 'absence_report', 'deadline_or_form', 'class', 'admin'].includes(i.category))
        }
      ].filter(col => col.items.length > 0);

      return (
        <>
          {columns.map(col => (
            <div key={col.title}>
              <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-text-3 mt-[10px] mb-[6px]">{col.title}</div>
              {col.items.map(item => renderTodoItem(item, item.urgent || false))}
            </div>
          ))}
        </>
      );
    } else {
      // newest
      return (
        <>
          <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-text-3 mt-0 mb-[6px]">All Tasks</div>
          {actionItems.map(item => renderTodoItem(item, item.urgent || false))}
        </>
      );
    }
  };

  return (
    <div className="grid grid-cols-[340px_1fr_260px] gap-4 w-full">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Summary Card */}
        <div className="bg-surface rounded-xl border-[0.5px] border-border-light p-4 px-[18px] shadow-card">
          <div className="font-display text-[21px] text-text-main leading-[1.2] mb-3">
            {brief?.greeting || "Good morning."}
          </div>
          
          <div className="text-[10.5px] font-bold tracking-[0.07em] uppercase text-text-3 mb-[6px]">Today</div>
          <div className="flex flex-col gap-[5px]">
            {scheduleHighlight && (
              <div className="flex items-start gap-2 text-[13px] text-text-2 leading-[1.45]">
                <div className="w-[5px] h-[5px] rounded-full bg-brand-amber mt-[6px] shrink-0" />
                {scheduleHighlight}
              </div>
            )}
            {brief?.focus?.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-[13px] text-text-2 leading-[1.45]">
                <div className="w-[5px] h-[5px] rounded-full bg-brand-red mt-[6px] shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <div className="text-[10.5px] font-bold tracking-[0.07em] uppercase text-text-3 mb-[6px] mt-3">Suggested actions</div>
          <div className="flex flex-col gap-[5px]">
            {(suggestedActions.length > 0 ? suggestedActions : recentItems.slice(0, 2)).map(item => (
              <div key={item.id} className="flex items-start gap-2 text-[13px] text-text-main leading-[1.45]">
                <span className="text-[12px] text-brand-teal mt-[1px] shrink-0 font-semibold">→</span>
                {item.title}
              </div>
            ))}
          </div>

          <div className="text-[10.5px] text-text-3 flex items-center gap-[5px] mt-3 pt-[10px] border-t-[0.5px] border-border-light">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-brand-teal shrink-0 animate-pulse-dot" />
            Summary updates every {refreshSeconds} seconds
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-surface rounded-xl border-[0.5px] border-border-light p-4 px-[18px] shadow-card flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">Schedule</div>
            <div 
              onClick={() =>
                navigate(
                  '/calendar',
                  highlightedCalendarPatch?.should_render
                    ? {
                        state: {
                          calendarPatch: highlightedCalendarPatch,
                          sourceEventTitle: highlightedCalendarPatch.title,
                          sourceSender: 'Insight Assist',
                        },
                      }
                    : undefined
                )
              }
              className="text-[11px] font-medium text-text-3 hover:text-text-main cursor-pointer transition-colors"
            >
              View all →
            </div>
          </div>
          <div className="flex gap-3 mb-[14px] flex-wrap">
            <div className="flex items-center gap-[5px] text-[11px] text-text-3">
              <div className="w-2 h-2 rounded-[2px] shrink-0 bg-brand-teal" /> Class
            </div>
            <div className="flex items-center gap-[5px] text-[11px] text-text-3">
              <div className="w-2 h-2 rounded-[2px] shrink-0 bg-brand-purple" /> Meeting
            </div>
            <div className="flex items-center gap-[5px] text-[11px] text-text-3">
              <div className="w-2 h-2 rounded-[2px] shrink-0 bg-brand-red" /> New
            </div>
          </div>

          <div className="grid grid-cols-[38px_1fr_1fr] gap-x-2">
            <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 pb-2 border-b-[0.5px] border-border-light mb-1" />
            <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 pb-2 border-b-[0.5px] border-border-light mb-1">Today · Fri 14</div>
            <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 pb-2 border-b-[0.5px] border-border-light mb-1">Tomorrow · Sat 15</div>

            {/* 08:15 */}
            <div className="text-[10px] text-text-3 h-[52px] flex items-start justify-end pr-[7px] pt-[6px] border-r-[0.5px] border-border-light">08:15</div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-teal-bg border-brand-teal">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-teal-text">Mathematics 1A</div>
                <div className="text-[10px] opacity-75 text-brand-teal-text">08:15 – 09:00</div>
              </div>
            </div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-teal-bg border-brand-teal">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-teal-text">Mathematics 3A</div>
                <div className="text-[10px] opacity-75 text-brand-teal-text">08:15 – 09:00</div>
              </div>
            </div>

            {/* 09:10 */}
            <div className="text-[10px] text-text-3 h-[52px] flex items-start justify-end pr-[7px] pt-[6px] border-r-[0.5px] border-border-light">09:10</div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px] bg-transparent" />
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-teal-bg border-brand-teal">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-teal-text">Biology 1B</div>
                <div className="text-[10px] opacity-75 text-brand-teal-text">09:10 – 09:55</div>
              </div>
            </div>

            {/* 10:00 */}
            <div className="text-[10px] text-text-3 h-[52px] flex items-start justify-end pr-[7px] pt-[6px] border-r-[0.5px] border-border-light">10:00</div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-purple-bg border-brand-purple">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-purple-text">Staff meeting</div>
                <div className="text-[10px] opacity-75 text-brand-purple-text">10:00 – 10:45</div>
              </div>
            </div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px] bg-transparent" />

            {/* 11:00 */}
            <div className="text-[10px] text-text-3 h-[52px] flex items-start justify-end pr-[7px] pt-[6px] border-r-[0.5px] border-border-light">11:00</div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-teal-bg border-brand-teal">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-teal-text">Physics 2B</div>
                <div className="text-[10px] opacity-75 text-brand-teal-text">11:00 – 11:45</div>
              </div>
            </div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px] bg-transparent" />

            {/* 13:00 */}
            <div className="text-[10px] text-text-3 h-[52px] flex items-start justify-end pr-[7px] pt-[6px] border-r-[0.5px] border-border-light">13:00</div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px] bg-transparent" />
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-purple-bg border-brand-purple">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-purple-text">Curriculum review</div>
                <div className="text-[10px] opacity-75 text-brand-purple-text">13:00 – 14:30</div>
              </div>
            </div>

            {/* 14:30 */}
            <div className="text-[10px] text-text-3 h-[52px] flex items-start justify-end pr-[7px] pt-[6px] border-r-[0.5px] border-border-light">14:30</div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px]">
              <div className="w-full h-[44px] rounded-lg p-[5px_8px] flex flex-col justify-center gap-[1px] border-l-4 bg-brand-red-bg border-brand-red">
                <div className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-brand-red-text">Parent call — Müller</div>
                <div className="text-[10px] opacity-75 text-brand-red-text">14:30 – 15:00</div>
              </div>
            </div>
            <div className="h-[52px] border-b-[0.5px] border-dashed border-border-light flex items-center py-[3px] bg-transparent" />
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN */}
      <div className="flex flex-col gap-4">
        <div className="bg-surface rounded-xl border-[0.5px] border-border-light p-4 px-[18px] shadow-card flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-[14px]">
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3">To-do</div>
              <div 
                onClick={() => navigate('/tasks')}
                className="text-[11px] font-medium text-text-3 hover:text-text-main cursor-pointer transition-colors"
              >
                View all →
              </div>
            </div>
            <div className="flex gap-1">
              {['urgency', 'newest', 'theme'].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setSortMode(mode as any)}
                  className={`text-[11px] px-[9px] py-[3px] rounded-md border-[0.5px] font-sans transition-colors duration-150 capitalize ${
                    sortMode === mode 
                      ? 'bg-text-main text-white border-text-main' 
                      : 'bg-transparent text-text-2 border-border-strong hover:bg-bg'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[420px] pr-[2px] scroll-area flex-1">
            {renderTodoList()}
          </div>

          <div className="flex items-center gap-2 p-[8px_10px] rounded-[10px] border-[0.5px] border-dashed border-border-strong text-text-3 text-[13px] cursor-pointer transition-colors duration-150 mt-[6px] hover:bg-bg hover:text-text-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/>
            </svg>
            Add task
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Urgent Reminder */}
        {(() => {
          // Find the most urgent task or upcoming event
          const urgentTasks = actionItems.filter(t => !doneTasks.has(t.id) && t.urgent);
          const nextTask = urgentTasks.length > 0 ? urgentTasks[0] : null;
          
          // For events, we'd ideally check the current time against the calendar events
          // For now, we'll just show the first event of the day if there are no urgent tasks
          // Or a generic reminder if neither
          
          if (nextTask) {
            return (
              <div className="bg-brand-red-bg rounded-xl border-[0.5px] border-[rgba(226,75,74,0.2)] p-4 px-[18px] shadow-card">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Urgent Task</div>
                <div className="flex items-center gap-[10px] p-[10px] bg-[rgba(255,255,255,0.6)] rounded-[10px] border-[0.5px] border-[rgba(226,75,74,0.15)]">
                  <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.6">
                      <circle cx="8" cy="8" r="6"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-red-text">{nextTask.title}</div>
                    <div className="text-[11.5px] text-brand-red-text opacity-80">Due soon · {nextTask.category}</div>
                  </div>
                </div>
              </div>
            );
          }
          
          if (highlightedCalendarPatch?.should_render) {
            return (
              <div className="bg-brand-purple-bg rounded-xl border-[0.5px] border-[rgba(83,74,183,0.2)] p-4 px-[18px] shadow-card">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Upcoming Meeting</div>
                <div className="flex items-center gap-[10px] p-[10px] bg-[rgba(255,255,255,0.6)] rounded-[10px] border-[0.5px] border-[rgba(83,74,183,0.15)]">
                  <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.6">
                      <circle cx="8" cy="8" r="6"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-brand-purple-text">{highlightedCalendarPatch.title}</div>
                    <div className="text-[11.5px] text-brand-purple-text opacity-80">
                      {highlightedCalendarPatch.date} · {highlightedCalendarPatch.start_time} – {highlightedCalendarPatch.end_time}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="bg-brand-teal-bg rounded-xl border-[0.5px] border-[rgba(56,163,165,0.2)] p-4 px-[18px] shadow-card">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Next Up</div>
              <div className="flex items-center gap-[10px] p-[10px] bg-[rgba(255,255,255,0.6)] rounded-[10px] border-[0.5px] border-[rgba(56,163,165,0.15)]">
                <div className="w-8 h-8 rounded-lg bg-brand-teal flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.6">
                    <circle cx="8" cy="8" r="6"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-brand-teal-text">Mathematics 1A</div>
                  <div className="text-[11.5px] text-brand-teal-text opacity-80">Room 101 · 08:15 – 09:00</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Wellbeing */}
        <div className="bg-surface rounded-xl border-[0.5px] border-border-light p-4 px-[18px] shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Wellbeing index</div>
          <div className="flex items-center gap-[14px] py-1 pb-2">
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                <circle cx="32" cy="32" r="26" stroke="var(--color-border-light)" strokeWidth="5"/>
                <circle cx="32" cy="32" r="26" stroke="var(--color-brand-teal)" strokeWidth="5" strokeDasharray="163.4" strokeDashoffset={wellbeing.strokeOffset} strokeLinecap="round" transform="rotate(-90 32 32)"/>
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] font-semibold text-text-main">{wellbeing.score}</div>
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium text-text-main mb-[3px]">{wellbeing.label}</div>
              <div className="text-[11.5px] text-text-3 leading-[1.4]">Based on workload and pending urgencies today.</div>
            </div>
          </div>
          <div className="mt-[10px]">
            <div className="flex justify-between text-[11px] text-text-3 mb-1"><span>Workload</span><span>{wellbeing.workloadLabel}</span></div>
            <div className="h-[5px] rounded-[3px] bg-border-light overflow-hidden">
              <div className="h-full rounded-[3px] bg-brand-amber" style={{ width: `${wellbeing.workloadPercent}%` }} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-text-3 mb-1"><span>Urgencies</span><span>{wellbeing.urgencyLabel}</span></div>
            <div className="h-[5px] rounded-[3px] bg-border-light overflow-hidden">
              <div className="h-full rounded-[3px] bg-brand-teal" style={{ width: `${wellbeing.urgencyPercent}%` }} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-text-3 mb-1"><span>Deadlines</span><span>{wellbeing.deadlinesLabel}</span></div>
            <div className="h-[5px] rounded-[3px] bg-border-light overflow-hidden">
              <div className="h-full rounded-[3px] bg-brand-amber" style={{ width: `${wellbeing.deadlinesPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Inbox preview */}
        <div className="bg-surface rounded-xl border-[0.5px] border-border-light p-4 px-[18px] shadow-card flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Inbox preview</div>
          
          {recentItems.map((item, idx) => {
            let sourceClass = "bg-brand-blue-bg text-brand-blue-text";
            let sourceLabel = "@";
            if (item.category === 'moodle') {
              sourceClass = "bg-brand-amber-bg text-brand-amber-text";
              sourceLabel = "M";
            } else if (item.category === 'portal') {
              sourceClass = "bg-brand-green-bg text-brand-green-text";
              sourceLabel = "PP";
            }

            return (
              <div key={item.id} className={`flex items-start gap-2 py-2 cursor-pointer ${idx < recentItems.length - 1 ? 'border-b-[0.5px] border-border-light' : ''}`}>
                <div className={`w-[26px] h-[26px] rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 mt-[1px] ${sourceClass}`}>
                  {sourceLabel}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-text-main">{item.sender_label}</div>
                  <div className="text-[11.5px] text-text-3 whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10.5px] text-text-3">{item.time_label}</div>
                  {item.urgent && <div className="w-[6px] h-[6px] rounded-full bg-brand-red" />}
                </div>
              </div>
            );
          })}
          
          <div 
            onClick={() => navigate('/inbox')}
            className="text-center text-[12px] text-text-3 pt-2 cursor-pointer transition-colors duration-150 hover:text-text-main"
          >
            View all in Inbox →
          </div>
        </div>
      </div>
    </div>
  );
}
