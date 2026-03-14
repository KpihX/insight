import React, { useMemo, useState } from 'react';
import { DashboardFeedItem } from '../types/api';
import { useTasks } from '../contexts/TasksContext';
import { computeWellbeingMetrics } from '../utils/wellbeing';

export default function Tasks() {
  const { tasks: items, addTask, toggleTaskDone, doneTasks } = useTasks();
  const [sortMode, setSortMode] = useState<'theme' | 'urgency' | 'newest'>('theme');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<DashboardFeedItem>>({
    title: '',
    category: 'general',
    urgent: false,
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title?.trim()) return;
    
    const task: DashboardFeedItem = {
      id: `manual_${Date.now()}`,
      category: newTask.category || 'general',
      urgent: newTask.urgent || false,
      important: false,
      action_required: true,
      title: newTask.title.trim(),
      summary: '',
      sender_label: 'Self',
      time_label: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'new'
    };
    
    addTask(task);
    setNewTask({ title: '', category: 'general', urgent: false });
    setIsModalOpen(false);
  };

  const urgentTasks = items.filter(i => i.urgent);
  const pendingUrgentTasks = urgentTasks.filter(item => !doneTasks.has(item.id));
  const mainTasks = items.filter(i => !i.urgent);
  const wellbeing = useMemo(() => computeWellbeingMetrics(items, doneTasks), [items, doneTasks]);
  const highlightedCalendarPatch = items
    .map(item => item.assist?.calendar_patch)
    .find(patch => patch?.should_render);

  // Grouping logic based on sort mode
  const getColumns = () => {
    if (sortMode === 'theme') {
      return [
        {
          title: 'Meetings/Calls',
          items: mainTasks.filter(i => ['action_request', 'schedule_change'].includes(i.category))
        },
        {
          title: 'E-mail',
          items: mainTasks.filter(i => ['general', 'administrative_notice'].includes(i.category))
        },
        {
          title: 'Questions & Forms',
          items: mainTasks.filter(i => ['absence_report', 'deadline_or_form'].includes(i.category))
        },
        {
          title: 'Class & Admin',
          items: mainTasks.filter(i => ['class', 'admin'].includes(i.category))
        },
        {
          title: 'Other',
          items: mainTasks.filter(i => !['action_request', 'schedule_change', 'general', 'administrative_notice', 'absence_report', 'deadline_or_form', 'class', 'admin'].includes(i.category))
        }
      ].filter(col => col.items.length > 0);
    } else if (sortMode === 'urgency') {
      return [
        {
          title: 'Important',
          items: mainTasks.filter(i => i.important)
        },
        {
          title: 'Normal',
          items: mainTasks.filter(i => !i.important)
        }
      ];
    } else {
      // Newest (mocking by just splitting them arbitrarily or by time_label if possible)
      // For simplicity, we'll just put them all in one or two columns based on "AM" vs "PM" or "Yesterday"
      return [
        {
          title: 'Today',
          items: mainTasks.filter(i => i.time_label.includes('AM') || i.time_label.includes('PM'))
        },
        {
          title: 'Earlier',
          items: mainTasks.filter(i => !i.time_label.includes('AM') && !i.time_label.includes('PM'))
        }
      ];
    }
  };

  const columns = getColumns();

  const renderTask = (item: DashboardFeedItem, isUrgent = false) => {
    const isDone = doneTasks.has(item.id);
    return (
      <div 
        key={item.id} 
        onClick={() => toggleTaskDone(item.id)}
        className="flex items-start gap-3 mb-3 cursor-pointer group"
      >
        <div className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-[2px] flex items-center justify-center transition-colors duration-150 ${
          isDone 
            ? 'bg-text-main border-text-main' 
            : isUrgent ? 'border-brand-red-text' : 'border-text-main group-hover:border-text-2'
        }`}>
          {isDone && (
            <div className="w-2 h-[5px] border-l-[1.5px] border-b-[1.5px] border-white -rotate-45 -translate-y-[1px]" />
          )}
        </div>
        <div className={`flex-1 text-[14px] leading-[1.4] transition-colors ${
          isDone ? 'line-through opacity-50' : isUrgent ? 'text-brand-red-text font-medium' : 'text-text-main'
        }`}>
          {item.title}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-92px)] w-full">
      {/* Top Bar */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <span className="text-[14px] font-semibold text-text-main mr-2">Sort by:</span>
        {['urgency', 'theme', 'newest'].map(mode => (
          <button 
            key={mode}
            onClick={() => setSortMode(mode as any)}
            className={`text-[13px] px-3 py-1 rounded-md font-sans transition-colors duration-150 capitalize font-medium ${
              sortMode === mode 
                ? 'bg-surface shadow-sm text-text-main' 
                : 'bg-transparent text-text-2 hover:bg-surface2'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Columns Area */}
        <div className="flex-1 bg-surface rounded-xl border-[0.5px] border-border-light shadow-card flex overflow-hidden">
          {columns.map((col, idx) => (
            <div 
              key={col.title} 
              className={`flex-1 flex flex-col ${idx < columns.length - 1 ? 'border-r-[0.5px] border-border-light' : ''}`}
            >
              <div className="p-4 border-b-[0.5px] border-border-light">
                <h2 className="font-display text-[18px] text-text-main">{col.title}</h2>
              </div>
              <div className="flex-1 p-4 overflow-y-auto scroll-area">
                {col.items.length > 0 ? (
                  col.items.map(item => renderTask(item))
                ) : (
                  <div className="text-[13px] text-text-3 italic">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4 overflow-y-auto scroll-area pr-1">
          
          {/* Urgent Reminder (Copied from Home) */}
          {pendingUrgentTasks.length > 0 ? (
            <div className="bg-brand-red-bg rounded-xl border-[0.5px] border-[rgba(226,75,74,0.2)] p-4 px-[18px] shadow-card">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Reminder</div>
              <div className="flex items-center gap-[10px] p-[10px] bg-[rgba(255,255,255,0.6)] rounded-[10px] border-[0.5px] border-[rgba(226,75,74,0.15)]">
                <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.6">
                    <circle cx="8" cy="8" r="6"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-brand-red-text">{pendingUrgentTasks[0].title}</div>
                  <div className="text-[11.5px] text-brand-red-text opacity-80">
                    Due soon · {pendingUrgentTasks[0].category}
                  </div>
                </div>
              </div>
            </div>
          ) : highlightedCalendarPatch?.should_render ? (
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
          ) : (
            <div className="bg-brand-teal-bg rounded-xl border-[0.5px] border-[rgba(56,163,165,0.2)] p-4 px-[18px] shadow-card">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-3 mb-3">Reminder</div>
              <div className="flex items-center gap-[10px] p-[10px] bg-[rgba(255,255,255,0.6)] rounded-[10px] border-[0.5px] border-[rgba(56,163,165,0.15)]">
                <div className="w-8 h-8 rounded-lg bg-brand-teal flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.6">
                    <circle cx="8" cy="8" r="6"/><path d="M8 4.5v4l2.5 1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-brand-teal-text">No urgent reminder</div>
                  <div className="text-[11.5px] text-brand-teal-text opacity-80">Your dashboard is currently stable.</div>
                </div>
              </div>
            </div>
          )}

          {/* Add Task */}
          <div className="bg-[#60A5FA] rounded-xl p-5 shadow-sm text-white">
            <div className="text-[14px] font-bold uppercase tracking-wider mb-3">Add Task</div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-white/20 hover:bg-white/30 transition-colors rounded-lg py-2 text-[13px] font-semibold border border-white/30 flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              New Task
            </button>
          </div>

          {/* Urgent Tasks */}
          <div className="bg-[#F87171] rounded-xl p-5 shadow-sm text-white flex-1 min-h-[200px]">
            <div className="text-[14px] font-bold uppercase tracking-wider mb-4">Urgent</div>
            <div className="flex flex-col gap-1">
              {urgentTasks.length > 0 ? (
                urgentTasks.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleTaskDone(item.id)}
                    className="flex items-start gap-3 mb-2 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-[2px] flex items-center justify-center transition-colors duration-150 ${
                      doneTasks.has(item.id) 
                        ? 'bg-white border-white' 
                        : 'border-white group-hover:border-white/70'
                    }`}>
                      {doneTasks.has(item.id) && (
                        <div className="w-2 h-[5px] border-l-[1.5px] border-b-[1.5px] border-[#F87171] -rotate-45 -translate-y-[1px]" />
                      )}
                    </div>
                    <div className={`flex-1 text-[13px] leading-[1.4] transition-colors ${
                      doneTasks.has(item.id) ? 'line-through opacity-60' : 'text-white font-medium'
                    }`}>
                      {item.title}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-white/70 italic">No urgent tasks</div>
              )}
            </div>
          </div>

          {/* Well-being Index (Copied from Home) */}
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

        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-[400px] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b-[0.5px] border-border-light flex items-center justify-between bg-surface2">
              <h3 className="font-display text-[18px] text-text-main">Add New Task</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-border-light flex items-center justify-center text-text-2 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4L4 12M4 4l8 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Task description</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Grade assignments"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Category</label>
                <select 
                  value={newTask.category}
                  onChange={e => setNewTask({...newTask, category: e.target.value})}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                >
                  <option value="general">E-mail / General</option>
                  <option value="action_request">Meetings & Calls</option>
                  <option value="absence_report">Questions & Forms</option>
                  <option value="class">Class</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <input 
                  type="checkbox" 
                  id="urgent-check"
                  checked={newTask.urgent}
                  onChange={e => setNewTask({...newTask, urgent: e.target.checked})}
                  className="w-4 h-4 rounded border-border-strong text-brand-red focus:ring-brand-red"
                />
                <label htmlFor="urgent-check" className="text-[13px] font-medium text-text-main cursor-pointer">
                  Mark as Urgent
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-text-main border-[0.5px] border-border-strong hover:bg-surface2 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-brand-teal hover:bg-[#209e8a] transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
