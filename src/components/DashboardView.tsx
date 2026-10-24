import React, { useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  ArrowRight,
  Database,
  Code2,
  BellRing,
  ShieldCheck,
  Check,
  Smartphone,
  Sparkles,
  Sun
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatThaiDate, 
  formatThaiMonthYear, 
  THAI_DAYS_SHORT, 
  getTodayDateString 
} from '../utils/thaiDate';
import { Task } from '../types';

interface DashboardViewProps {
  onOpenTaskModal: (task?: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenTaskModal }) => {
  const { 
    tasks, 
    categories, 
    selectedDate, 
    setSelectedDate, 
    setActiveView, 
    toggleTaskStatus,
    triggerManualReminder,
    triggerMorningBriefing,
    setActiveTaskForLinePreview,
    setIsLinePhoneOpen,
    setLinePreviewMode,
    setIsLineSetupModalOpen,
    isGoogleSheetModalOpen,
    setIsGoogleSheetModalOpen,
    syncWithGoogleSheet,
    syncingWithSheet,
    openSettingsTab,
    settings
  } = useApp();

  const todayStr = getTodayDateString();

  // Metrics calculation
  const totalTasksCount = tasks.length;
  const todayTasks = tasks.filter(t => t.date === selectedDate);
  const todayPendingTasks = todayTasks.filter(t => t.status !== 'completed');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  
  // Tasks due soon
  const dueSoonTasks = tasks.filter(t => t.status !== 'completed' && (t.priority === 'high' || t.date === todayStr));

  // Calendar calculations
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const currentYear = selectedDateObj.getFullYear();
  const currentMonth = selectedDateObj.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    const prevDate = new Date(currentYear, currentMonth - 1, 1);
    const y = prevDate.getFullYear();
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedDate(`${y}-${m}-01`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentYear, currentMonth + 1, 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedDate(`${y}-${m}-01`);
  };

  const handleDayClick = (dayNumber: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(dayNumber).padStart(2, '0');
    setSelectedDate(`${currentYear}-${m}-${d}`);
  };

  const getCategory = (catId: string) => categories.find(c => c.id === catId);

  // Mobile horizontal 7-day strip around selectedDate
  const weekDays = useMemo(() => {
    const baseDate = new Date(selectedDate + 'T00:00:00');
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateStr = String(d.getDate()).padStart(2, '0');
      const fullStr = `${y}-${m}-${dateStr}`;
      const dayOfWeekIdx = d.getDay();
      days.push({
        dateStr: fullStr,
        dayNum: d.getDate(),
        dayName: THAI_DAYS_SHORT[dayOfWeekIdx],
        isToday: fullStr === todayStr,
        isSelected: fullStr === selectedDate,
        tasksCount: tasks.filter(t => t.date === fullStr).length,
      });
    }
    return days;
  }, [selectedDate, todayStr, tasks]);

  // Dynamic Greeting based on current hour
  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12 
    ? 'อรุณสวัสดิ์ยามเช้า' 
    : currentHour < 17 
    ? 'สวัสดีตอนบ่าย' 
    : 'สวัสดีตอนเย็น';
  
  const todayTotal = todayTasks.length;
  const todayDone = todayTasks.filter(t => t.status === 'completed').length;
  const todayCompletionPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Date Selector - Clean Airy Light Style */}
      <div className="bg-gradient-to-r from-blue-50/90 via-white to-emerald-50/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-blue-100 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {greetingText}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {formatThaiDate(todayStr, { showDayName: true, shortMonth: false })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                ระบบจัดการตารางงาน & แจ้งเตือน LINE
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                {todayTotal === 0 
                  ? 'วันนี้ยังไม่มีนัดหมาย คุณสามารถบันทึกนัดใหม่หรือพิมพ์บอกผ่าน LINE ได้ทันที'
                  : `วันนี้มีภารกิจทั้งหมด ${todayTotal} งาน (เสร็จแล้ว ${todayDone} จาก ${todayTotal} รายการ)`}
              </p>
            </div>
          </div>

          {/* Right: Date selector and quick today progress */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {todayTotal > 0 && (
              <div className="bg-white border border-slate-200/90 px-3.5 py-2 rounded-2xl text-xs text-slate-800 shadow-xs flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-medium">ความคืบหน้าวันนี้</div>
                  <div className="text-sm font-extrabold font-mono text-emerald-600 tabular-nums">
                    {todayCompletionPct}%
                  </div>
                </div>
                <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${todayCompletionPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Date Selector Indicator */}
            <div className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-semibold text-slate-800 shadow-xs transition-colors">
              <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-500 hidden sm:inline text-[11px]">วันที่เลือก:</span>
              <span className="font-bold font-mono text-slate-900 truncate text-[11px]">
                {formatThaiDate(selectedDate, { shortMonth: true })}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="opacity-0 w-0 h-0 absolute pointer-events-none"
                id="dashboard-date-picker"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('dashboard-date-picker') as HTMLInputElement | null;
                  if (el) {
                    if (typeof (el as any).showPicker === 'function') {
                      (el as any).showPicker();
                    } else {
                      el.click();
                    }
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold ml-1 cursor-pointer underline underline-offset-2 shrink-0 min-h-[30px] flex items-center"
              >
                เปลี่ยน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Clean Executive Metric Cards (2x2 on Mobile, 4 columns on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: งานทั้งหมด */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs transition-all hover:border-slate-400 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              งานทั้งหมด
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <ListTodo className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900">
              {totalTasksCount}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">รายการ</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>บันทึกในฐานข้อมูล</span>
          </div>
        </div>

        {/* Card 2: งานที่ต้องทำวันนี้ */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs transition-all hover:border-slate-400 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              งานวันนี้
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900">
              {todayTasks.length}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">รายการ</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-amber-700 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>ค้าง {todayPendingTasks.length} รายการ</span>
          </div>
        </div>

        {/* Card 3: งานใกล้ถึงเวลา */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs transition-all hover:border-slate-400 hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                ด่วน / ใกล้ถึงเวลา
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                <BellRing className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900">
                {dueSoonTasks.length}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">รายการ</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (dueSoonTasks.length > 0) {
                triggerManualReminder(dueSoonTasks[0].id);
              } else if (todayTasks.length > 0) {
                triggerManualReminder(todayTasks[0].id);
              } else if (tasks.length > 0) {
                triggerManualReminder(tasks[0].id);
              }
            }}
            className="mt-2 sm:mt-3 w-full py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 active:scale-95 font-semibold rounded-xl text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[30px]"
          >
            <Send className="w-3 h-3 text-emerald-700" />
            <span className="hidden sm:inline">ส่งเตือน LINE ทันที</span>
            <span className="sm:hidden">ส่งเตือน LINE</span>
          </button>
        </div>

        {/* Card 4: งานเสร็จแล้ว */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs transition-all hover:border-slate-400 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
              งานเสร็จแล้ว
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900">
              {completedTasksCount}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">รายการ</span>
          </div>
          <div className="mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-emerald-700 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>สำเร็จ {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Morning Daily Briefing Bar (สรุปตารางงานตอนเช้าก่อนเริ่มงาน) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Sun className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight">
                สรุปตารางงานประจำวัน (Daily Morning Briefing)
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                ⏰ {settings.morningBriefingTime || '07:30'} น.
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
              น้องเลขาจะรวบรวมงานทั้งหมดของวันนี้ ส่งสรุปเข้า LINE อัตโนมัติตอนเช้าเพื่อให้ทราบตารางงานทั้งวัน
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => triggerMorningBriefing()}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-97 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all min-h-[40px]"
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>ส่งสรุปงานวันนี้เข้า LINE</span>
          </button>

          <button
            onClick={() => {
              setLinePreviewMode('morning-briefing');
              setIsLinePhoneOpen(true);
            }}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer transition-colors shadow-2xs min-h-[40px]"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-600" />
            <span>ดูตัวอย่างการ์ด</span>
          </button>
        </div>
      </div>

      {/* Mobile-Friendly Horizontal Date Strip (Thumb-Zone Ergonomics) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>เลือกวันเพื่อดูงาน (แตะเปลี่ยนวันได้ทันที)</span>
          </div>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="text-[11px] text-slate-700 hover:text-slate-900 font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 cursor-pointer active:scale-95 transition-all min-h-[32px] flex items-center"
          >
            วันนี้
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
          {weekDays.map(item => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.isToday;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex-1 min-w-[50px] sm:min-w-[62px] py-2 sm:py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 relative border min-h-[58px] ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                    : isToday
                    ? 'bg-amber-50/70 text-amber-900 border-amber-300 hover:border-amber-400'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] font-semibold tracking-tight uppercase ${
                  isSelected ? 'text-slate-300' : isToday ? 'text-amber-700 font-bold' : 'text-slate-400'
                }`}>
                  {item.dayName}
                </span>
                <span className={`text-base sm:text-lg font-bold font-mono tabular-nums leading-tight mt-0.5 ${
                  isSelected ? 'text-white' : 'text-slate-900'
                }`}>
                  {item.dayNum}
                </span>
                {item.tasksCount > 0 ? (
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    isSelected ? 'bg-amber-400' : isToday ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                ) : (
                  <span className="w-1.5 h-1.5 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Section: Calendar on Left & Tasks Due Today on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Monthly Calendar View */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs">
          {/* Calendar Header with Thai Month */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight px-1 flex items-center gap-1.5 sm:gap-2">
                <span>{formatThaiMonthYear(currentYear, currentMonth)}</span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded-full font-mono border border-slate-200/80">
                  {daysInMonth} วัน
                </span>
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-xs px-3 sm:px-3.5 py-1 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-full shadow-xs transition-all cursor-pointer min-h-[32px]"
            >
              วันนี้
            </button>
          </div>

          {/* Priority Color Legend in Dashboard Calendar */}
          <div className="flex items-center justify-between text-[11px] pt-2 pb-1 px-0.5 border-t border-slate-100 flex-wrap gap-1.5">
            <span className="text-slate-500 font-medium text-[10px]">สีระดับความสำคัญ:</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> สูง
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ปานกลาง
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ต่ำ
              </span>
            </div>
          </div>

          {/* Days of Week Header - Clean, Refined Neutral */}
          <div className="grid grid-cols-7 gap-1 pt-1.5 pb-2 text-center text-[10px] sm:text-xs font-semibold text-slate-500">
            {THAI_DAYS_SHORT.map((day, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              return (
                <div key={day} className={`py-1 rounded-md ${isWeekend ? 'text-rose-500/80 font-bold' : 'text-slate-600'}`}>
                  {day}
                </div>
              );
            })}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Blank cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[50px] sm:min-h-[70px] p-1 bg-slate-50/50 rounded-xl sm:rounded-2xl"></div>
            ))}

            {/* Days in current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const mStr = String(currentMonth + 1).padStart(2, '0');
              const dStr = String(dayNum).padStart(2, '0');
              const cellDateStr = `${currentYear}-${mStr}-${dStr}`;
              
              const isSelected = cellDateStr === selectedDate;
              const isToday = cellDateStr === todayStr;
              const dayTasks = tasks.filter(t => t.date === cellDateStr);
              const hasHighPriority = dayTasks.some(t => t.priority === 'high' && t.status !== 'completed');

              return (
                <div
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`min-h-[52px] sm:min-h-[74px] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between border ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20'
                      : isToday
                      ? 'border-amber-400 bg-amber-50/50 hover:border-amber-500'
                      : hasHighPriority
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                      : 'border-slate-200/70 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-amber-500 text-white shadow-xs'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {hasHighPriority && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="มีงานความสำคัญสูง" />
                      )}
                    </div>
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] sm:text-[10px] text-slate-700 font-mono font-bold bg-slate-100 px-1 rounded-md border border-slate-200/60">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Mobile Task Dots (<640px) Colored by Priority */}
                  <div className="flex sm:hidden items-center justify-center gap-0.5 mt-1 flex-wrap min-h-[8px]">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isDone = task.status === 'completed';
                      const dotColor = isDone
                        ? '#94A3B8'
                        : task.priority === 'high'
                        ? '#F43F5E'
                        : task.priority === 'medium'
                        ? '#F59E0B'
                        : '#10B981';
                      return (
                        <span
                          key={task.id}
                          className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: dotColor }}
                          title={`${task.time} ${task.title}`}
                        />
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    )}
                  </div>

                  {/* Tablet/Desktop Micro task pills (>=640px) with Priority Colors */}
                  <div className="hidden sm:block mt-1 space-y-1">
                    {dayTasks.slice(0, 2).map(task => {
                      const isDone = task.status === 'completed';
                      const pColor = task.priority === 'high'
                        ? { bg: 'bg-rose-50 text-rose-900 border-rose-200', dot: 'bg-rose-500' }
                        : task.priority === 'medium'
                        ? { bg: 'bg-amber-50 text-amber-950 border-amber-200', dot: 'bg-amber-500' }
                        : { bg: 'bg-emerald-50 text-emerald-950 border-emerald-200', dot: 'bg-emerald-500' };

                      return (
                        <div
                          key={task.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center justify-between border shadow-2xs ${
                            isDone
                              ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                              : `${pColor.bg}`
                          }`}
                          title={`${task.time} ${task.title} (ความสำคัญ: ${task.priority === 'high' ? 'สูง' : task.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'})`}
                        >
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-slate-400' : pColor.dot}`} />
                            <span className="truncate">{task.title}</span>
                          </div>
                          <span className="font-mono text-[8px] font-bold opacity-80 shrink-0 ml-0.5">{task.time}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-500 text-center font-mono font-semibold">
                        +{dayTasks.length - 2} งาน
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tasks Due Today */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col h-full">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                งานที่ต้องทำวันนี้
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {formatThaiDate(selectedDate, { shortMonth: true })}
              </span>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-mono tabular-nums">
              {todayTasks.length} รายการ
            </span>
          </div>

          {/* Task list container */}
          <div className="flex-1 py-3 space-y-2 overflow-y-auto max-h-[420px]">
            {todayTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ListTodo className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
                <p className="text-xs font-medium">ไม่มีงานที่บันทึกไว้ในวันนี้</p>
                <button
                  onClick={() => onOpenTaskModal()}
                  className="mt-3 text-xs text-slate-700 hover:text-slate-900 font-bold hover:underline cursor-pointer"
                >
                  + เพิ่มงานสำหรับวันนี้
                </button>
              </div>
            ) : (
              todayTasks.map(task => {
                const cat = getCategory(task.categoryId);
                const isCompleted = task.status === 'completed';
                const priorityBorder = task.priority === 'high' 
                  ? 'border-l-4 border-l-rose-500' 
                  : task.priority === 'medium' 
                  ? 'border-l-4 border-l-amber-500' 
                  : 'border-l-4 border-l-emerald-500';

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-2.5 sm:gap-3 group ${priorityBorder} ${
                      isCompleted
                        ? 'bg-slate-50/70 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs shadow-2xs'
                    }`}
                  >
                    {/* Checkbox with large mobile touch hitbox >= 44x44px */}
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="min-w-[44px] min-h-[44px] -ml-2 -mt-2 p-2.5 flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform"
                      title={isCompleted ? 'คลิกเพื่อเปลี่ยนเป็นยังไม่เสร็จ' : 'คลิกเพื่อทำเครื่องหมายว่าเสร็จแล้ว'}
                      aria-label={isCompleted ? 'เสร็จแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 hover:border-slate-500 bg-white'
                      }`}>
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>

                    {/* Task Details (Clickable on Mobile/Tablet to open modal) */}
                    <div 
                      onClick={() => onOpenTaskModal(task)}
                      className="flex-1 min-w-0 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {task.time} น.
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-bold leading-snug truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900 hover:text-slate-600 transition-colors'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
                        {/* Category badge */}
                        <span
                          className="px-2 py-0.5 rounded-full font-semibold border"
                          style={{
                            backgroundColor: `${cat?.color || '#0071E3'}12`,
                            borderColor: `${cat?.color || '#0071E3'}25`,
                            color: cat?.color || '#0071E3',
                          }}
                        >
                          {cat?.name || task.categoryId}
                        </span>

                        {/* Priority indicator */}
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full border ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {task.priority === 'high' ? '🔴 สูง' : task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ต่ำ'}
                        </span>

                        {task.reminded && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            เตือนแล้ว
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Always-Visible LINE Notification Action */}
                    <div className="shrink-0 flex items-center self-center sm:self-start">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTaskForLinePreview(task);
                          setIsLinePhoneOpen(true);
                          triggerManualReminder(task.id);
                        }}
                        title="กดส่งข้อความแจ้งเตือนงานนี้เข้า LINE"
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                          task.reminded
                            ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/80'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <Send className="w-3 h-3 shrink-0" />
                        <span className="hidden sm:inline">{task.reminded ? 'เตือนแล้ว (ส่งซ้ำ)' : 'ส่ง LINE'}</span>
                        <span className="sm:hidden">{task.reminded ? 'ส่งซ้ำ' : 'LINE'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom view all link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onOpenTaskModal()}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer min-h-[36px] flex items-center"
            >
              + เพิ่มงานใหม่
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section 1: ระบบทำงานอัตโนมัติ (Automated Workflow) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              ระบบทำงานอัตโนมัติ (Automated Workflow)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ขั้นตอนการทำงาน 4 ขั้นตอนตั้งแต่บันทึกงานจนถึงแจ้งเตือนเข้า LINE OA
            </p>
          </div>
          <button
            onClick={() => setIsLinePhoneOpen(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span>เปิดดูหน้าจอ LINE Reminder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3">ตั้งค่างาน</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              เพิ่มงาน / กำหนดวันและเวลา / เลือกระดับความสำคัญ / กำหนดผู้รับผิดชอบ
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3">ระบบตรวจสอบเวลา</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ตรวจสอบงานตามเวลาที่ตั้งไว้ล่วงหน้า (เช่น ก่อน 15 นาที, 30 นาที) อัตโนมัติ
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3">ส่งแจ้งเตือน LINE</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ส่ง Flex Message เข้า LINE OA ของคุณหรือกลุ่มทีม พร้อมปุ่มเปิดดูและปุ่มเสร็จแล้ว
            </p>
            <button
              onClick={() => openSettingsTab('line')}
              className="mt-3 w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-3 h-3 text-white" />
              <span>จัดการ & ตั้งค่า LINE OA ↗</span>
            </button>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-3">ทำงานตามแผน</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ทำงานได้ตรงเวลา ลดความผิดพลาด และบันทึกผลงานลงใน Google Sheets ทันที
            </p>
            <button
              onClick={() => openSettingsTab('sheets')}
              className="mt-3 w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 active:scale-97 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
            >
              <Database className="w-3 h-3 text-emerald-600" />
              <span>จัดการ & ตั้งค่า Google Sheets ↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section 2: เทคโนโลยีที่ใช้ & ประโยชน์ที่จะได้รับ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Tech Stack */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            เทคโนโลยีที่ใช้ (Architecture)
          </h3>
          <div className="flex items-center justify-between mt-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 text-center text-xs">
            <div className="flex-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-1.5 font-bold shadow-2xs">
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-bold text-slate-900">Google Sheets</div>
              <div className="text-[10px] text-slate-500">เก็บข้อมูลงานทั้งหมด</div>
            </div>

            <div className="text-slate-400 font-bold text-sm">→</div>

            <div className="flex-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto mb-1.5 font-bold shadow-2xs">
                <Code2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-bold text-slate-900">Apps Script</div>
              <div className="text-[10px] text-slate-500">ประมวลผล & ทำงาน</div>
            </div>

            <div className="text-slate-400 font-bold text-sm">→</div>

            <div className="flex-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-1.5 font-bold shadow-2xs">
                <Smartphone className="w-4 h-4 text-[#00B900]" />
              </div>
              <div className="font-bold text-slate-900">LINE OA</div>
              <div className="text-[10px] text-slate-500">ส่งแจ้งเตือนอัตโนมัติ</div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            ประโยชน์ที่คุณจะได้รับ
          </h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center text-xs font-bold">✓</span>
              <span><strong>จัดการงานได้อย่างเป็นระบบ</strong> ไม่ตกหล่นแม้มีงานจำนวนมาก</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center text-xs font-bold">✓</span>
              <span><strong>ไม่พลาดทุกงานสำคัญ</strong> แจ้งเตือนตรงเวลาผ่าน LINE</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center text-xs font-bold">✓</span>
              <span><strong>ประหยัดเวลาติดตามงาน</strong> ไม่ต้องคอยเช็คหรือโทรถามทีม</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center text-xs font-bold">✓</span>
              <span><strong>ข้อมูลปลอดภัย</strong> เป็นของคุณเอง 100% อยู่ใน Google ของผู้ใช้</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
