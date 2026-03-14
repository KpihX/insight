import { DashboardFeedItem } from '../types/api';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface WellbeingMetrics {
  pendingActionItems: DashboardFeedItem[];
  urgentCount: number;
  importantCount: number;
  deadlinesCount: number;
  score: number;
  label: 'Good' | 'Steady' | 'Busy' | 'Overloaded';
  workloadLabel: 'Light' | 'Moderate' | 'High';
  urgencyLabel: 'Low' | 'Elevated' | 'High';
  deadlinesLabel: string;
  workloadPercent: number;
  urgencyPercent: number;
  deadlinesPercent: number;
  strokeOffset: number;
}

export function computeWellbeingMetrics(
  items: DashboardFeedItem[],
  doneIds: Set<string>,
  externalDeadlinesCount?: number
): WellbeingMetrics {
  const pendingActionItems = items.filter(item => item.action_required && !doneIds.has(item.id));
  const urgentCount = pendingActionItems.filter(item => item.urgent).length;
  const importantCount = pendingActionItems.filter(item => item.important).length;
  const derivedDeadlinesCount = pendingActionItems.filter(
    item => item.category === 'deadline_or_form' || item.category === 'schedule_change'
  ).length;
  const deadlinesCount = externalDeadlinesCount ?? derivedDeadlinesCount;

  const workloadPercent = clamp(18 + pendingActionItems.length * 11, 12, 100);
  const urgencyPercent = clamp(8 + urgentCount * 28, 8, 100);
  const deadlinesPercent = clamp(deadlinesCount === 0 ? 8 : deadlinesCount * 34, 8, 100);
  const score = clamp(
    94 - pendingActionItems.length * 4 - urgentCount * 16 - deadlinesCount * 10 - importantCount * 3,
    20,
    95
  );

  return {
    pendingActionItems,
    urgentCount,
    importantCount,
    deadlinesCount,
    score,
    label: score >= 82 ? 'Good' : score >= 65 ? 'Steady' : score >= 45 ? 'Busy' : 'Overloaded',
    workloadLabel: pendingActionItems.length >= 7 ? 'High' : pendingActionItems.length >= 4 ? 'Moderate' : 'Light',
    urgencyLabel: urgentCount >= 3 ? 'High' : urgentCount >= 1 ? 'Elevated' : 'Low',
    deadlinesLabel:
      deadlinesCount === 0 ? 'No deadline pressure' : deadlinesCount === 1 ? '1 due soon' : `${deadlinesCount} due soon`,
    workloadPercent,
    urgencyPercent,
    deadlinesPercent,
    strokeOffset: 163.4 - (163.4 * score) / 100,
  };
}
