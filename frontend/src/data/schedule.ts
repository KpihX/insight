import { CalendarPatch } from '../types/api';
import { AppliedCalendarPatch } from '../contexts/SchedulePatchContext';

export type ScheduleEventType = 'class' | 'meeting' | 'new';
export type ScheduleEventVariant = 'base' | 'overlay';

export interface ScheduleEvent {
  id: string;
  title: string;
  type: ScheduleEventType;
  day: number; // 0 = Mon, 1 = Tue, etc.
  start: number;
  end: number;
  location?: string;
  participants?: string;
  notes?: string;
  variant?: ScheduleEventVariant;
}

export interface ScheduleDayView {
  date: Date;
  dayIndex: number | null;
  label: string;
  events: ScheduleEvent[];
}

export interface ScheduleOccurrence {
  date: Date;
  event: ScheduleEvent;
}

export const HOURS = Array.from({ length: 10 }, (_, index) => index + 8);

export const BASE_SCHEDULE_EVENTS: ScheduleEvent[] = [
  { id: '1', title: 'Mathematics 1A', type: 'class', day: 0, start: 8, end: 10, location: 'Room 101', participants: 'Class 1A', notes: 'Chapter 4 test', variant: 'base' },
  { id: '2', title: 'Curriculum review', type: 'new', day: 0, start: 11, end: 12.5, location: 'Meeting Room B', participants: 'Math Dept', notes: 'Bring updated syllabus', variant: 'base' },
  { id: '3', title: 'Staff meeting', type: 'meeting', day: 0, start: 13, end: 14, location: 'Main Hall', participants: 'All Staff', notes: 'Monthly sync', variant: 'base' },
  { id: '4', title: 'Biology 1B', type: 'class', day: 0, start: 16, end: 17, location: 'Lab 2', participants: 'Class 1B', notes: 'Microscope intro', variant: 'base' },
  { id: '5', title: 'Parent call', type: 'meeting', day: 1, start: 8, end: 9, location: 'Online', participants: 'Mr. & Mrs. Smith', notes: 'Discuss student progress', variant: 'base' },
  { id: '6', title: 'Physics 2B', type: 'class', day: 1, start: 10, end: 12, location: 'Lab 1', participants: 'Class 2B', notes: 'Kinematics', variant: 'base' },
  { id: '7', title: 'Mathematics 3A', type: 'class', day: 1, start: 13, end: 15, location: 'Room 105', participants: 'Class 3A', notes: '', variant: 'base' },
  { id: '8', title: 'Chemistry 1A', type: 'class', day: 2, start: 9, end: 10, location: 'Lab 3', participants: 'Class 1A', notes: '', variant: 'base' },
  { id: '9', title: 'Biology 2A', type: 'class', day: 2, start: 11, end: 12, location: 'Lab 2', participants: 'Class 2A', notes: '', variant: 'base' },
  { id: '10', title: 'Physics 1B', type: 'class', day: 2, start: 13, end: 15, location: 'Lab 1', participants: 'Class 1B', notes: '', variant: 'base' },
  { id: '11', title: 'Department meeting', type: 'meeting', day: 2, start: 15.5, end: 16.5, location: 'Room 202', participants: 'Science Dept', notes: '', variant: 'base' },
  { id: '12', title: 'Mathematics 2A', type: 'class', day: 3, start: 9, end: 11, location: 'Room 103', participants: 'Class 2A', notes: '', variant: 'base' },
  { id: '13', title: 'Workshop prep', type: 'new', day: 3, start: 13, end: 14, location: 'Library', participants: 'Self', notes: '', variant: 'base' },
  { id: '14', title: 'Chemistry 2B', type: 'class', day: 3, start: 14.25, end: 15, location: 'Lab 3', participants: 'Class 2B', notes: '', variant: 'base' },
  { id: '15', title: 'Student mentoring', type: 'meeting', day: 3, start: 15.5, end: 16.5, location: 'Office', participants: 'John Doe', notes: '', variant: 'base' },
  { id: '16', title: 'Field trip planning', type: 'new', day: 4, start: 8, end: 9.5, location: 'Staff Room', participants: 'Trip Committee', notes: 'Finalize itinerary', variant: 'base' },
  { id: '17', title: 'Biology 1A', type: 'class', day: 4, start: 10, end: 11, location: 'Lab 2', participants: 'Class 1A', notes: '', variant: 'base' },
  { id: '18', title: 'Weekly sync', type: 'meeting', day: 4, start: 11.5, end: 12.5, location: 'Room 204', participants: 'Admin Team', notes: '', variant: 'base' },
  { id: '19', title: 'Physics 3A', type: 'class', day: 4, start: 13.5, end: 15.5, location: 'Lab 1', participants: 'Class 3A', notes: '', variant: 'base' },
];

export const parseHalfHourTime = (time: string | undefined, fallback: number) => {
  if (!time) return fallback;
  const [hours, minutes = '00'] = time.split(':');
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) return fallback;
  return parsedHours + parsedMinutes / 60;
};

export const toWeekStart = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return date;
};

