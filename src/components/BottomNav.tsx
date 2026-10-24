import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Smartphone, 
  Plus, 
  Settings 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  onOpenAddTask: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddTask }) => {
  const { activeView, setActiveView, isLinePhoneOpen, setIsLinePhoneOpen, tasks } = useApp();

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <nav 
      aria-label="เมนูหลักแถบล่างสำหรับมือถือและแท็บเล็ต"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-2px_16px_rgba(0,0,0,0.05)] px-2 pt-1.5 pb-2.5 sm:pb-3"
      style={{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md sm:max-w-xl mx-auto relative">
        {/* Dashboard */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label="ภาพรวม"
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${activeView === 'dashboard' ? 'stroke-[2.5] text-blue-600' : ''}`} />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeView === 'dashboard' ? 'font-bold text-blue-600' : 'font-medium'}`}>
            ภาพรวม
          </span>
          {activeView === 'dashboard' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>
          )}
        </button>

        {/* Calendar */}
        <button
          onClick={() => setActiveView('calendar')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'calendar' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label="ปฏิทิน"
        >
          <div className="relative">
            <CalendarDays className={`w-5 h-5 ${activeView === 'calendar' ? 'stroke-[2.5] text-blue-600' : ''}`} />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeView === 'calendar' ? 'font-bold text-blue-600' : 'font-medium'}`}>
            ปฏิทิน
          </span>
          {activeView === 'calendar' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>
          )}
        </button>

        {/* Center Prominent Add Task Button (+) */}
        <div className="flex items-center justify-center flex-1 -mt-6">
          <button
            onClick={onOpenAddTask}
            className="flex flex-col items-center justify-center cursor-pointer group active:scale-90 transition-transform"
            title="เพิ่มงานใหม่"
            aria-label="เพิ่มงานใหม่"
          >
            <div className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-[3px] border-white transition-all">
              <Plus className="w-6 h-6 stroke-[2.8]" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 mt-0.5 tracking-tight">
              เพิ่มงาน
            </span>
          </button>
        </div>

        {/* Task List */}
        <button
          onClick={() => setActiveView('tasks')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-2xl transition-all cursor-pointer relative active:scale-95 ${
            activeView === 'tasks' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label="รายการงาน"
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 ${activeView === 'tasks' ? 'stroke-[2.5] text-blue-600' : ''}`} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 bg-blue-600 text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center px-1 shadow-xs border border-white">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeView === 'tasks' ? 'font-bold text-blue-600' : 'font-medium'}`}>
            รายการงาน
          </span>
          {activeView === 'tasks' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveView('settings')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-2xl transition-all cursor-pointer active:scale-95 ${
            activeView === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label="ตั้งค่าระบบ"
        >
          <div className="relative">
            <Settings className={`w-5 h-5 ${activeView === 'settings' ? 'stroke-[2.5] text-blue-600' : ''}`} />
          </div>
          <span className={`text-[11px] mt-0.5 tracking-tight ${activeView === 'settings' ? 'font-bold text-blue-600' : 'font-medium'}`}>
            ตั้งค่า
          </span>
          {activeView === 'settings' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-0.5"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
