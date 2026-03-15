/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Inbox from './pages/Inbox';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import { TasksProvider } from './contexts/TasksContext';
import { SchedulePatchProvider } from './contexts/SchedulePatchContext';

export default function App() {
  return (
    <TasksProvider>
      <SchedulePatchProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </SchedulePatchProvider>
    </TasksProvider>
  );
}
