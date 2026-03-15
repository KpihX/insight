import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDashboardFeed } from '../services/api';
import { DashboardFeedItem } from '../types/api';
import {
  DEFAULT_DASHBOARD_ROLE,
  DEFAULT_DASHBOARD_STAFF_ID,
  REFRESH_INTERVAL_MS,
  USE_REAL_API,
} from '../config/runtime';

interface TasksContextType {
  tasks: DashboardFeedItem[];
  addTask: (task: DashboardFeedItem) => void;
  toggleTaskDone: (id: string) => void;
  doneTasks: Set<string>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<DashboardFeedItem[]>([]);
  const [doneTasks, setDoneTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const feed = await getDashboardFeed(
          DEFAULT_DASHBOARD_ROLE,
          DEFAULT_DASHBOARD_STAFF_ID,
          undefined,
          true,
          100
        );
        const fetchedActionItems = feed.items || [];
        
        const mockOnlyTasks: DashboardFeedItem[] = USE_REAL_API
          ? []
          : [
              { id: 't6', category: 'class', urgent: false, important: false, action_required: true, title: 'Prepare quiz for 1A — chapter 7', summary: '', sender_label: 'Class', time_label: 'Due: Mon 17 Mar', status: 'pending' },
              { id: 't7', category: 'class', urgent: false, important: false, action_required: true, title: 'Update Moodle grades for 2B', summary: '', sender_label: 'Class', time_label: 'Due: Mon 17 Mar', status: 'pending' },
              { id: 't8', category: 'admin', urgent: false, important: false, action_required: true, title: 'Order classroom supplies', summary: '', sender_label: 'Admin', time_label: 'Due: next week', status: 'pending' },
            ];

        const allActionItems = [...fetchedActionItems, ...mockOnlyTasks];

        setTasks(prev => {
          const manualTasks = prev.filter(t => t.id.startsWith('manual_'));
          return [...manualTasks, ...allActionItems as DashboardFeedItem[]];
        });
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      }
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const addTask = (task: DashboardFeedItem) => {
    setTasks(prev => [task, ...prev]);
  };

  const toggleTaskDone = (id: string) => {
    setDoneTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, toggleTaskDone, doneTasks }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used within TasksProvider');
  return context;
}
