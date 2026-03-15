import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEMO_CALENDAR_WEEK_START,
} from '../config/runtime';
import {
  buildWeekDays,
  buildWeeklySchedule,
  formatHalfHour,
  HOURS,
  ScheduleEvent,
  ScheduleEventType,
  toWeekStart,
} from '../data/schedule';
import { useSchedulePatch } from '../contexts/SchedulePatchContext';

export default function Calendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { appliedPatches } = useSchedulePatch();
  const sortedAppliedPatches = useMemo(
    () => appliedPatches.slice().sort((left, right) => right.savedAt.localeCompare(left.savedAt)),
    [appliedPatches]
  );

  const weekStartDate = useMemo(
    () => toWeekStart(sortedAppliedPatches[0]?.date ?? DEMO_CALENDAR_WEEK_START),
    [sortedAppliedPatches]
  );
  const days = useMemo(() => buildWeekDays(weekStartDate), [weekStartDate]);

  const [filter, setFilter] = useState<'all' | ScheduleEventType>('all');
  const [events, setEvents] = useState<ScheduleEvent[]>(() =>
    buildWeeklySchedule(sortedAppliedPatches, weekStartDate)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    title: '',
    type: 'class',
    day: 0,
    start: 8,
    end: 9,
    location: '',
    participants: '',
    notes: '',
  });

  useEffect(() => {
    const nextEvents = buildWeeklySchedule(sortedAppliedPatches, weekStartDate);
    setEvents(nextEvents);

    if (location.state?.prefillEvent) {
      const prefill = location.state.prefillEvent;
      const text = `${prefill.title} ${prefill.notes}`.toLowerCase();

      let startHour = 8;
      let endHour = 9;
      let day = 0;

      const timeMatch = text.match(/\b(\d{1,2})(?:h|:)(\d{2})?\b/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        if (hours >= 8 && hours <= 17) {
          startHour = hours + minutes / 60;
          endHour = startHour + 1;
        }
      }

      if (text.includes('tuesday')) day = 1;
      else if (text.includes('wednesday')) day = 2;
      else if (text.includes('thursday')) day = 3;
      else if (text.includes('friday')) day = 4;

      setNewEvent({
        title: prefill.title || '',
        type: 'new',
        day,
        start: startHour,
        end: endHour,
        location: '',
        participants: prefill.participants || '',
        notes: prefill.notes || '',
      });
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, sortedAppliedPatches, weekStartDate]);

  const filteredEvents = events.filter((event) => filter === 'all' || event.type === filter);

  const HOUR_HEIGHT = 60;
  const START_HOUR = 8;

  const getEventStyle = (event: ScheduleEvent) => {
    const top = (event.start - START_HOUR) * HOUR_HEIGHT;
    const height = (event.end - event.start) * HOUR_HEIGHT;
    return {
      top: `${top + 2}px`,
      height: `${height - 4}px`,
    };
  };

  const getEventColorClass = (event: ScheduleEvent) => {
    if (event.variant === 'overlay') {
      return 'bg-[rgba(244,181,63,0.30)] border-[#E7A21A] text-[#8A5A00] shadow-[0_10px_24px_rgba(231,162,26,0.18)] backdrop-blur-[1px] z-20';
    }

    switch (event.type) {
      case 'class':
        return 'bg-brand-teal-bg border-brand-teal text-brand-teal-text';
      case 'meeting':
        return 'bg-brand-purple-bg border-brand-purple text-brand-purple-text';
      case 'new':
        return 'bg-brand-red-bg border-brand-red text-brand-red-text';
      default:
        return 'bg-surface2 border-border-strong text-text-main';
    }
  };

  const handleAddEvent = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newEvent.title) return;

    const eventToAdd: ScheduleEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      type: newEvent.type as ScheduleEventType,
      day: Number(newEvent.day),
      start: Number(newEvent.start),
      end: Number(newEvent.end),
      location: newEvent.location,
      participants: newEvent.participants,
      notes: newEvent.notes,
      variant: 'base',
    };

    setEvents((previous) => [...previous, eventToAdd]);
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      type: 'class',
      day: 0,
      start: 8,
      end: 9,
      location: '',
      participants: '',
      notes: '',
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-92px)] w-full gap-4 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-surface p-4 rounded-xl border-[0.5px] border-border-light shadow-card shrink-0">
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[14px] font-medium text-text-main">Select type:</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'all' | ScheduleEventType)}
              className="bg-bg border-[0.5px] border-border-strong rounded-md px-3 py-1.5 text-[13px] text-text-main focus:outline-none focus:border-brand-teal font-medium cursor-pointer"
            >
              <option value="all">All</option>
              <option value="class">Classes</option>
              <option value="meeting">Meetings</option>
              <option value="new">New</option>
            </select>
          </div>

          <div className="hidden md:block w-[1px] h-6 bg-border-light" />

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[14px] font-medium text-text-main">Add event</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-7 h-7 rounded-full border-[1.5px] border-text-main flex items-center justify-center text-text-main hover:bg-surface2 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M3 8h10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-[12px] text-text-3 md:text-right">
          Validated Insight overlays appear directly on the timetable.
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-xl border-[0.5px] border-border-light shadow-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[760px] h-full flex flex-col">
            <div className="flex border-b-[0.5px] border-border-strong shrink-0 bg-surface">
              <div className="w-[60px] shrink-0 border-r-[0.5px] border-border-strong flex items-center justify-center p-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-main">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {days.map((day, index) => (
                <div
                  key={day.id}
                  className={`flex-1 flex items-center justify-center py-4 text-[15px] font-semibold text-text-main ${index < days.length - 1 ? 'border-r-[0.5px] border-border-strong' : ''}`}
                >
                  {day.label}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto scroll-area relative flex">
              <div className="w-[60px] shrink-0 border-r-[0.5px] border-border-strong relative bg-surface">
                {HOURS.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute w-full flex justify-center text-[12px] font-medium text-text-main"
                    style={{ top: `${index * HOUR_HEIGHT - 8}px` }}
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              <div className="flex-1 flex relative">
                <div className="absolute inset-0 pointer-events-none">
                  {HOURS.map((hour, index) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t-[0.5px] border-border-light"
                      style={{ top: `${index * HOUR_HEIGHT}px` }}
                    />
                  ))}
                </div>

                {days.map((day, index) => (
                  <div key={day.id} className={`flex-1 relative ${index < days.length - 1 ? 'border-r-[0.5px] border-border-strong' : ''}`}>
                    {filteredEvents
                      .filter((event) => event.day === day.id)
                      .map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`absolute left-2 right-2 rounded-md border-l-4 p-2 overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer flex flex-col ${getEventColorClass(event)}`}
                          style={getEventStyle(event)}
                        >
                          <div className="text-[12px] font-semibold leading-tight mb-0.5 truncate">{event.title}</div>
                          {event.location && (
                            <div className="text-[10px] font-medium opacity-80 truncate">{event.location}</div>
                          )}
                          {event.variant === 'overlay' && (
                            <div className="text-[10px] font-bold uppercase opacity-90 mt-auto">Insight overlay</div>
                          )}
                          {event.type === 'new' && event.variant !== 'overlay' && (
                            <div className="text-[10px] font-bold uppercase opacity-80 mt-auto">New</div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center px-3">
          <div className="bg-surface rounded-xl border-[0.5px] border-border-light shadow-card w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b-[0.5px] border-border-light flex items-center justify-between bg-surface2 sticky top-0 z-10">
              <div className="text-[15px] font-bold text-text-main">Add New Event</div>
              <button onClick={() => setIsModalOpen(false)} className="text-text-3 hover:text-text-main transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
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
                  onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Mathematics 1A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(event) => setNewEvent({ ...newEvent, type: event.target.value as ScheduleEventType })}
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
                    onChange={(event) => setNewEvent({ ...newEvent, day: Number(event.target.value) })}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {days.map((day) => (
                      <option key={day.id} value={day.id}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">Start Time</label>
                  <select
                    value={newEvent.start}
                    onChange={(event) => setNewEvent({ ...newEvent, start: Number(event.target.value) })}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {Array.from({ length: 19 }, (_, index) => 8 + index * 0.5).map((time) => (
                      <option key={time} value={time}>
                        {formatHalfHour(time)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-text-main">End Time</label>
                  <select
                    value={newEvent.end}
                    onChange={(event) => setNewEvent({ ...newEvent, end: Number(event.target.value) })}
                    className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {Array.from({ length: 19 }, (_, index) => 8.5 + index * 0.5).map((time) => (
                      <option key={time} value={time} disabled={time <= (newEvent.start || 8)}>
                        {formatHalfHour(time)}
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
                  onChange={(event) => setNewEvent({ ...newEvent, location: event.target.value })}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Room 101"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Participants</label>
                <input
                  type="text"
                  value={newEvent.participants}
                  onChange={(event) => setNewEvent({ ...newEvent, participants: event.target.value })}
                  className="bg-bg border-[0.5px] border-border-strong rounded-lg px-3 py-2 text-[13px] text-text-main focus:outline-none focus:border-brand-teal"
                  placeholder="e.g. Class 1A, John Doe"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-text-main">Notes / Things to bring</label>
                <textarea
                  value={newEvent.notes}
                  onChange={(event) => setNewEvent({ ...newEvent, notes: event.target.value })}
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
                <button type="submit" className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-brand-teal hover:bg-[#209e8a] transition-colors">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center px-3">
          <div className="bg-surface rounded-xl border-[0.5px] border-border-light shadow-card w-full max-w-[360px] overflow-hidden">
            <div className={`p-4 border-b-[0.5px] border-border-light flex items-center justify-between ${getEventColorClass(selectedEvent).split(' ')[0]}`}>
              <div className="text-[15px] font-bold">{selectedEvent.title}</div>
              <button onClick={() => setSelectedEvent(null)} className="opacity-70 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-4 text-[13px] text-text-main">
                <div className="text-text-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>{days[selectedEvent.day]?.label} · {formatHalfHour(selectedEvent.start)} – {formatHalfHour(selectedEvent.end)}</div>

                <div className="text-text-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>{selectedEvent.location || 'No location set'}</div>

                <div className="text-text-3 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div>{selectedEvent.participants || 'No participants listed'}</div>
              </div>

              {selectedEvent.notes && (
                <div className="rounded-lg bg-surface2 border-[0.5px] border-border-light p-3 text-[12.5px] text-text-2 leading-[1.5]">
                  {selectedEvent.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
