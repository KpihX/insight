import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarPatch } from '../types/api';
import { DEMO_CALENDAR_WEEK_START } from '../config/runtime';

type EventType = 'class' | 'meeting' | 'new';

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  day: number; // 0 = Mon, 1 = Tue, etc.
  start: number; // 8.0 to 17.0
  end: number;
  location?: string;
  participants?: string;
  notes?: string;
}

const toWeekStart = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return date;
};

const buildDays = (weekStartDate: Date) =>
  Array.from({ length: 5 }, (_, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);
    return {
      id: index,
      label: date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      }).replace(',', '.'),
    };
  });

const parseHalfHourTime = (time: string | undefined, fallback: number) => {
  if (!time) return fallback;
  const [hours, minutes = '00'] = time.split(':');
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) return fallback;
  return parsedHours + parsedMinutes / 60;
};

const INITIAL_EVENTS: CalendarEvent[] = [
  // Monday (day 0)
  { id: '1', title: 'Mathematics 1A', type: 'class', day: 0, start: 8, end: 10, location: 'Room 101', participants: 'Class 1A', notes: 'Chapter 4 test' },
  { id: '2', title: 'Curriculum review', type: 'new', day: 0, start: 11, end: 12.5, location: 'Meeting Room B', participants: 'Math Dept', notes: 'Bring updated syllabus' },
  { id: '3', title: 'Staff meeting', type: 'meeting', day: 0, start: 13, end: 14, location: 'Main Hall', participants: 'All Staff', notes: 'Monthly sync' },
  { id: '4', title: 'Biology 1B', type: 'class', day: 0, start: 16, end: 17, location: 'Lab 2', participants: 'Class 1B', notes: 'Microscope intro' },
  
  // Tuesday (day 1)
  { id: '5', title: 'Parent call', type: 'meeting', day: 1, start: 8, end: 9, location: 'Online', participants: 'Mr. & Mrs. Smith', notes: 'Discuss student progress' },
  { id: '6', title: 'Physics 2B', type: 'class', day: 1, start: 10, end: 12, location: 'Lab 1', participants: 'Class 2B', notes: 'Kinematics' },
  { id: '7', title: 'Mathematics 3A', type: 'class', day: 1, start: 13, end: 15, location: 'Room 105', participants: 'Class 3A', notes: '' },
  
  // Wednesday (day 2)
  { id: '8', title: 'Chemistry 1A', type: 'class', day: 2, start: 9, end: 10, location: 'Lab 3', participants: 'Class 1A', notes: '' },
  { id: '9', title: 'Biology 2A', type: 'class', day: 2, start: 11, end: 12, location: 'Lab 2', participants: 'Class 2A', notes: '' },
  { id: '10', title: 'Physics 1B', type: 'class', day: 2, start: 13, end: 15, location: 'Lab 1', participants: 'Class 1B', notes: '' },
  { id: '11', title: 'Department meeting', type: 'meeting', day: 2, start: 15.5, end: 16.5, location: 'Room 202', participants: 'Science Dept', notes: '' },
  
  // Thursday (day 3)
  { id: '12', title: 'Mathematics 2A', type: 'class', day: 3, start: 9, end: 11, location: 'Room 103', participants: 'Class 2A', notes: '' },
  { id: '13', title: 'Workshop prep', type: 'new', day: 3, start: 13, end: 14, location: 'Library', participants: 'Self', notes: '' },
  { id: '14', title: 'Chemistry 2B', type: 'class', day: 3, start: 14.25, end: 15, location: 'Lab 3', participants: 'Class 2B', notes: '' },
  { id: '15', title: 'Student mentoring', type: 'meeting', day: 3, start: 15.5, end: 16.5, location: 'Office', participants: 'John Doe', notes: '' },
  
  // Friday (day 4)
  { id: '16', title: 'Field trip planning', type: 'new', day: 4, start: 8, end: 9.5, location: 'Staff Room', participants: 'Trip Committee', notes: 'Finalize itinerary' },
  { id: '17', title: 'Biology 1A', type: 'class', day: 4, start: 10, end: 11, location: 'Lab 2', participants: 'Class 1A', notes: '' },
  { id: '18', title: 'Weekly sync', type: 'meeting', day: 4, start: 11.5, end: 12.5, location: 'Room 204', participants: 'Admin Team', notes: '' },
  { id: '19', title: 'Physics 3A', type: 'class', day: 4, start: 13.5, end: 15.5, location: 'Lab 1', participants: 'Class 3A', notes: '' },
];

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 to 17