export const buildWeekDays = (weekStartDate: Date) =>
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
      date,
    };
  });

export const toMondayFirstDayIndex = (date: Date) => {
  const day = date.getDay();
  if (day === 0) return null;
  return day - 1;
};

export const formatScheduleColumnLabel = (date: Date, prefix: string) =>
  `${prefix} · ${date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).replace(',', '.')}`;

export const formatScheduleTimeRange = (start: number, end: number) =>
  `${formatHalfHour(start)} – ${formatHalfHour(end)}`;

export const formatHalfHour = (time: number) => {
  const hours = Math.floor(time);
  const mins = time % 1 === 0 ? '00' : '30';
  return `${hours}:${mins}`;
};

export const buildCalendarOverlayEvent = (
  calendarPatch: Pick<CalendarPatch, 'date' | 'start_time' | 'end_time' | 'title' | 'patch_type' | 'location'> | undefined,
  weekStartDate: Date,
  sourceSender?: string,
  sourceEventTitle?: string
): ScheduleEvent | null => {
  if (!calendarPatch) return null;

  const patchStart = parseHalfHourTime(calendarPatch.start_time, 14);
  const patchEnd = parseHalfHourTime(calendarPatch.end_time, patchStart + 1);
  const patchDate = calendarPatch.date ? new Date(`${calendarPatch.date}T00:00:00`) : weekStartDate;
  const rawDayIndex = Math.round((patchDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const day = rawDayIndex >= 0 && rawDayIndex <= 4 ? rawDayIndex : 0;

  return {
    id: `calendar-patch-${calendarPatch.date}-${calendarPatch.start_time}-${calendarPatch.title}`,
    title: calendarPatch.title || 'Scheduled meeting',
    type: calendarPatch.patch_type === 'meeting' ? 'meeting' : 'new',
    day,
    start: patchStart,
    end: patchEnd,
    location: calendarPatch.location || 'Room 204',
    participants: sourceSender || 'School staff',
    notes: sourceEventTitle || 'Injected from backend event',
    variant: 'overlay',
  };
};

export const buildWeeklySchedule = (calendarPatches: Array<Pick<CalendarPatch, 'date' | 'start_time' | 'end_time' | 'title' | 'patch_type' | 'location'>>, weekStartDate: Date, sourceSender?: string, sourceEventTitle?: string) => {
  const overlayEvents = calendarPatches
    .map((patch) => buildCalendarOverlayEvent(patch, weekStartDate, sourceSender, sourceEventTitle))
    .filter((event): event is NonNullable<typeof event> => event !== null);
  return [...BASE_SCHEDULE_EVENTS, ...overlayEvents];
};

export const buildHomeScheduleDays = (today: Date, appliedPatches: AppliedCalendarPatch[]): ScheduleDayView[] => {
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const overlayEvents: ScheduleEvent[] = appliedPatches
    .map<ScheduleEvent | null>((patch) => {
      const overlayDate = patch.date ? new Date(`${patch.date}T00:00:00`) : null;
      const overlayDayIndex = overlayDate ? toMondayFirstDayIndex(overlayDate) : null;
      if (!overlayDate || overlayDayIndex === null) return null;

      return {
        id: `home-calendar-patch-${patch.sourceEventId}-${patch.date}-${patch.start_time}`,
        title: patch.title || 'Scheduled meeting',
        type: (patch.patch_type === 'meeting' ? 'meeting' : 'new') as ScheduleEventType,
        day: overlayDayIndex,
        start: parseHalfHourTime(patch.start_time, 14),
        end: parseHalfHourTime(patch.end_time, 15),
        location: patch.location || 'Room 204',
        participants: 'School staff',
        notes: 'Injected from backend event',
        variant: 'overlay' as const,
      };
    })
    .filter((event): event is ScheduleEvent => event !== null);

  return [today, nextDay].map((date, index) => {
    const dayIndex = toMondayFirstDayIndex(date);
    const baseEvents = dayIndex === null
      ? []
      : BASE_SCHEDULE_EVENTS.filter(event => event.day === dayIndex);

    const dayEvents = [
      ...baseEvents,
      ...overlayEvents.filter((event) => event.day === dayIndex),
    ];

    return {
      date,
      dayIndex,
      label: formatScheduleColumnLabel(date, index === 0 ? 'Today' : 'Tomorrow'),
      events: [...dayEvents].sort((a, b) => a.start - b.start),
    };
  });
};

export const getNextNotableScheduleOccurrence = (days: ScheduleDayView[]): ScheduleOccurrence | null => {
  const occurrences = days
    .flatMap((day) =>
      day.events.map((event) => ({
        date: day.date,
        event,
      }))
    )
    .filter(({ event }) => event.variant === 'overlay' || event.type !== 'class')
    .sort((left, right) => {
      const leftTime = left.date.getTime() + left.event.start * 60 * 60 * 1000;
      const rightTime = right.date.getTime() + right.event.start * 60 * 60 * 1000;
      return leftTime - rightTime;
    });

  return occurrences[0] ?? null;
};
