import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  Search, 
  Menu,
  ExternalLink, 
  Sparkles, 
  Bot, 
  CheckCircle2,
  Palette,
  Calendar,
  Clock,
  Tag,
  User,
  Sun,
  ListTodo,
  MessageSquare,
  Sparkle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatThaiDate } from '../utils/thaiDate';
import { LINE_THEMES, LineThemeId } from '../utils/lineFlexBuilder';
import { parseThaiTask, ParsedThaiTask } from '../utils/thaiTaskParser';
import { playNotificationSound } from '../utils/lineService';
import { Priority } from '../types';

interface LinePhoneMockupProps {
  onOpenTaskDetails?: (taskId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  time: string;
  task?: {
    id?: string;
    title: string;
    date: string;
    time: string;
    priority: Priority;
    categoryId: string;
  };
  isSystemInfo?: boolean;
}

export const LinePhoneMockup: React.FC<LinePhoneMockupProps> = ({ onOpenTaskDetails }) => {
  const { 
    isLinePhoneOpen, 
    setIsLinePhoneOpen, 
    activeTaskForLinePreview, 
    setActiveTaskForLinePreview,
    linePreviewMode,
    setLinePreviewMode,
    tasks, 
    categories,
    users,
    settings, 
    updateSettings, 
    toggleTaskStatus, 
    triggerManualReminder,
    triggerMorningBriefing,
    setIsLineSetupModalOpen,
    addTask,
    setToastBanner
  } = useApp();

  const [completedCelebration, setCompletedCelebration] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial chat history with greeting & examples
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'สวัสดีครับ! คุณสามารถพิมพ์บอกงานเพื่อบันทึกลงปฏิทินได้โดยตรงเลยครับ ไม่จำเป็นต้องเปิดเข้าระบบเว็บ 📱✨\n\nลองพิมพ์คำว่า:\n• "นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน"\n• "เตือนจ่ายภาษี 25/10 14:30 สำคัญ"',
      time: '09:00',
    }
  ]);

  const quickPrompts = [
    'นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน',
    'เตือนจ่ายภาษี 25/10 14:30 สำคัญ',
    'นัดพบลูกค้า วันศุกร์ 15:00 ด่วน',
    'ตรวจงานไซต์ วันนี้ 16:30 ทั่วไป',
  ];

  // Auto scroll chat to bottom
  useEffect(() => {
    if (linePreviewMode === 'chat-record' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isBotTyping, linePreviewMode]);

  if (!isLinePhoneOpen) return null;

  const currentTask = activeTaskForLinePreview || tasks[0];
  const category = currentTask ? categories.find(c => c.id === currentTask.categoryId) : null;
  const assignee = currentTask?.assigneeId ? users.find(u => u.id === currentTask.assigneeId) : null;
  const isCompleted = currentTask?.status === 'completed';
  const isConfigured = Boolean(settings.lineChannelAccessToken && settings.lineUserId);

  const activeThemeId: LineThemeId = settings.lineNotificationTheme || 'apple-modern';
  const currentTheme = LINE_THEMES[activeThemeId] || LINE_THEMES['apple-modern'];

  let headerBg = currentTheme.headerBg;
  let buttonColor = currentTheme.buttonColor;
  let accentColor = currentTheme.accentColor;

  if (activeThemeId === 'category-color' && category?.color) {
    headerBg = category.color;
    buttonColor = category.color;
    accentColor = category.color;
  }

  const handleMarkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTask) return;
    toggleTaskStatus(currentTask.id, 'completed');
    setCompletedCelebration(true);
    setTimeout(() => setCompletedCelebration(false), 2500);
  };

  const handleTriggerTest = async () => {
    if (linePreviewMode === 'morning-briefing') {
      await triggerMorningBriefing();
    } else if (linePreviewMode === 'chat-record') {
      handleSendChatMessage();
    } else if (currentTask) {
      await triggerManualReminder(currentTask.id);
    }
  };

  // Send a message from user in LINE chat
  const handleSendChatMessage = (textOverride?: string) => {
    const raw = (textOverride !== undefined ? textOverride : chatInput).trim();
    if (!raw) return;

    const currentTimeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: raw,
      time: currentTimeStr,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLinePreviewMode('chat-record');
    setIsBotTyping(true);

    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // 2. Process command
    setTimeout(() => {
      setIsBotTyping(false);

      if (/^(วิธีใช้|ช่วย|help|คำสั่ง)$/i.test(raw)) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '📌 รูปแบบคำสั่งที่ระบบเข้าใจ:\n\n• วันที่: วันนี้, พรุ่งนี้, มะรืนนี้, วันศุกร์, 25/10/2026, 28 ต.ค.\n• เวลา: 10:00, 14:30 น., บ่ายสอง, เที่ยงครึ่ง\n• ความสำคัญ: ด่วน, ด่วนมาก, สำคัญ, ทั่วไป\n\nตัวอย่าง:\n"นัดพบลูกค้า พรุ่งนี้ 14:00 น. ด่วน"',
            time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        return;
      }

      // Parse task details
      const parsed: ParsedThaiTask = parseThaiTask(raw);

      // Create new task in system
      addTask({
        title: parsed.title,
        description: `สร้างผ่าน LINE OA แชท: "${raw}"`,
        date: parsed.date,
        time: parsed.time,
        priority: parsed.priority,
        categoryId: parsed.categoryId,
        status: 'pending',
        reminderMinutesBefore: settings.defaultReminderOffsetMinutes || 15,
      });

      // Bot Flex Message reply
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        task: {
          title: parsed.title,
          date: parsed.date,
          time: parsed.time,
          priority: parsed.priority,
          categoryId: parsed.categoryId,
        }
      };

      setChatMessages(prev => [...prev, botMsg]);

      setToastBanner({
        type: 'success',
        message: `📱 LINE Chat: บันทึกงาน "${parsed.title}" ลงปฏิทินสำเร็จเรียบร้อย!`,
      });
    }, 600);
  };

  // Today tasks for Morning Briefing
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const highPriorityCount = todayTasks.filter(t => t.priority === 'high').length;
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const firstTaskTime = todayTasks[0]?.time || '--:--';

  // Priority badge info for single task
  let priorityLabel = '🟢 ทั่วไป';
  let priorityBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (currentTask?.priority === 'high') {
    priorityLabel = '🔴 สำคัญมาก';
    priorityBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (currentTask?.priority === 'medium') {
    priorityLabel = '🟡 ปานกลาง';
    priorityBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div 
      className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto z-50 flex items-center justify-center sm:justify-end p-2 sm:p-4 bg-black/50 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none"
      onClick={() => setIsLinePhoneOpen(false)}
    >
      {/* Apple-style iPhone Frame (Silver / Titanium Starlight) */}
      <div 
        className="bg-white/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[36px] p-2.5 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-black/[0.1] w-full max-w-[390px] pointer-events-auto flex flex-col h-[94dvh] sm:h-[96vh] animate-in slide-in-from-bottom sm:slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar for Simulator */}
        <div className="flex items-center justify-between px-1.5 pb-2 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-[#34C759]' : 'bg-amber-400'}`}></span>
            <span className="font-bold text-slate-900 text-xs">
              {isConfigured ? 'LINE Official Account' : 'LINE Simulator (จำลอง)'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              title={settings.soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#34C759]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={() => setIsLinePhoneOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center active:scale-90"
              title="ปิดหน้าจอจำลอง"
              aria-label="ปิด"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: 3 Modes */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-1.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setLinePreviewMode('chat-record')}
            className={`py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
              linePreviewMode === 'chat-record'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>พิมพ์สั่งงาน</span>
          </button>

          <button
            onClick={() => setLinePreviewMode('single')}
            className={`py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
              linePreviewMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
            <span>เตือนรายชิ้น</span>
          </button>

          <button
            onClick={() => setLinePreviewMode('morning-briefing')}
            className={`py-1.5 px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
              linePreviewMode === 'morning-briefing'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>สรุปเช้า</span>
          </button>
        </div>

        {/* Quick Theme Swatches Bar */}
        <div className="flex items-center justify-between px-2 py-1 mb-2 bg-slate-50 border border-slate-200/70 rounded-xl text-[10px] shrink-0">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Palette className="w-3 h-3 text-slate-600" />
            <span className="hidden sm:inline">สลับธีม:</span>
          </span>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-[280px]">
            {(Object.keys(LINE_THEMES) as LineThemeId[]).map((thId) => {
              const th = LINE_THEMES[thId];
              const isSelected = activeThemeId === thId;
              const shortName = thId === 'executive-slate' 
                ? 'Slate' 
                : thId === 'apple-modern' 
                ? 'Apple' 
                : thId === 'vibrant-emerald' 
                ? 'Emerald' 
                : thId === 'sunset-coral' 
                ? 'Sunset' 
                : thId === 'champagne-gold' 
                ? 'Gold' 
                : 'Category';
              return (
                <button
                  key={thId}
                  type="button"
                  onClick={() => updateSettings({ lineNotificationTheme: thId })}
                  className={`px-1.5 py-0.5 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-2xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`${th.name}: ${th.description}`}
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: th.headerBg }} 
                  />
                  <span>{shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* iPhone Inner Display Screen */}
        <div className="bg-slate-200 rounded-[24px] sm:rounded-[28px] overflow-hidden flex flex-col flex-1 shadow-inner border border-slate-300 min-h-0">
          
          {/* Apple Dynamic Island Status Bar */}
          <div className="bg-white text-slate-900 px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] select-none border-b border-black/[0.03] shrink-0">
            <span className="font-semibold tracking-tight font-mono text-[10px]">
              {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto shadow-2xs"></div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
              <span className="font-medium">5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* LINE Chat Header */}
          <div className="bg-[#00B900] text-white px-3 py-2 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <ChevronLeft className="w-4 h-4 text-white" />
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0 shadow-xs bg-white"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold leading-tight truncate text-white">{settings.botName || 'น้องเลขา'}</div>
                <div className="text-[9px] text-emerald-100 font-medium">LINE Official Account • Direct Webhook</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Search className="w-3.5 h-3.5" />
              <Menu className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Chat Bubble Area (LINE Chat Wallpaper #7A92A6) */}
          <div className="flex-1 bg-[#7A92A6] p-3 overflow-y-auto space-y-3 flex flex-col min-h-0">
            <div className="text-center shrink-0">
              <span className="text-[10px] bg-black/25 text-white/95 px-2.5 py-0.5 rounded-full font-mono">
                {formatThaiDate(todayStr, { shortMonth: true })}
              </span>
            </div>

            {/* VIEW 1: Direct Chat Recording Thread */}
            {linePreviewMode === 'chat-record' && (
              <div className="space-y-3">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-150`}
                    >
                      {/* Sender label for bot */}
                      {!isUser && (
                        <div className="flex items-center gap-1 text-[10px] text-white/80 pl-1 font-medium">
                          <Bot className="w-3 h-3" />
                          <span>{settings.botName || 'น้องเลขา'}</span>
                        </div>
                      )}

                      {/* Text Bubble */}
                      {msg.text && (
                        <div className="flex items-end gap-1.5 max-w-[85%]">
                          {isUser && (
                            <div className="flex flex-col items-end text-[9px] text-white/70 font-mono shrink-0 mb-0.5 leading-tight">
                              <span className="text-[8px] text-emerald-300 font-semibold">อ่านแล้ว</span>
                              <span>{msg.time}</span>
                            </div>
                          )}
                          <div 
                            className={`p-2.5 px-3 rounded-2xl text-xs leading-relaxed shadow-sm break-words ${
                              isUser 
                                ? 'bg-[#06C755] text-white rounded-tr-xs font-medium' 
                                : 'bg-white text-slate-800 rounded-tl-xs border border-black/5 whitespace-pre-line shadow-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                          {!isUser && (
                            <span className="text-[9px] text-white/70 font-mono shrink-0 mb-0.5">{msg.time}</span>
                          )}
                        </div>
                      )}

                      {/* Bot Confirmation Flex Card - Luxury Style */}
                      {msg.task && (
                        <div className="w-full max-w-[285px] bg-white rounded-2xl overflow-hidden shadow-xl border border-black/10 text-slate-800 animate-in zoom-in-95 duration-150 mt-1">
                          <div className="p-3.5 bg-[#0F172A] text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-400/30">
                                ✓ บันทึกลงปฏิทินสำเร็จ
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {msg.time} น.
                              </span>
                            </div>
                            <h4 className="text-sm font-black mt-2 text-white leading-tight">
                              {msg.task.title}
                            </h4>
                          </div>

                          <div className="p-3.5 space-y-2.5 text-xs bg-white">
                            {/* 2-column highlighted date & time container */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                              <div className="space-y-0.5">
                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  <span>วันที่</span>
                                </div>
                                <div className="font-bold text-slate-900 text-xs truncate">
                                  {formatThaiDate(msg.task.date, { shortMonth: true })}
                                </div>
                              </div>

                              <div className="space-y-0.5 border-l border-slate-200 pl-2">
                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>เวลาเริ่ม</span>
                                </div>
                                <div className="font-black text-blue-600 font-mono text-sm">
                                  {msg.task.time} น.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                msg.task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : msg.task.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {msg.task.priority === 'high' ? '🔴 สูงมาก' : msg.task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ต่ำ'}
                              </span>

                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                💼 {categories.find(c => c.id === msg.task?.categoryId)?.name || 'งาน'}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setIsLinePhoneOpen(false);
                              }}
                              className="w-full mt-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-colors active:scale-97"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-white" />
                              <span>เปิดดูในปฏิทินระบบ</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Bot typing indicator */}
                {isBotTyping && (
                  <div className="flex items-center gap-1.5 bg-white/90 text-slate-600 px-3 py-1.5 rounded-full text-[10px] w-fit shadow-xs animate-pulse">
                    <Bot className="w-3 h-3 text-emerald-600" />
                    <span>น้องเลขากำลังประมวลผลข้อความและลงปฏิทิน...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            )}

            {/* VIEW 2: Morning Briefing Bubble - Sunrise Luxury Style */}
            {linePreviewMode === 'morning-briefing' && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-black/[0.08] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#9A3412] text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded-full shadow-2xs">
                      ☀️ MORNING BRIEFING
                    </span>
                    <span className="text-[10px] font-bold text-orange-100 font-mono">
                      ⏰ {settings.morningBriefingTime || '07:30'} น.
                    </span>
                  </div>
                  <h3 className="text-base font-black tracking-tight mt-2 leading-tight">
                    สรุปตารางงานประจำวัน
                  </h3>
                  <p className="text-[11px] text-orange-100 mt-0.5 font-medium">
                    {formatThaiDate(todayStr, { shortMonth: false })}
                  </p>
                </div>

                <div className="p-3.5 space-y-3 bg-white text-xs">
                  {/* 3 Metrics Cards */}
                  <div className="grid grid-cols-3 gap-1.5 bg-orange-50/80 border border-orange-200/80 rounded-2xl p-2.5 text-center shadow-2xs">
                    <div>
                      <div className="text-[9px] text-orange-900/80 font-bold">งานทั้งหมด</div>
                      <div className="text-lg font-black text-orange-950 font-mono tabular-nums">{todayTasks.length}</div>
                      <div className="text-[9px] text-orange-800/70">งาน</div>
                    </div>
                    <div className="border-x border-orange-200">
                      <div className="text-[9px] text-orange-900/80 font-bold">งานด่วนมาก</div>
                      <div className={`text-lg font-black font-mono tabular-nums ${highPriorityCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {highPriorityCount}
                      </div>
                      <div className="text-[9px] text-orange-800/70">งาน</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-orange-900/80 font-bold">เริ่มงานแรก</div>
                      <div className="text-xs font-black text-slate-900 mt-1 font-mono">{firstTaskTime}</div>
                      <div className="text-[9px] text-orange-800/70">น.</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 px-0.5 pt-0.5">
                    <span>📋 นัดหมายที่ต้องทำวันนี้:</span>
                    <span className="text-[10px] text-slate-500 font-mono">เสร็จแล้ว {completedCount}/{todayTasks.length}</span>
                  </div>

                  {/* Task timeline list */}
                  <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-0.5">
                    {todayTasks.length === 0 ? (
                      <div className="text-center py-5 bg-slate-50 rounded-xl text-slate-500 text-xs border border-slate-100">
                        🎉 วันนี้ไม่มีรายการงานค้าง พร้อมเริ่มวันใหม่อย่างสดใส!
                      </div>
                    ) : (
                      todayTasks.slice(0, 5).map((t, idx) => {
                        const isHigh = t.priority === 'high';
                        const isDone = t.status === 'completed';
                        return (
                          <div 
                            key={t.id}
                            className={`p-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                              isDone 
                                ? 'bg-slate-50 border-slate-200 opacity-60' 
                                : isHigh 
                                ? 'bg-rose-50/50 border-rose-200' 
                                : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                                isHigh ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {t.time}
                              </span>
                              <span className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {t.title}
                              </span>
                            </div>
                            <span className="text-xs shrink-0">
                              {isDone ? '✓' : isHigh ? '🔴' : '🟢'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* View in system button */}
                  <button
                    onClick={() => setIsLinePhoneOpen(false)}
                    className="w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-97"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดดูตารางงานระบบ</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: Single Task Reminder Card - Upgraded Luxury Theme */}
            {linePreviewMode === 'single' && (
              currentTask ? (
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-black/[0.08] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div 
                    className="p-3.5 text-white transition-colors duration-200"
                    style={{ backgroundColor: headerBg }}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: currentTheme.badgeBg,
                          color: currentTheme.badgeText
                        }}
                      >
                        🔔 LINE REMINDER
                      </span>
                      <span className="text-[10px] text-white/80 font-mono">
                        เตือนก่อน {currentTask.reminderMinutesBefore || 15} นาที
                      </span>
                    </div>
                    <h3 className="text-sm font-black tracking-tight mt-2 text-white leading-snug">
                      {currentTask.title}
                    </h3>
                  </div>

                  <div className="p-3.5 space-y-2.5 text-xs bg-white">
                    {/* 2-Column Highlighted Date & Time Container */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>วันที่</span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {formatThaiDate(currentTask.date, { shortMonth: true })}
                        </div>
                      </div>

                      <div className="space-y-0.5 border-l border-slate-200 pl-2">
                        <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>เวลานัดหมาย</span>
                        </div>
                        <div 
                          className="font-black font-mono text-sm"
                          style={{ color: currentTheme.timeHighlightColor || '#2563EB' }}
                        >
                          {currentTask.time} น.
                        </div>
                      </div>
                    </div>

                    {/* Description Quote Box if provided */}
                    {currentTask.description && (
                      <div className="bg-slate-50/80 p-2.5 rounded-xl border-l-[3px] border-l-slate-400 border border-slate-200/60 text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        "{currentTask.description}"
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span 
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${category?.color || '#0071E3'}15`,
                          borderColor: `${category?.color || '#0071E3'}30`,
                          color: category?.color || '#0071E3',
                        }}
                      >
                        📁 {category?.name || currentTask.categoryId}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityBg}`}>
                        ⭐ {priorityLabel}
                      </span>
                      {assignee && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          👤 {assignee.name}
                        </span>
                      )}
                    </div>

                    {completedCelebration && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 animate-bounce shadow-2xs">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>อัปเดตสถานะงานเรียบร้อยแล้ว!</span>
                      </div>
                    )}

                    <div className="pt-1 space-y-1.5">
                      <button
                        onClick={() => onOpenTaskDetails && onOpenTaskDetails(currentTask.id)}
                        className="w-full py-2 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-97 transition-all"
                        style={{ backgroundColor: buttonColor }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิดดูงานในระบบ</span>
                      </button>

                      <button
                        onClick={handleMarkDone}
                        className={`w-full py-1.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border cursor-pointer active:scale-97 transition-all ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isCompleted ? '✓ งานนี้เสร็จเรียบร้อยแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-2xl text-center text-xs text-slate-500 border border-slate-200">
                  ไม่มีงานที่จะแสดง
                </div>
              )
            )}
          </div>

          {/* Quick Prompts Bar (Click to insert or send) */}
          <div className="bg-slate-50 px-2 py-1.5 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] text-slate-600 font-semibold shrink-0 flex items-center gap-0.5">
              <Sparkle className="w-2.5 h-2.5 text-amber-500" /> ลองพิมพ์:
            </span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChatMessage(p)}
                className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-medium rounded-full whitespace-nowrap transition-colors border border-slate-200 shadow-2xs cursor-pointer shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* LINE Bottom Interactive Chat Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="bg-white p-2 flex items-center gap-2 shrink-0 border-t border-slate-200"
          >
            <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-xs text-slate-900 flex items-center border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-colors">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="พิมพ์นัดหมาย เช่น นัดประชุมพรุ่งนี้ 10:00 ด่วน..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!chatInput.trim()}
              title="ส่งข้อความสั่งงาน"
              className="w-8 h-8 rounded-full bg-[#00B900] hover:bg-[#009e00] disabled:opacity-40 disabled:hover:bg-[#00B900] text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        </div>

        {/* Simulator Bottom Controls */}
        <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>
            {linePreviewMode === 'chat-record' 
              ? '💬 สั่งงานด้วยแชทโดยตรง'
              : linePreviewMode === 'morning-briefing' 
              ? '☀️ สรุปงานทุกเช้า' 
              : '🔔 การ์ดเตือนงาน'}
          </span>
          <button
            onClick={handleTriggerTest}
            className="text-xs text-slate-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>
              {linePreviewMode === 'chat-record'
                ? 'กดส่งข้อความข้างบนเพื่อบันทึกงาน'
                : linePreviewMode === 'morning-briefing'
                ? 'กดทดสอบส่งสรุปตอนนี้'
                : 'กดส่งการ์ดแจ้งเตือนตอนนี้'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
