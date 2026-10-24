import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  FolderKanban, 
  Users, 
  Settings, 
  Smartphone, 
  Table, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { useApp, ActiveView } from '../context/AppContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { 
    activeView, 
    setActiveView, 
    openSettingsTab,
    settingsTab,
    isLinePhoneOpen, 
    setIsLinePhoneOpen,
    tasks,
    settings,
    syncStatus,
    syncWithGoogleSheet,
    syncingWithSheet
  } = useApp();

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const menuItems: { id: ActiveView; label: string; icon: React.ReactNode; count?: number; badge?: string }[] = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'calendar', label: 'ปฏิทินงาน', icon: <CalendarDays className="w-4 h-4" /> },
    { 
      id: 'tasks', 
      label: 'รายการงาน', 
      icon: <CheckSquare className="w-4 h-4" />, 
      count: tasks.filter(t => t.status !== 'completed').length
    },
    { 
      id: 'settings', 
      label: 'ตั้งค่าระบบ', 
      icon: <Settings className="w-4 h-4" />,
      badge: 'ศูนย์รวม'
    },
  ];

  const sidebarContent = (
    <aside className="w-72 max-w-[85vw] bg-white text-slate-700 flex flex-col shrink-0 select-none border-r border-slate-200/80 h-full shadow-xs">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20 shrink-0 tracking-tight">
            👩‍💼
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate flex items-center gap-1.5">
              <span className="truncate">{settings.organizationName || 'ระบบน้องเลขา'}</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/70 px-1.5 py-0.5 rounded-md font-semibold shrink-0">เลขา AI</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00B900] inline-block animate-pulse"></span>
              <span>พร้อมแจ้งเตือน LINE</span>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer active:scale-95"
            title="ปิดเมนู"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          เมนูหลัก
        </div>
        {menuItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => handleSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] active:scale-97 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tabular-nums ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.id === 'settings' && !isActive && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    5 ส่วน
                  </span>
                )}
              </button>

              {/* Sub-menu when Settings is active */}
              {item.id === 'settings' && isActive && (
                <div className="pl-6 pr-1 py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      openSettingsTab('line');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      settingsTab === 'line'
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>📱 LINE OA & สรุปเช้า</span>
                  </button>
                  <button
                    onClick={() => {
                      openSettingsTab('sheets');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      settingsTab === 'sheets'
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>📊 Google Sheets</span>
                  </button>
                  <button
                    onClick={() => {
                      openSettingsTab('categories');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      settingsTab === 'categories'
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>📁 หมวดหมู่งาน</span>
                  </button>
                  <button
                    onClick={() => {
                      openSettingsTab('users');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      settingsTab === 'users'
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>👥 สมาชิกในทีม</span>
                  </button>
                  <button
                    onClick={() => {
                      openSettingsTab('preferences');
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] transition-colors cursor-pointer ${
                      settingsTab === 'preferences'
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>🔔 เวลาเตือน & บันทึก</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* LINE OA Live Simulator Toggle */}
        <div className="pt-5 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          ระบบจำลอง (Simulation)
        </div>
        <button
          onClick={() => {
            setIsLinePhoneOpen(!isLinePhoneOpen);
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
            isLinePhoneOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs font-bold'
              : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#00B900]" />
            <span>จำลองแจ้งเตือน LINE</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            isLinePhoneOpen ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {isLinePhoneOpen ? 'เปิดอยู่' : 'จำลอง'}
          </span>
        </button>

        {/* Quick Sync Button */}
        <button
          onClick={() => {
            syncWithGoogleSheet();
            if (onCloseMobile) onCloseMobile();
          }}
          disabled={syncingWithSheet}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50 shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Table className="w-4 h-4 text-emerald-600" />
            <span>{syncingWithSheet ? 'กำลังซิงค์...' : 'ซิงค์ Google Sheets'}</span>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </nav>

      {/* Sync Status Banner */}
      {syncStatus.message && (
        <div className="px-3.5 py-2 mx-3 mb-3 text-[11px] rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 truncate shadow-2xs font-medium">
          {syncStatus.message}
        </div>
      )}

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="text-sm">👩‍💼</span>
            <span>ระบบน้องเลขา</span>
          </span>
          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md font-mono font-semibold">v1.2</span>
        </div>
        <p className="text-[11px] text-slate-500">ผู้ช่วยจัดการตารางงาน & เตือนผ่าน LINE</p>
        <div className="pt-0.5 text-[10px] text-slate-500">
          <span>น้องเลขาพร้อมดูแลตารางงานของคุณค่ะ</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (1024px+) */}
      <div className="hidden lg:block h-screen sticky top-0 z-30">
        {sidebarContent}
      </div>

      {/* Mobile & Tablet Drawer with Overlay (<1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
