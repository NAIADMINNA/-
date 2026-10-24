import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Send, 
  Trash2, 
  Edit3, 
  Download, 
  Check,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatThaiDate } from '../utils/thaiDate';
import { Task, Priority, TaskStatus } from '../types';

interface TaskListViewProps {
  onOpenTaskModal: (task?: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ onOpenTaskModal }) => {
  const { 
    tasks, 
    categories, 
    users, 
    toggleTaskStatus, 
    deleteTask, 
    triggerManualReminder,
    setActiveTaskForLinePreview,
    setIsLinePhoneOpen,
    exportToCsvFile
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && task.categoryId !== categoryFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const getCategory = (catId: string) => categories.find(c => c.id === catId);
  const getUser = (userId?: string) => users.find(u => u.id === userId);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่องาน, รายละเอียด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Filter Selectors with Calm Style */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold border border-slate-200/80">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รอดำเนินการ
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เสร็จแล้ว
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">ทุกความสำคัญ</option>
            <option value="high">🔴 สูง</option>
            <option value="medium">🟡 ปานกลาง</option>
            <option value="low">🟢 ต่ำ</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={exportToCsvFile}
            title="ดาวน์โหลดไฟล์ CSV สำหรับเปิดใน Google Sheets"
            className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => onOpenTaskModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-97 rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>เพิ่มงาน</span>
          </button>
        </div>
      </div>

      {/* Task Table Container for Desktop (1024px+) */}
      <div className="hidden lg:block bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-12 text-center">สถานะ</th>
                <th className="py-3.5 px-4">ชื่องาน & รายละเอียด</th>
                <th className="py-3.5 px-4">วันที่ & เวลา</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">ความสำคัญ</th>
                <th className="py-3.5 px-4">ผู้รับผิดชอบ</th>
                <th className="py-3.5 px-4 text-center">LINE Reminder</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const cat = getCategory(task.categoryId);
                  const assignee = getUser(task.assigneeId);
                  const isDone = task.status === 'completed';

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isDone ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mx-auto cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'border-slate-300 hover:border-slate-500 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div 
                          onClick={() => onOpenTaskModal(task)}
                          className={`font-bold cursor-pointer hover:text-indigo-600 transition-colors ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{task.time} น.</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {formatThaiDate(task.date, { shortMonth: true })}
                        </div>
                      </td>

                      {/* Category Badge with Color Border */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{
                            backgroundColor: `${cat?.color || '#0071E3'}12`,
                            borderColor: `${cat?.color || '#0071E3'}25`,
                            color: cat?.color || '#0071E3',
                          }}
                        >
                          {cat?.name || task.categoryId}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold text-[11px] px-2 py-0.5 rounded-full border ${
                            task.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {task.priority === 'high' ? '🔴 สูง' : task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ต่ำ'}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {assignee ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-5 h-5 rounded-full ${assignee.avatarColor} text-white text-[10px] flex items-center justify-center font-bold shadow-2xs`}>
                              {assignee.name.charAt(0)}
                            </span>
                            <span className="text-slate-800 font-semibold">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* LINE Reminder Trigger */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveTaskForLinePreview(task);
                            setIsLinePhoneOpen(true);
                            triggerManualReminder(task.id);
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-2xs border active:scale-95 ${
                            task.reminded
                              ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
                              : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{task.reminded ? 'เตือนแล้ว (ส่งซ้ำ)' : 'ส่งเข้า LINE'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenTaskModal(task)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Touch-Friendly Responsive Card Grid for Mobile & Tablet (lg:hidden) */}
      <div className="lg:hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
            ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {filteredTasks.map(task => {
              const cat = getCategory(task.categoryId);
              const assignee = getUser(task.assigneeId);
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Checkbox with generous touch target >= 44x44px */}
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="min-w-[44px] min-h-[44px] -ml-2 -mt-2 p-2.5 flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform"
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                            {task.time} น.
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {formatThaiDate(task.date, { shortMonth: true })}
                          </span>
                        </div>

                        <h4 className={`text-sm font-bold mt-1 leading-snug truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900 hover:text-slate-600 transition-colors'}`}>
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span
                            className="px-2.5 py-0.5 rounded-full font-semibold border"
                            style={{
                              backgroundColor: `${cat?.color || '#0071E3'}12`,
                              borderColor: `${cat?.color || '#0071E3'}25`,
                              color: cat?.color || '#0071E3',
                            }}
                          >
                            {cat?.name || task.categoryId}
                          </span>

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

                          {assignee && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                              <span className={`w-3.5 h-3.5 rounded-full ${assignee.avatarColor} text-white text-[8px] flex items-center justify-center font-bold`}>
                                {assignee.name.charAt(0)}
                              </span>
                              <span>{assignee.name}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Edit & Delete icons */}
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <button
                        onClick={() => onOpenTaskModal(task)}
                        className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                        title="แก้ไขงาน"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl bg-slate-100 hover:bg-rose-50 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                        title="ลบงาน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom: LINE Reminder Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {task.reminded ? '✓ แจ้งเตือนแล้ว' : 'ยังไม่ได้ส่งเตือน'}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTaskForLinePreview(task);
                        setIsLinePhoneOpen(true);
                        triggerManualReminder(task.id);
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                        task.reminded
                          ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/80'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{task.reminded ? 'เตือนแล้ว (ส่งซ้ำ)' : 'ส่งแจ้งเตือน LINE'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
