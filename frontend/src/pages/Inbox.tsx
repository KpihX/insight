import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardFeed, getEventDetail, postEventAction } from '../services/api';
import { DashboardFeedItem, EventDetail } from '../types/api';
import {
  DEFAULT_DASHBOARD_ROLE,
  DEFAULT_DASHBOARD_STAFF_ID,
  REFRESH_INTERVAL_MS,
  USE_REAL_API,
} from '../config/runtime';

export default function Inbox() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DashboardFeedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EventDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sortMode, setSortMode] = useState<'urgency' | 'newest' | 'theme' | 'sender'>('urgency');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [replyMode, setReplyMode] = useState<'ai' | 'manual' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const initialLoadDone = useRef(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const feed = await getDashboardFeed(
          DEFAULT_DASHBOARD_ROLE,
          DEFAULT_DASHBOARD_STAFF_ID,
          undefined,
          undefined,
          50
        );
        setItems(feed.items || []);
        if (feed.items?.length > 0 && !initialLoadDone.current) {
          handleSelectItem(feed.items[0].id);
          initialLoadDone.current = true;
        }
      } catch (err) {
        console.error('Failed to fetch inbox feed', err);
      }
    };
    fetchFeed();
    const interval = setInterval(fetchFeed, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const [repliedMessages, setRepliedMessages] = useState<Record<string, string>>({});
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const handleSelectItem = async (id: string) => {
    setLoadingDetail(true);
    setReplyMode(null); // Reset reply visibility when selecting a new email
    setReadMessages(prev => new Set(prev).add(id));
    try {
      const detail = await getEventDetail(id);
      setSelectedItem(detail);
    } catch (err) {
      console.error('Failed to fetch event detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!selectedItem) return;
    try {
      if (action === 'reply') {
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 3000);

        const replyText = (document.querySelector('textarea') as HTMLTextAreaElement)?.value;
        if (replyText) {
          setRepliedMessages(prev => ({ ...prev, [selectedItem.id]: replyText }));
        }
      } else {
        await postEventAction(selectedItem.id, action, DEFAULT_DASHBOARD_STAFF_ID);
      }

      if (action === 'archive') {
        // Optimistically remove from list
        setItems(prev => prev.filter(i => i.id !== selectedItem.id));
        setSelectedItem(null);
      }
      setReplyMode(null);
    } catch (err) {
      console.error('Failed to post action', err);
    }
  };

  const filteredItems = items.filter(item => {
    // Filter by sidebar activeFilter
    let matchesFilter = true;
    if (activeFilter !== 'all') {
      matchesFilter = item.sender_label?.toLowerCase().includes(activeFilter.toLowerCase());
    }

    // Filter by sub filter
    let matchesSubFilter = true;
    if (activeSubFilter === 'urgent') {
      matchesSubFilter = item.urgent;
    } else if (activeSubFilter === 'meetings') {
      matchesSubFilter = item.category === 'action_request' || item.category === 'schedule_change';
    } else if (activeSubFilter === 'questions') {
      matchesSubFilter = item.category === 'absence_report' || item.category === 'deadline_or_form';
    }

    // Filter by search query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        item.title.toLowerCase().includes(query) || 
        item.summary.toLowerCase().includes(query) || 
        (item.sender_label && item.sender_label.toLowerCase().includes(query));
    }

    return matchesFilter && matchesSubFilter && matchesSearch;
  });

  // Group logic based on sort mode
  const getGroupedItems = () => {
    if (sortMode === 'urgency') {
      const urgent = filteredItems.filter(i => i.urgent);
      const important = filteredItems.filter(i => !i.urgent && i.important);
      const normal = filteredItems.filter(i => !i.urgent && !i.important);
      return [
        { title: 'Urgent', items: urgent },
        { title: 'Important', items: important },
        { title: 'Normal', items: normal }
      ].filter(g => g.items.length > 0);
    } else if (sortMode === 'theme') {
      const groups: Record<string, DashboardFeedItem[]> = {};
      filteredItems.forEach(item => {
        const key = item.category || 'Other';
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
      return Object.entries(groups).map(([title, items]) => ({ title, items }));
    } else if (sortMode === 'sender') {
      const groups: Record<string, DashboardFeedItem[]> = {
        'Teachers': [],
        'Parents': [],
        'Students': [],
        'Admin': [],
        'Other': []
      };
      filteredItems.forEach(item => {
        const label = item.sender_label?.toLowerCase() || '';
        if (label.includes('teacher') || label.includes('colleague')) {
          groups['Teachers'].push(item);
        } else if (label.includes('parent') || label.includes('family')) {
          groups['Parents'].push(item);
        } else if (label.includes('student') || label.includes('class')) {
          groups['Students'].push(item);
        } else if (label.includes('admin') || label.includes('principal')) {
          groups['Admin'].push(item);
        } else {
          groups['Other'].push(item);
        }
      });
      return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([title, items]) => ({ title, items }));
    } else {
      // newest
      return [{ title: 'All Messages', items: filteredItems }];
    }
  };

  const groupedItems = getGroupedItems();

  const hasDateTime = (item: EventDetail) => {
    // Simple check if content or title contains something that looks like a time or date
    const text = (item.title + ' ' + item.content).toLowerCase();
    return /\b\d{1,2}:\d{2}\b/.test(text) || /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)\b/.test(text);
  };

  const calendarPatch = selectedItem?.assist?.calendar_patch;
  const canAddToCalendar = !!selectedItem && (
    calendarPatch?.should_render === true ||
    (!USE_REAL_API && hasDateTime(selectedItem))
  );

  const calendarNavigationState =
    calendarPatch?.should_render === true
      ? {
          calendarPatch,
          sourceEventId: selectedItem?.id,
          sourceEventTitle: selectedItem?.title,
          sourceSender: selectedItem?.sender?.name,
        }
      : selectedItem
        ? {
            prefillEvent: {
              title: selectedItem.subject || selectedItem.title,
              notes: selectedItem.content,
              participants: selectedItem.sender?.name,
            },
          }
        : undefined;

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-92px)] gap-4 w-full relative">
      {showSuccessBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-brand-green text-white px-4 py-2 rounded-lg shadow-lg text-[13px] font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13.333 4L6 11.333 2.667 8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Message successfully sent
        </div>
      )}
      {/* COLUMN 1: Filters (Retractable) */}
      {isSidebarOpen ? (
        <div className="w-full xl:w-[180px] flex flex-col gap-2 shrink-0 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-bold text-text-main">All inboxes</div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-text-3 hover:text-text-main rounded-md hover:bg-surface2 transition-colors"
              title="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <button 
            onClick={() => setActiveFilter('all')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeFilter === 'all' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            All messages
          </button>
          <button 
            onClick={() => setActiveFilter('gmail')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${activeFilter === 'gmail' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            <div className="w-2 h-2 rounded-full bg-brand-red" /> Gmail
          </button>
          <button 
            onClick={() => setActiveFilter('moodle')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${activeFilter === 'moodle' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            <div className="w-2 h-2 rounded-full bg-brand-amber" /> Moodle
          </button>
          <button 
            onClick={() => setActiveFilter('portal')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${activeFilter === 'portal' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            <div className="w-2 h-2 rounded-full bg-brand-green" /> Parent Portal
          </button>

          <div className="w-full h-[1px] bg-border-light my-2" />
          
          <div className="text-[12px] font-bold text-text-3 uppercase tracking-wider px-2 mb-1 mt-2">Filters</div>
          <button 
            onClick={() => setActiveSubFilter('all')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeSubFilter === 'all' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            All Types
          </button>
          <button 
            onClick={() => setActiveSubFilter('urgent')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${activeSubFilter === 'urgent' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            <div className="w-2 h-2 rounded-full bg-brand-red" /> Urgent
          </button>
          <button 
            onClick={() => setActiveSubFilter('meetings')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${activeSubFilter === 'meetings' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            <div className="w-2 h-2 rounded-full bg-brand-blue" /> Meetings
          </button>
          <button 
            onClick={() => setActiveSubFilter('questions')}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${activeSubFilter === 'questions' ? 'bg-surface shadow-sm text-text-main' : 'text-text-2 hover:bg-surface2'}`}
          >
            <div className="w-2 h-2 rounded-full bg-brand-teal" /> Questions
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-surface rounded-xl border-[0.5px] border-border-light shadow-sm text-text-3 hover:text-text-main transition-colors"
            title="Expand sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* COLUMN 2: Message List */}
      <div className="w-full xl:w-[320px] flex flex-col bg-surface rounded-xl border-[0.5px] border-border-light shadow-card shrink-0 overflow-hidden min-h-[300px] xl:min-h-0">
        <div className="p-4 border-b-[0.5px] border-border-light flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg border-[0.5px] border-border-strong rounded-lg pl-8 pr-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal transition-colors"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3 3" strokeLinecap="round" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2 text-[12px] text-text-3 font-medium">
            Sort by:
          </div>
          <div className="flex gap-1 bg-bg p-1 rounded-lg flex-wrap">
            {['urgency', 'newest', 'theme', 'sender'].map(mode => (
              <button 
                key={mode}
                onClick={() => setSortMode(mode as any)}
                className={`flex-1 min-w-[60px] text-[11px] py-[6px] rounded-md font-sans transition-colors duration-150 capitalize font-medium ${
                  sortMode === mode 
                    ? 'bg-surface text-text-main shadow-sm' 
                    : 'bg-transparent text-text-2 hover:text-text-main'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-area">
          {groupedItems.map(group => (
            <div key={group.title}>
              <div className="px-4 py-2 bg-surface2 border-y-[0.5px] border-border-light text-[11px] font-bold uppercase tracking-wider text-text-3 sticky top-0 z-10 first:border-t-0">
                {group.title}
              </div>
              {group.items.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const isRead = readMessages.has(item.id);
                const hasReplied = !!repliedMessages[item.id];
                
                let borderClass = "border-transparent";
                let bgClass = isSelected ? "bg-bg" : "bg-surface hover:bg-surface2";
                
                if (item.urgent) {
                  borderClass = "border-brand-red";
                  if (isSelected) bgClass = "bg-brand-red-bg";
                } else if (item.important) {
                  borderClass = "border-brand-amber";
                  if (isSelected) bgClass = "bg-brand-amber-bg";
                }

                return (
                  <div 
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={`p-4 border-l-4 border-b-[0.5px] border-b-border-light cursor-pointer transition-colors ${borderClass} ${bgClass}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className={`text-[13px] text-text-main truncate pr-2 flex items-center gap-2 ${!isRead ? 'font-bold' : 'font-semibold'}`}>
                        {!isRead && <div className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />}
                        {item.sender_label}
                      </div>
                      <div className="text-[11px] text-text-3 whitespace-nowrap flex items-center gap-1">
                        {hasReplied && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-green">
                            <path d="M6 12L2 8l4-4M2 8h12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {item.time_label}
                      </div>
                    </div>
                    <div className={`text-[12px] text-text-main mb-1 truncate ${!isRead ? 'font-bold' : 'font-medium'}`}>{item.title}</div>
                    <div className="text-[11.5px] text-text-2 line-clamp-2 leading-[1.4]">{item.summary}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: Original Email */}
      <div className="w-full xl:flex-1 flex flex-col bg-surface rounded-xl border-[0.5px] border-border-light shadow-card overflow-hidden min-w-0 min-h-[320px]">
        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center text-text-3">Loading...</div>
        ) : selectedItem ? (
          <>
            <div className="p-5 border-b-[0.5px] border-border-light bg-surface2">
              <div className="text-[15px] font-semibold text-text-main mb-4">{selectedItem.subject || selectedItem.title}</div>
              <div className="grid grid-cols-[40px_1fr] gap-y-2 text-[13px]">
                <div className="text-text-3 font-medium">From:</div>
                <div className="text-text-main">{selectedItem.sender?.name} <span className="text-text-3">&lt;{selectedItem.sender?.contact}&gt;</span></div>
                
                <div className="text-text-3 font-medium">To:</div>
                <div className="text-text-main">{selectedItem.receivers?.join(', ')}</div>
                
                <div className="text-text-3 font-medium">Date:</div>
                <div className="text-text-main">{new Date(selectedItem.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto scroll-area text-[14px] text-text-main leading-[1.6] whitespace-pre-wrap">
              {selectedItem.content}
              
              {repliedMessages[selectedItem.id] && (
                <div className="mt-8 pt-6 border-t-[0.5px] border-border-light">
                  <div className="text-[13px] font-semibold text-text-main mb-2 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 12L2 8l4-4M2 8h12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Your Reply
                  </div>
                  <div className="bg-surface2 p-4 rounded-lg text-[13px] text-text-main whitespace-pre-wrap">
                    {repliedMessages[selectedItem.id]}
                  </div>
                </div>
              )}
            </div>
            {/* Bottom Action Bar */}
            <div className="p-4 bg-surface border-t-[0.5px] border-border-light flex gap-2 items-center flex-wrap">
              {canAddToCalendar && (
                <button 
                  onClick={() => navigate('/calendar', { state: calendarNavigationState })}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-text-main border-[0.5px] border-border-strong hover:bg-surface2 transition-colors"
                >
                  Add to calendar
                </button>
              )}
              <div className="flex-1 min-w-[20px]" />
              {!repliedMessages[selectedItem.id] && (
                <>
                  <button 
                    onClick={() => setReplyMode('ai')}
                    className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors border-[0.5px] ${
                      replyMode === 'ai' 
                        ? 'bg-brand-purple text-white border-brand-purple' 
                        : 'text-text-main border-border-strong hover:bg-surface2'
                    }`}
                  >
                    AI Draft
                  </button>
                  <button 
                    onClick={() => setReplyMode('manual')}
                    className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors border-[0.5px] ${
                      replyMode === 'manual' 
                        ? 'bg-text-main text-white border-text-main' 
                        : 'text-text-main border-border-strong hover:bg-surface2'
                    }`}
                  >
                    Reply
                  </button>
                </>
              )}
              <button 
                onClick={() => handleAction('archive')}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-brand-red-text border-[0.5px] border-border-strong hover:bg-[#f8dede] transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-3">Select a message to read</div>
        )}
      </div>

      {/* COLUMN 4: AI Reply / Manual Reply (Only visible when a reply mode is selected) */}
      {replyMode && (
        <div className="w-full xl:w-[320px] flex flex-col bg-surface rounded-xl border-[0.5px] border-border-light shadow-card overflow-hidden shrink-0 min-h-[320px]">
          <div className="p-4 border-b-[0.5px] border-border-light flex items-center justify-between">
            <div className="flex items-center gap-2">
              {replyMode === 'ai' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-brand-purple)" strokeWidth="1.5">
                    <path d="M8 1v14M1 8h14M3.5 3.5l9 9M3.5 12.5l9-9" opacity="0.5"/>
                    <circle cx="8" cy="8" r="4" fill="var(--color-brand-purple)"/>
                  </svg>
                  <span className="text-[13px] font-bold text-text-main">Suggested AI reply</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 12L2 8l4-4M2 8h12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[13px] font-bold text-text-main">Manual reply</span>
                </>
              )}
            </div>
            <button 
              onClick={() => setReplyMode(null)}
              className="text-text-3 hover:text-text-main transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-4 flex flex-col bg-surface2">
            <textarea 
              key={replyMode} // Force remount when switching modes
              className={`w-full flex-1 bg-surface rounded-lg border-[0.5px] border-border-strong p-3 text-[13px] text-text-main resize-none focus:outline-none shadow-sm leading-[1.5] ${
                replyMode === 'ai' ? 'focus:border-brand-purple' : 'focus:border-text-main'
              }`}
              defaultValue={replyMode === 'ai' ? (selectedItem?.suggested_reply || `Thank you for your message regarding "${selectedItem?.subject || selectedItem?.title}". I have received it and will get back to you as soon as possible.\n\nBest regards,\nTeacher`) : ''}
              placeholder={replyMode === 'manual' ? "Type your reply here..." : ""}
            />
          </div>

          <div className="p-4 bg-surface border-t-[0.5px] border-border-light flex gap-2 justify-end">
            {replyMode === 'ai' && (
              <button className="px-4 py-2 rounded-lg text-[13px] font-semibold text-text-main border-[0.5px] border-border-strong hover:bg-surface2 transition-colors">
                Edit
              </button>
            )}
            <button 
              onClick={() => setReplyMode(null)}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-brand-red-text border-[0.5px] border-border-strong hover:bg-[#f8dede] transition-colors"
            >
              {replyMode === 'ai' ? 'Delete' : 'Discard'}
            </button>
            <button 
              onClick={() => handleAction('reply')}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-brand-teal hover:bg-[#209e8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
