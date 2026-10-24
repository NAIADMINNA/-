import { Plus, Smartphone, RefreshCw, Download, Calendar, Menu, Bot, Send, Database, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatThaiDate } from '../utils/thaiDate';

interface HeaderProps {
  onOpenAddTask: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTask, onToggleMobileMenu }) => {
  const { 
    selectedDate, 
    activeView, 
    setActiveView, 
    isLinePhoneOpen, 
    setIsLinePhoneOpen,
    setIsLineSetupModalOpen,
    setIsGoogleSheetModalOpen,
    settings,
    syncWithGoogleSheet,
    syncingWithSheet,
    exportToCsvFile
  } = useApp();

  const isLineConfigured = Boolean(settings.lineChannelAccessToken && settings.lineUserId);
  const isSheetConfigured = Boolean(settings.googleSheetWebhookUrl);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-6 sticky top-0 z-20 shadow-2xs">
      {/* Zone 1: Context Title & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile & Tablet Hamburger Toggle (<1024px) */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
          title="เปิดเมนูหลัก"
          aria-label="เปิดเมนู"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Brand wordmark / Title */}
        <div className="flex items-center gap-2 truncate">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-base sm:text-lg">👩‍💼</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
              {settings.organizationName || 'ระบบน้องเลขา'}
            </span>
          </div>

          {/* Desktop & Tablet Trust Tag */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B900] inline-block"></span>
            <span>LINE เลขาเตือนงาน</span>
          </span>
        </div>

        {/* Selected Date on Tablet & Desktop */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 pl-1 shrink-0">
          <span>·</span>
          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80 text-[11px] truncate max-w-[200px]">
            {formatThaiDate(selectedDate, { showDayName: true, shortMonth: true })}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Desktop only 1024px+) */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'dashboard' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5' : ''
          }`}
        >
          ภาพรวมวันนี้
        </button>
        <button
          onClick={() => setActiveView('calendar')}
          className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'calendar' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5' : ''
          }`}
        >
          ปฏิทินรายเดือน
        </button>
        <button
          onClick={() => setActiveView('tasks')}
          className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'tasks' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5' : ''
          }`}
        >
          รายการงานทั้งหมด
        </button>
        <button
          onClick={() => setActiveView('settings')}
          className={`hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'settings' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5' : ''
          }`}
        >
          ตั้งค่าระบบ
        </button>
        <button
          onClick={() => exportToCsvFile()}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-2.5 py-1 rounded-full text-[11px]"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-semibold text-slate-700">CSV Export</span>
        </button>
        <button
          onClick={() => setIsLinePhoneOpen(!isLinePhoneOpen)}
          className={`transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-full border text-[11px] ${
            isLinePhoneOpen
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold'
              : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 font-medium'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#00B900]" />
          <span>{isLinePhoneOpen ? 'ซ่อนจำลอง LINE' : 'ดู LINE จำลอง'}</span>
        </button>
      </nav>

      {/* Zone 3: Action Buttons (Touch-friendly & Responsive) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Consolidated System Settings Button */}
        <button
          onClick={() => setActiveView('settings')}
          title="ตั้งค่าระบบ: LINE OA, Google Sheets, หมวดหมู่, สมาชิกทีม"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-2xl border transition-all cursor-pointer shadow-2xs active:scale-95 min-h-[38px] min-w-[38px] justify-center ${
            activeView === 'settings'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">ตั้งค่าระบบ</span>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isLineConfigured && isSheetConfigured ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
        </button>

        {/* Quick Sync Button */}
        <button
          onClick={() => syncWithGoogleSheet()}
          disabled={syncingWithSheet}
          title="กดซิงค์ข้อมูลกับ Google Sheets ทันที"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200 cursor-pointer bg-white shadow-2xs min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingWithSheet ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Add Task Button (hidden on mobile phone because BottomNav has it) */}
        <button
          onClick={onOpenAddTask}
          className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-2xl transition-all shadow-md shadow-blue-500/20 whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มงานใหม่</span>
        </button>
      </div>
    </header>
  );
};
