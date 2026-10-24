import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Send, 
  Check,
  Palette,
  Clock,
  Tag,
  User,
  AlertCircle,
  Calendar as CalendarIcon,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatThaiMonthYear, 
  formatThaiDate, 
  THAI_DAYS_SHORT, 
  getTodayDateString 
} from '../utils/thaiDate';
import { Task, Priority } from '../types';

interface CalendarViewProps {
  onOpenTaskModal: (task?: Task, defaultDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenTaskModal }) => {
  const { 
    tasks, 
    categories, 
    users,
    selectedDate, 
    setSelectedDate, 
    toggleTaskStatus,
    triggerManualReminder,
    setActiveTaskForLinePreview,
    setIsLinePhoneOpen,
    setLinePreviewMode
  } = useApp();

  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  // Default to 'priority' so priority colors are immediately visible across all scheduled tasks
  const [colorMode, setColorMode] = useState<'priority' | 'category'>('priority');

  const todayStr = getTodayDateString();
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

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filterCategoryId !== 'all' && t.categoryId !== filterCategoryId) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  // Calculate month priority statistics for current month
  const mStr = String(currentMonth + 1).padStart(2, '0');
  const monthTasks = tasks.filter(t => t.date.startsWith(`${currentYear}-${mStr}`));
  const monthHighCount = monthTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
  const monthMediumCount = monthTasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length;
  const monthLowCount = monthTasks.filter(t => t.priority === 'low' && t.status !== 'completed').length;

  const selectedDayTasks = filteredTasks.filter(t => t.date === selectedDate);
  const getCategory = (catId: string) => categories.find(c => c.id === catId);

  // Helper for priority color configuration
  const getPriorityInfo = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          label: 'สูง (High)',
          shortLabel: 'สูง',
          dot: 'bg-rose-500',
          dotHex: '#F43F5E',
          pillBg: 'bg-rose-50/95 text-rose-900 border-rose-200/90 hover:bg-rose-100/90',
          timeColor: 'text-rose-700',
          timeBadge: 'bg-rose-50 text-rose-700 border-rose-200',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          borderLeft: 'border-l-rose-500',
          borderLeftCard: 'border-l-[4px] border-l-rose-500',
          cardGlow: 'hover:border-rose-300',
          iconEmoji: '🔴',
        };
      case 'medium':
        return {
          label: 'ปานกลาง (Medium)',
          shortLabel: 'ปานกลาง',
          dot: 'bg-amber-500',
          dotHex: '#F59E0B',
          pillBg: 'bg-amber-50/95 text-amber-950 border-amber-200/90 hover:bg-amber-100/90',
          timeColor: 'text-amber-700',
          timeBadge: 'bg-amber-50 text-amber-800 border-amber-200',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          borderLeft: 'border-l-amber-500',
          borderLeftCard: 'border-l-[4px] border-l-amber-500',
          cardGlow: 'hover:border-amber-300',
          iconEmoji: '🟡',
        };
      case 'low':
      default:
        return {
          label: 'ต่ำ / ทั่วไป (Low)',
          shortLabel: 'ต่ำ',
          dot: 'bg-emerald-500',
          dotHex: '#10B981',
          pillBg: 'bg-emerald-50/95 text-emerald-950 border-emerald-200/90 hover:bg-emerald-100/90',
          timeColor: 'text-emerald-700',
          timeBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          borderLeft: 'border-l-emerald-500',
          borderLeftCard: 'border-l-[4px] border-l-emerald-500',
          cardGlow: 'hover:border-emerald-300',
          iconEmoji: '🟢',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Control Toolbar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Selector & Today button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="เดือนก่อนหน้า"
              aria-label="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-extrabold text-slate-900 tracking-tight">
              {formatThaiMonthYear(currentYear, currentMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
              title="เดือนถัดไป"
              aria-label="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className="text-xs px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            วันนี้
          </button>
        </div>

        {/* Filter Controls & Add Task Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>หมวดหมู่:</span>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              <option value="all">ทั้งหมด ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>ความสำคัญ:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
            >
              <option value="all">ทั้งหมด</option>
              <option value="high">🔴 สูง (High)</option>
              <option value="medium">🟡 ปานกลาง (Medium)</option>
              <option value="low">🟢 ต่ำ (Low)</option>
            </select>
          </div>

          <button
            onClick={() => onOpenTaskModal(undefined, selectedDate)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-97 rounded-2xl transition-all cursor-pointer shadow-md shadow-blue-500/20 min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>เพิ่มงาน</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLinePreviewMode('chat-record');
              setIsLinePhoneOpen(true);
            }}
            title="พิมพ์สั่งงานผ่าน LINE โดยตรงโดยไม่ต้องเปิดฟอร์ม"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100/80 active:scale-97 border border-emerald-200 rounded-2xl transition-all cursor-pointer shadow-2xs min-h-[38px]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">พิมพ์สั่งผ่าน LINE</span>
            <span className="sm:hidden">LINE สั่งงาน</span>
          </button>
        </div>
      </div>

      {/* Main Big Calendar Grid */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Priority Color Legend Bar & Display Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
          {/* Priority Color Legend Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600 text-[11px] flex items-center gap-1.5 mr-1">
              <Palette className="w-3.5 h-3.5 text-slate-700" />
              <span>สีระดับความสำคัญ:</span>
            </span>

            {/* High Priority Legend Pill */}
            <button
              onClick={() => setFilterPriority(filterPriority === 'high' ? 'all' : 'high')}
              title="คลิกเพื่อกรองเฉพาะงานความสำคัญสูง"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                filterPriority === 'high'
                  ? 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-300 shadow-2xs'
                  : 'bg-rose-50 hover:bg-rose-100/70 border-rose-200 text-rose-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-2xs"></span>
              <span>สูง (High)</span>
              <span className="font-mono text-[10px] text-rose-700 font-bold bg-white px-1.5 py-0.2 rounded-md border border-rose-200/80 ml-0.5">
                {monthHighCount}
              </span>
            </button>

            {/* Medium Priority Legend Pill */}
            <button
              onClick={() => setFilterPriority(filterPriority === 'medium' ? 'all' : 'medium')}
              title="คลิกเพื่อกรองเฉพาะงานความสำคัญปานกลาง"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                filterPriority === 'medium'
                  ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-300 shadow-2xs'
                  : 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-2xs"></span>
              <span>ปานกลาง (Medium)</span>
              <span className="font-mono text-[10px] text-amber-700 font-bold bg-white px-1.5 py-0.2 rounded-md border border-amber-200/80 ml-0.5">
                {monthMediumCount}
              </span>
            </button>

            {/* Low Priority Legend Pill */}
            <button
              onClick={() => setFilterPriority(filterPriority === 'low' ? 'all' : 'low')}
              title="คลิกเพื่อกรองเฉพาะงานความสำคัญต่ำ/ทั่วไป"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                filterPriority === 'low'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 ring-2 ring-emerald-300 shadow-2xs'
                  : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-2xs"></span>
              <span>ต่ำ / ทั่วไป (Low)</span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.2 rounded-md border border-emerald-200/80 ml-0.5">
                {monthLowCount}
              </span>
            </button>

            {filterPriority !== 'all' && (
              <button
                onClick={() => setFilterPriority('all')}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer font-medium"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Color Display Mode Switcher (Priority vs Category) */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setColorMode('priority')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                colorMode === 'priority'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎨 สีตามความสำคัญ</span>
            </button>
            <button
              type="button"
              onClick={() => setColorMode('category')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                colorMode === 'category'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏷️ สีตามหมวดหมู่</span>
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pb-2 text-center text-xs font-semibold text-slate-500 border-b border-slate-100">
          {THAI_DAYS_SHORT.map((day, idx) => {
            const isWeekend = idx === 0 || idx === 6;
            return (
              <div key={day} className={`py-1 rounded-md ${isWeekend ? 'text-rose-500/80 font-bold' : 'text-slate-600'}`}>
                {day}
              </div>
            );
          })}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-[52px] sm:min-h-[85px] md:min-h-[110px] p-1 sm:p-2 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-transparent"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const mStr = String(currentMonth + 1).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const cellDateStr = `${currentYear}-${mStr}-${dStr}`;

            const isSelected = cellDateStr === selectedDate;
            const isToday = cellDateStr === todayStr;
            const dayTasks = filteredTasks.filter(t => t.date === cellDateStr);

            // Check if day has any high-priority tasks
            const hasHighPriority = dayTasks.some(t => t.priority === 'high' && t.status !== 'completed');
            const hasMediumPriority = dayTasks.some(t => t.priority === 'medium' && t.status !== 'completed');

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDate(cellDateStr)}
                className={`min-h-[52px] sm:min-h-[85px] md:min-h-[110px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group active:scale-95 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                    : isToday
                    ? 'border-amber-400 bg-amber-50/50 hover:border-amber-500'
                    : hasHighPriority
                    ? 'border-rose-200/90 bg-rose-50/20 hover:border-rose-300'
                    : hasMediumPriority
                    ? 'border-amber-200/80 bg-amber-50/15 hover:border-amber-300'
                    : 'border-slate-200/70 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {/* Date header with task counter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-amber-500 text-white shadow-xs'
                          : isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Urgent indicator dot on date header */}
                    {hasHighPriority && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="มีงานด่วน/สำคัญสูง" />
                    )}
                  </div>
                  
                  {/* Task count pill */}
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] sm:text-[10px] text-slate-700 font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded-md border border-slate-200/60">
                      {dayTasks.length}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTaskModal(undefined, cellDateStr);
                    }}
                    title="เพิ่มงานในวันนี้"
                    className="hidden sm:block opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-800 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mobile Task Dots Indicator (<640px) Colored by Priority */}
                <div className="flex sm:hidden items-center justify-center gap-1 mt-1 flex-wrap min-h-[8px]">
                  {dayTasks.slice(0, 3).map((task) => {
                    const isDone = task.status === 'completed';
                    const priorityInfo = getPriorityInfo(task.priority);
                    const cat = getCategory(task.categoryId);
                    const dotColor = isDone 
                      ? '#94A3B8' 
                      : colorMode === 'priority' 
                      ? priorityInfo.dotHex 
                      : (cat?.color || priorityInfo.dotHex);

                    return (
                      <span
                        key={task.id}
                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: dotColor }}
                        title={`${task.time} ${task.title} (ความสำคัญ: ${priorityInfo.shortLabel})`}
                      />
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  )}
                </div>

                {/* Tablet / Desktop Task List (>=640px) with Priority Colors */}
                <div className="hidden sm:block mt-1 space-y-1 flex-1 overflow-y-auto max-h-[64px]">
                  {dayTasks.slice(0, 2).map(task => {
                    const cat = getCategory(task.categoryId);
                    const isDone = task.status === 'completed';
                    const priorityInfo = getPriorityInfo(task.priority);

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTaskModal(task);
                        }}
                        className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-md truncate font-bold flex items-center justify-between border cursor-pointer transition-all ${
                          isDone
                            ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            : colorMode === 'priority'
                            ? `${priorityInfo.pillBg} ${priorityInfo.borderLeft} border-l-[3px] shadow-2xs hover:scale-101`
                            : 'shadow-2xs hover:scale-101 border-slate-200/90 border-l-[3px]'
                        }`}
                        style={
                          !isDone && colorMode === 'category'
                            ? {
                                backgroundColor: `${cat?.color || '#0071E3'}15`,
                                borderColor: `${cat?.color || '#0071E3'}30`,
                                borderLeftColor: cat?.color || '#0071E3',
                                color: cat?.color || '#0071E3',
                              }
                            : undefined
                        }
                        title={`เวลา: ${task.time} น. | ชื่องาน: ${task.title} | ระดับความสำคัญ: ${priorityInfo.label}`}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                          {/* Priority Colored Dot */}
                          <span 
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-slate-400' : priorityInfo.dot}`}
                            title={`ความสำคัญ: ${priorityInfo.shortLabel}`}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>

                        {/* Scheduled Time */}
                        <span className={`font-mono text-[9px] font-bold opacity-85 shrink-0 ml-1 ${
                          !isDone && colorMode === 'priority' ? priorityInfo.timeColor : ''
                        }`}>
                          {task.time}
                        </span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <div className="text-[9px] text-slate-500 font-mono text-center font-bold">
                      +{dayTasks.length - 2} งาน
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Task Detail Drawer with Prominent Priority Accents */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-slate-700" />
              <span>รายละเอียดตารางงานวันที่ {formatThaiDate(selectedDate, { showDayName: true })}</span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200/70">
                {selectedDayTasks.length} งาน
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงเวลาที่นัดหมาย ระดับความสำคัญ (สีตามระดับ) หมวดหมู่ และส่งแจ้งเตือนเข้า LINE ได้ทันที
            </p>
          </div>
          <button
            onClick={() => onOpenTaskModal(undefined, selectedDate)}
            className="text-xs font-semibold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full cursor-pointer transition-colors self-start sm:self-auto"
          >
            + เพิ่มงานในวันที่เลือก
          </button>
        </div>

        {/* Selected Day Task Cards with Priority Color Left Bar */}
        <div className="mt-3 space-y-2.5">
          {selectedDayTasks.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-medium space-y-1">
              <div className="text-base">📅</div>
              <div>ไม่มีงานที่กำหนดในวันที่ {formatThaiDate(selectedDate)}</div>
              <p className="text-[11px] text-slate-400">คุณสามารถกดปุ่ม "+ เพิ่มงานในวันที่เลือก" เพื่อเริ่มนัดหมายงานใหม่ได้</p>
            </div>
          ) : (
            selectedDayTasks.map(task => {
              const cat = getCategory(task.categoryId);
              const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
              const isDone = task.status === 'completed';
              const priorityInfo = getPriorityInfo(task.priority);

              return (
                <div 
                  key={task.id} 
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone 
                      ? 'bg-slate-50/60 border-slate-200 border-l-[4px] border-l-slate-400 opacity-70' 
                      : `bg-white hover:bg-slate-50/60 border-slate-200/80 ${priorityInfo.borderLeftCard} ${priorityInfo.cardGlow} shadow-2xs`
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Checkbox with large mobile touch hitbox >= 44x44px */}
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="min-w-[44px] min-h-[44px] -ml-2 -mt-1 sm:-my-2 p-2.5 flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform"
                      title={isDone ? 'คลิกเพื่อเปลี่ยนเป็นยังไม่เสร็จ' : 'คลิกเพื่อทำเครื่องหมายว่าเสร็จแล้ว'}
                      aria-label={isDone ? 'เสร็จแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 hover:border-slate-500 bg-white'
                      }`}>
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>

                    <div 
                      onClick={() => onOpenTaskModal(task)}
                      className="min-w-0 flex-1 cursor-pointer select-none"
                    >
                      {/* Top line: Time badge colored by priority + Title + Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Colored Time Pill */}
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          isDone ? 'bg-slate-100 text-slate-500 border-slate-200' : priorityInfo.timeBadge
                        }`}>
                          <Clock className="w-3 h-3 inline" />
                          <span>{task.time} น.</span>
                        </span>

                        {/* Task Title */}
                        <span className={`text-xs sm:text-sm font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900 hover:text-slate-600 transition-colors'}`}>
                          {task.title}
                        </span>

                        {/* Priority Badge with Emoji & Color */}
                        <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          isDone ? 'bg-slate-100 text-slate-500 border-slate-200' : priorityInfo.badge
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-slate-400' : priorityInfo.dot}`}></span>
                          <span>ความสำคัญ: {priorityInfo.shortLabel}</span>
                        </span>

                        {/* Category Badge */}
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                          style={{
                            backgroundColor: `${cat?.color || '#0071E3'}12`,
                            borderColor: `${cat?.color || '#0071E3'}25`,
                            color: cat?.color || '#0071E3',
                          }}
                        >
                          {cat?.name || task.categoryId}
                        </span>

                        {/* Assignee Pill if assigned */}
                        {assignee && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200/70">
                            <span className={`w-3.5 h-3.5 rounded-full ${assignee.avatarColor} text-white text-[8px] flex items-center justify-center font-bold`}>
                              {assignee.name.charAt(0)}
                            </span>
                            <span>{assignee.name}</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-10 sm:pl-0">
                    <button
                      onClick={() => {
                        setActiveTaskForLinePreview(task);
                        setIsLinePhoneOpen(true);
                        triggerManualReminder(task.id);
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-2xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                        task.reminded
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{task.reminded ? 'เตือนแล้ว (ส่งซ้ำ)' : 'แจ้งเตือน LINE'}</span>
                    </button>
                    <button
                      onClick={() => onOpenTaskModal(task)}
                      className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer active:scale-95"
                    >
                      แก้ไข
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
