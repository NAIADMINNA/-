import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, AlertCircle, User, Bell, Sparkles, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority } from '../types';
import { getTodayDateString, formatThaiDate } from '../utils/thaiDate';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultDate,
}) => {
  const { addTask, updateTask, categories, users, selectedDate, settings } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || selectedDate || getTodayDateString());
  const [time, setTime] = useState('09:00');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(settings.defaultReminderOffsetMinutes || 15);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDate(taskToEdit.date);
      setTime(taskToEdit.time);
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setAssigneeId(taskToEdit.assigneeId || '');
      setReminderMinutesBefore(taskToEdit.reminderMinutesBefore);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || selectedDate || getTodayDateString());
      setTime('09:00');
      setCategoryId(categories[0]?.id || 'work');
      setPriority('medium');
      setAssigneeId(users[0]?.id || '');
      setReminderMinutesBefore(settings.defaultReminderOffsetMinutes || 15);
    }
  }, [taskToEdit, defaultDate, selectedDate, isOpen, categories, users, settings.defaultReminderOffsetMinutes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time,
        categoryId,
        priority,
        assigneeId: assigneeId || undefined,
        reminderMinutesBefore,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time,
        categoryId,
        priority,
        status: 'pending',
        assigneeId: assigneeId || undefined,
        reminderMinutesBefore,
      });
    }
    onClose();
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92dvh] flex flex-col">
        
        {/* Header - Clean Executive Style */}
        <div className="bg-white border-b border-slate-200/80 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-blue-500/20 shrink-0">
              {taskToEdit ? '✎' : '+'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {taskToEdit ? 'แก้ไขรายละเอียดงาน' : 'เพิ่มงานใหม่'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                To Do List Calendar & LINE Reminder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
            title="ปิด"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              ชื่องาน (Task Title) <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ออกใบเสนอราคา, ประชุมทีม, ตรวจสอบสต็อก..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รายละเอียดเพิ่มเติม / หมายเหตุ:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุสิ่งที่ต้องทำ ลิงก์เอกสาร หรือเงื่อนไขสำคัญ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>วันที่:</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
              />
              <span className="text-[10px] text-indigo-600 font-semibold mt-1 block truncate">
                {formatThaiDate(date, { shortMonth: true })}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>เวลา:</span>
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
              />
            </div>
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>หมวดหมู่:</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer shadow-2xs"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>ความสำคัญ (Priority):</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer shadow-2xs"
              >
                <option value="high">🔴 สูง (High)</option>
                <option value="medium">🟡 ปานกลาง (Medium)</option>
                <option value="low">🟢 ต่ำ (Low)</option>
              </select>
            </div>
          </div>

          {/* Assignee & Reminder Offset */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>ผู้รับผิดชอบ:</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer shadow-2xs"
              >
                <option value="">- ไม่ระบุ -</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-[#00B900]" />
                <span>เตือนผ่าน LINE ล่วงหน้า:</span>
              </label>
              <select
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer shadow-2xs"
              >
                <option value={0}>ตรงเวลาเป๊ะ (0 นาที)</option>
                <option value={15}>ล่วงหน้า 15 นาที</option>
                <option value={30}>ล่วงหน้า 30 นาที</option>
                <option value={60}>ล่วงหน้า 1 ชั่วโมง</option>
                <option value={1440}>ล่วงหน้า 1 วัน</option>
              </select>
            </div>
          </div>

          {/* Morning Briefing Scheduled Notification Notice */}
          <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5 text-orange-950">
                <span>สรุปงานยามเช้าก่อนเริ่มงาน (Morning Briefing)</span>
                <span className="text-[10px] bg-orange-200/70 text-orange-900 font-extrabold px-1.5 py-0.2 rounded font-mono">
                  {settings.morningBriefingTime || '07:30'} น.
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {date > getTodayDateString() ? (
                  <>งานของวันที่ <strong>{formatThaiDate(date, { shortMonth: true })}</strong> จะถูกรวบรวมส่งแจ้งเตือนใน <strong>การ์ดสรุปยามเช้า</strong> เข้า LINE อัตโนมัติเวลา <strong>{settings.morningBriefingTime || '07:30'} น.</strong> ของวันนั้น และเตือนล่วงหน้าก่อนเวลาส่งมอบ {reminderMinutesBefore} นาที</>
                ) : (
                  <>งานนี้จะได้รับการแจ้งเตือนก่อนถึงเวลา {reminderMinutesBefore} นาที และส่งสรุปทุกเช้าเวลา <strong>{settings.morningBriefingTime || '07:30'} น.</strong></>
                )}
              </p>
            </div>
          </div>

          {/* Live LINE Preview with Green Gradient Card */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00B900]" />
                ตัวอย่างข้อความแจ้งเตือน LINE:
              </span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                เตือนก่อน {reminderMinutesBefore} นาที
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-[11px] text-slate-700 space-y-1 shadow-2xs">
              <div className="font-bold text-slate-900 text-xs">📌 งาน: {title || 'ตัวอย่างชื่องาน'}</div>
              <div>📅 วันที่: {formatThaiDate(date, { shortMonth: true })} เวลา: <strong className="text-slate-900 font-mono">{time} น.</strong></div>
              <div>📁 หมวดหมู่: <span className="font-bold text-indigo-700">{selectedCategory?.name || 'General'}</span> | ⭐ ความสำคัญ: <span className="font-bold text-orange-600">{priority === 'high' ? 'สูง' : priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}</span></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-97 text-white rounded-2xl font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
            >
              {taskToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
