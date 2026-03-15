import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, Inbox, CheckSquare, Calendar as CalendarIcon } from 'lucide-react';
import SchedulePatchDialog from './SchedulePatchDialog';

export default function Layout() {
  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Home' },
    { to: '/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/tasks', icon: CheckSquare, label: 'To-do' },
    { to: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-surface border-b-[0.5px] border-border-strong flex items-center px-6 h-[52px] sticky top-0 z-10">
        <span className="font-display text-[20px] text-text-main mr-8 tracking-[-0.3px]">insight</span>
        
        <div className="flex gap-[2px] flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-[14px] py-[6px] rounded-lg text-[13px] font-medium flex items-center gap-[6px] transition-colors duration-150 ${
                  isActive
                    ? 'bg-bg text-text-main font-semibold'
                    : 'text-text-2 hover:bg-bg hover:text-text-main'
                }`
              }
            >
              <item.icon className="w-[15px] h-[15px] shrink-0" strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-[10px] ml-auto">
          <span className="text-[11px] px-[9px] py-[3px] rounded-full bg-brand-teal-bg text-brand-teal-text font-medium">
            Teacher
          </span>
          <div className="w-[30px] h-[30px] rounded-full bg-brand-purple-bg text-brand-purple-text text-[12px] font-semibold flex items-center justify-center cursor-pointer">
            MM
          </div>
        </div>
      </nav>

      <main className="flex-1 p-5 px-6 max-w-[1400px] mx-auto w-full">
        <Outlet />
      </main>
      <SchedulePatchDialog />
    </div>
  );
}