export default function Calendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const calendarPatch = location.state?.calendarPatch as CalendarPatch | undefined;
  const weekStartDate = useMemo(
    () => toWeekStart(calendarPatch?.date ?? DEMO_CALENDAR_WEEK_START),
    [calendarPatch?.date]
  );
  const days = useMemo(() => buildDays(weekStartDate), [weekStartDate]);
  
  const [filter, setFilter] = useState<'all' | EventType>('all');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'class',
    day: 0,
    start: 8,
    end: 9,
    location: '',
    participants: '',
    notes: ''
  });
  const reminderEvent = selectedEvent ?? events.find(event => event.type === 'meeting') ?? null;

  useEffect(() => {
    if (calendarPatch?.should_render) {
      const patchStart = parseHalfHourTime(calendarPatch.start_time, 14);
      const patchEnd = parseHalfHourTime(calendarPatch.end_time, patchStart + 1);
      const patchDate = calendarPatch.date ? new Date(`${calendarPatch.date}T00:00:00`) : weekStartDate;
      const rawDayIndex = Math.round((patchDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const day = rawDayIndex >= 0 && rawDayIndex <= 4 ? rawDayIndex : 0;

      const eventToInject: CalendarEvent = {
        id: `calendar-patch-${calendarPatch.date}-${calendarPatch.start_time}-${calendarPatch.title}`,
        title: calendarPatch.title || 'Scheduled meeting',
        type: calendarPatch.patch_type === 'meeting' ? 'meeting' : 'new',
        day,
        start: patchStart,
        end: patchEnd,
        location: 'Room 204',
        participants: (location.state?.sourceSender as string | undefined) || 'School staff',
        notes: (location.state?.sourceEventTitle as string | undefined) || 'Injected from backend event',
      };

      setEvents(prev => {
        const withoutExisting = prev.filter(event => event.id !== eventToInject.id);
        return [...withoutExisting, eventToInject];
      });
      setFilter('all');
      setSelectedEvent(eventToInject);
      navigate(location.pathname, { replace: true });
      return;
    }

    if (location.state?.prefillEvent) {
      const prefill = location.state.prefillEvent;
      
      // Try to parse date/time from notes or title
      const text = (prefill.title + ' ' + prefill.notes).toLowerCase();
      
      let startHour = 8;
      let endHour = 9;
      let day = 0; // Default to Monday

      // Simple time parsing (e.g., "10h", "10:00", "14h30")
      const timeMatch = text.match(/\b(\d{1,2})(?:h|:)(\d{2})?\b/);
      if (timeMatch) {
        const h = parseInt(timeMatch[1]);
        const m = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        if (h >= 8 && h <= 17) {
          startHour = h + (m / 60);
          endHour = startHour + 1; // Default 1 hour duration
        }
      }

      // Simple day parsing
      if (text.includes('tuesday')) day = 1;
      else if (text.includes('wednesday')) day = 2;
      else if (text.includes('thursday')) day = 3;
      else if (text.includes('friday')) day = 4;

      setNewEvent({
        title: prefill.title || '',
        type: 'new',
        day: day,
        start: startHour,
        end: endHour,
        location: '',
        participants: prefill.participants || '',
        notes: prefill.notes || ''
      });
      setIsModalOpen(true);
      // Clear state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [calendarPatch, location, navigate, weekStartDate]);

  const filteredEvents = events.filter(e => filter === 'all' || e.type === filter);

  // Constants for layout
  const HOUR_HEIGHT = 60;
  const START_HOUR = 8;

  const getEventStyle = (event: CalendarEvent) => {
    const top = (event.start - START_HOUR) * HOUR_HEIGHT;
    const height = (event.end - event.start) * HOUR_HEIGHT;
    return {
      top: `${top + 2}px`, // Add 2px padding from the top line
      height: `${height - 4}px`, // Subtract 4px for padding
    };
  };

  const getEventColorClass = (type: EventType) => {
    switch (type) {
      case 'class': return 'bg-brand-teal-bg border-brand-teal text-brand-teal-text';
      case 'meeting': return 'bg-brand-purple-bg border-brand-purple text-brand-purple-text';
      case 'new': return 'bg-brand-red-bg border-brand-red text-brand-red-text';
      default: return 'bg-surface2 border-border-strong text-text-main';
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    
    const eventToAdd: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      type: newEvent.type as EventType,
      day: Number(newEvent.day),
      start: Number(newEvent.start),
      end: Number(newEvent.end),
      location: newEvent.location,
      participants: newEvent.participants,
      notes: newEvent.notes
    };

    setEvents([...events, eventToAdd]);
    setIsModalOpen(false);
    setNewEvent({ title: '', type: 'class', day: 0, start: 8, end: 9, location: '', participants: '', notes: '' });
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const mins = time % 1 === 0 ? '00' : '30';
    return `${hours}:${mins}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-92px)] w-full gap-4 relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border-[0.5px] border-border-light shadow-card shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-text-main">Select type:</span>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-bg border-[0.5px] border-border-strong rounded-md px-3 py-1.5 text-[13px] text-text-main focus:outline-none focus:border-brand-teal font-medium cursor-pointer"
            >
              <option value="all">All</option>
              <option value="class">Classes</option>
              <option value="meeting">Meetings</option>
              <option value="new">New</option>
            </select>
          </div>
          
          <div className="w-[1px] h-6 bg-border-light" />
          
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-text-main">Add event</span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-7 h-7 rounded-full border-[1.5px] border-text-main flex items-center justify-center text-text-main hover:bg-surface2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Reminder Bubble */}
        <div className="flex items-center gap-3 bg-brand-red-bg border-[1.5px] border-brand-red rounded-2xl px-4 py-2 relative">
          <div className="absolute -bottom-[6px] right-6 w-3 h-3 bg-brand-red-bg border-b-[1.5px] border-r-[1.5px] border-brand-red rotate-45" />
          <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M8 1L1 14h14L8 1z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6v4M8 12v.01" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="text-[12px] font-bold text-brand-red-text uppercase tracking-wide">
              {reminderEvent ? `REMINDER: ${reminderEvent.title}` : 'REMINDER: no meeting selected'}
            </div>
            <div className="text-[11px] font-medium text-brand-red-text opacity-80 flex gap-3 flex-wrap">
              <span>
                {reminderEvent ? `${formatTime(reminderEvent.start)} – ${formatTime(reminderEvent.end)}` : 'Use Inbox -> Add to calendar'}
              </span>
              {reminderEvent?.location && <span>{reminderEvent.location}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-surface rounded-xl border-[0.5px] border-border-light shadow-card overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex border-b-[0.5px] border-border-strong shrink-0 bg-surface">
          <div className="w-[60px] shrink-0 border-r-[0.5px] border-border-strong flex items-center justify-center p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-main">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {days.map((day, i) => (
            <div key={day.id} className={`flex-1 flex items-center justify-center py-4 text-[15px] font-semibold text-text-main ${i < days.length - 1 ? 'border-r-[0.5px] border-border-strong' : ''}`}>
              {day.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-area relative flex">
          {/* Time Column */}
          <div className="w-[60px] shrink-0 border-r-[0.5px] border-border-strong relative bg-surface">
            {HOURS.map((hour, i) => (
              <div 
                key={hour} 
                className="absolute w-full flex justify-center text-[12px] font-medium text-text-main"
                style={{ top: `${i * HOUR_HEIGHT - 8}px` }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 flex relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {HOURS.map((hour, i) => (
                <div 
                  key={hour} 
                  className="absolute w-full border-t-[0.5px] border-border-light"
                  style={{ top: `${i * HOUR_HEIGHT}px` }}
                />
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day, i) => (
              <div key={day.id} className={`flex-1 relative ${i < days.length - 1 ? 'border-r-[0.5px] border-border-strong' : ''}`}>
                {filteredEvents.filter(e => e.day === day.id).map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`absolute left-2 right-2 rounded-md border-l-4 p-2 overflow-hidden shadow-sm transition-transform hover:scale-[1.02] cursor-pointer flex flex-col ${getEventColorClass(event.type)}`}
                    style={getEventStyle(event)}
                  >
                    <div className="text-[12px] font-semibold leading-tight mb-0.5 truncate">{event.title}</div>
                    {event.location && (
                      <div className="text-[10px] font-medium opacity-80 truncate">{event.location}</div>
                    )}
                    {event.type === 'new' && (
                      <div className="text-[10px] font-bold uppercase opacity-80 mt-auto">New</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-xl border-[0.5px] border-border-light shadow-card w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b-[0.5px] border-border-light flex items-center justify-between bg-surface2 sticky top-0 z-10">
              <div className="text-[15px] font-bold text-text-main">Add New Event</div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-3 hover:text-text-main transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Mathematics 1A"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">Event Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    <option value="class">Class</option>
                    <option value="meeting">Meeting</option>
                    <option value="new">New</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">Day</label>
                  <select 
                    value={newEvent.day}
                    onChange={e => setNewEvent({...newEvent, day: Number(e.target.value)})}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {days.map(day => (
                      <option key={day.id} value={day.id}>{day.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">Start Time</label>
                  <select 
                    value={newEvent.start}
                    onChange={e => setNewEvent({...newEvent, start: Number(e.target.value)})}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {Array.from({length: 19}, (_, i) => 8 + i * 0.5).map(time => (
                      <option key={time} value={time}>
                        {Math.floor(time)}:{time % 1 === 0 ? '00' : '30'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">End Time</label>
                  <select 
                    value={newEvent.end}
                    onChange={e => setNewEvent({...newEvent, end: Number(e.target.value)})}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {Array.from({length: 19}, (_, i) => 8.5 + i * 0.5).map(time => (
                      <option key={time} value={time} disabled={time <= (newEvent.start || 8)}>
                        {Math.floor(time)}:{time % 1 === 0 ? '00' : '30'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Location</label>
                <input 
                  type="text" 
                  value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Room 101"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Participants</label>
                <input 
                  type="text" 
                  value={newEvent.participants}
                  onChange={e => setNewEvent({...newEvent, participants: e.target.value})}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Class 1A, John Doe"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Notes / Things to bring</label>
                <textarea 
                  value={newEvent.notes}
                  onChange={e => setNewEvent({...newEvent, notes: e.target.value})}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal resize-none min-h-[60px]"
                  placeholder="e.g. Bring permission slips"
                />
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
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-xl border-[0.5px] border-border-light shadow-card w-[360px] overflow-hidden">
            <div className={`p-4 border-b-[0.5px] border-border-light flex items-center justify-between ${getEventColorClass(selectedEvent.type).split(' ')[0]}`}>
              <div className="text-[15px] font-bold">{selectedEvent.title}</div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-4 text-[13px] text-text-main">
                <div className="text-text-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium">{days[selectedEvent.day].label}</div>
                  <div className="text-text-2">{formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}</div>
                </div>

                {selectedEvent.location && (
                  <>
                    <div className="text-text-3 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>{selectedEvent.location}</div>
                  </>
                )}

                {selectedEvent.participants && (
                  <>
                    <div className="text-text-3 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div>{selectedEvent.participants}</div>
                  </>
                )}

                {selectedEvent.notes && (
                  <>
                    <div className="text-text-3 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
                      </svg>
                    </div>
                    <div>{selectedEvent.notes}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
