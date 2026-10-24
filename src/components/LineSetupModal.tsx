import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Smartphone, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw,
  History,
  Bot,
  Sparkles,
  Palette,
  Eye,
  Sun
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { testLineConnection } from '../utils/lineService';
import { LINE_THEMES, LineThemeId } from '../utils/lineFlexBuilder';

export const LineSetupModal: React.FC = () => {
  const { 
    isLineSetupModalOpen, 
    setIsLineSetupModalOpen, 
    settings, 
    updateSettings, 
    logs, 
    tasks, 
    triggerManualReminder,
    triggerMorningBriefing,
    setToastBanner,
    setIsLinePhoneOpen,
    setLinePreviewMode
  } = useApp();

  const [tokenInput, setTokenInput] = useState(settings.lineChannelAccessToken);
  const [userIdInput, setUserIdInput] = useState(settings.lineUserId);
  const [activeTab, setActiveTab] = useState<'themes' | 'test' | 'config' | 'logs' | 'guide'>('themes');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; botName?: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isLineSetupModalOpen) return null;

  const currentThemeId: LineThemeId = settings.lineNotificationTheme || 'apple-modern';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      lineChannelAccessToken: tokenInput.trim(),
      lineUserId: userIdInput.trim(),
    });
    setSaveSuccess(true);
    setToastBanner({
      type: 'success',
      message: 'บันทึกการตั้งค่า LINE สำเร็จเรียบร้อย!',
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSelectTheme = (themeId: LineThemeId) => {
    updateSettings({ lineNotificationTheme: themeId });
    setToastBanner({
      type: 'success',
      message: `เปลี่ยนรูปแบบสีสันการ์ด LINE เป็น "${LINE_THEMES[themeId].name.split(' ')[0]}" สำเร็จ!`,
    });
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const activeToken = tokenInput.trim() || settings.lineChannelAccessToken;
    const activeUserId = userIdInput.trim() || settings.lineUserId;

    if (!activeToken) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: 'กรุณากรอก LINE Channel Access Token ก่อนกดทดสอบ',
      });
      return;
    }

    try {
      const res = await testLineConnection(activeToken, activeUserId);
      setTestResult(res);
      if (res.success) {
        setToastBanner({
          type: 'success',
          message: res.message || 'เชื่อมต่อกับ LINE สำเร็จเรียบร้อย!',
        });
      } else {
        setToastBanner({
          type: 'error',
          message: res.message || 'การเชื่อมต่อกับ LINE ล้มเหลว',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `ข้อผิดพลาด: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendSampleTask = async () => {
    if (tasks.length > 0) {
      await triggerManualReminder(tasks[0].id);
    }
  };

  const handleSendMorningBriefing = async () => {
    await triggerMorningBriefing();
  };

  const isConfigured = Boolean(settings.lineChannelAccessToken && settings.lineUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92dvh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-50/90 via-white to-emerald-50/80 text-slate-900 border-b border-blue-100 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#00B900] text-white flex items-center justify-center font-bold shadow-md shadow-[#00B900]/30 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">ระบบแจ้งเตือน LINE</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isConfigured 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {isConfigured ? '● เชื่อมต่อแล้ว' : '○ โหมดจำลอง'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                ปรับแต่งดีไซน์การ์ด Flex Message และทดสอบส่งแจ้งเตือนเข้ามือถือจริง
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLineSetupModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 shrink-0"
            title="ปิด"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-3 sm:px-4 text-xs font-bold text-slate-600 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'themes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>🎨 รูปแบบ & สีสันการ์ด</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'test'
                ? 'border-[#00B900] text-[#00B900]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>ทดสอบส่งข้อความ</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'config'
                ? 'border-[#00B900] text-[#00B900]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>ตั้งค่า Token & User ID</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'logs'
                ? 'border-[#00B900] text-[#00B900]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติการส่ง ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'guide'
                ? 'border-[#00B900] text-[#00B900]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>วิธีเชื่อมต่อฟรี</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* THEMES TAB */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    เลือกสไตล์และโทนสีการ์ด LINE Flex Message
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ข้อความแจ้งเตือนที่ส่งเข้าแอป LINE บนมือถือจะใช้ดีไซน์ที่คุณเลือกทันที
                  </p>
                </div>
                <button
                  onClick={() => setIsLinePhoneOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>เปิดดูในมือถือจำลอง</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {(Object.keys(LINE_THEMES) as LineThemeId[]).map((tId) => {
                  const th = LINE_THEMES[tId];
                  const isSelected = currentThemeId === tId;

                  return (
                    <div
                      key={tId}
                      onClick={() => handleSelectTheme(tId)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                      }`}
                    >
                      {/* Mini Card Header Mockup */}
                      <div className="space-y-2">
                        <div 
                          className="p-3 rounded-xl text-white shadow-2xs"
                          style={{ backgroundColor: th.headerBg }}
                        >
                          <div className="flex items-center justify-between text-[9px] font-bold opacity-90">
                            <span>● TO-DO REMINDER</span>
                            <span>เตือนก่อน 15 นาที</span>
                          </div>
                          <div className="font-bold text-xs mt-1 truncate">
                            ออกใบเสนอราคาให้ลูกค้า บจก.ไทยสมาร์ท
                          </div>
                          <div className="text-[10px] opacity-80 mt-0.5">
                            ⏰ ถึงกำหนดเวลาส่งมอบงานแล้วครับ
                          </div>
                        </div>

                        {/* Theme Info */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">
                              {th.name}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                <span>กำลังใช้งาน</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {th.description}
                          </p>
                        </div>
                      </div>

                      {/* Select Button */}
                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-3 h-3 rounded-full border border-black/10" 
                            style={{ backgroundColor: th.headerBg }}
                          />
                          <span 
                            className="w-3 h-3 rounded-full border border-black/10" 
                            style={{ backgroundColor: th.buttonColor }}
                          />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {th.headerBg}
                          </span>
                        </div>
                        <span className={`text-[11px] font-bold ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}>
                          {isSelected ? '✓ เลือกใช้อยู่' : 'กดเพื่อเลือก'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  ต้องการดูว่าข้อความแสดงผลใน LINE บนมือถืออย่างไร?
                </span>
                <button
                  onClick={handleSendSampleTask}
                  className="px-3.5 py-1.5 bg-[#00B900] hover:bg-[#009900] active:scale-97 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ทดสอบส่งการ์ดตัวอย่างทันที</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                isConfigured 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {isConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00B900] shrink-0 mt-0.5" />
                ) : (
                  <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isConfigured 
                      ? 'ระบบพร้อมส่งข้อความเข้าแอป LINE จริงของคุณ' 
                      : 'ยังไม่ได้ระบุ Token กำลังทำงานในโหมดจำลอง (Simulator)'}
                  </h4>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">
                    {isConfigured
                      ? `คุณระบุ Channel Access Token และ User ID เรียบร้อยแล้ว เมื่อมีงานถึงกำหนด ระบบจะส่งข้อความแจ้งเตือนอัตโนมัติเข้าสู่ LINE ของคุณทันที`
                      : `ในโหมดจำลอง เมื่อคุณกด "ส่ง LINE" ระบบจะแสดงผลข้อความจริงในหน้าจอมือถือจำลอง (Phone Mockup) พร้อมเสียงแจ้งเตือน หากต้องการให้ส่งเข้าแอป LINE บนมือถือจริง ให้กดแท็บ "ตั้งค่า Token"`}
                  </p>
                </div>
              </div>

              {/* Instant Test Buttons */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00B900]" />
                  <span>กดทดสอบส่งแจ้งเตือนตอนนี้</span>
                </h4>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleRunTest}
                    disabled={isTesting}
                    className="flex-1 py-2.5 px-4 bg-[#00B900] hover:bg-[#009900] active:scale-97 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-[#00B900]/25 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'กำลังส่งทดสอบ...' : '1. ทดสอบยิงข้อความ'}</span>
                  </button>

                  <button
                    onClick={handleSendSampleTask}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-97 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/25 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>2. ส่งตัวอย่างการ์ดงาน</span>
                  </button>

                  <button
                    onClick={handleSendMorningBriefing}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-97 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm shadow-orange-500/25 cursor-pointer"
                  >
                    <Sun className="w-4 h-4" />
                    <span>3. ส่งสรุปยามเช้า ({settings.morningBriefingTime || '07:30'})</span>
                  </button>
                </div>

                {testResult && (
                  <div className={`p-3.5 rounded-xl border mt-2 flex items-start gap-2.5 animate-in fade-in duration-200 ${
                    testResult.success 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold">
                        {testResult.success ? 'สำเร็จ!' : 'ไม่สำเร็จ'}
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {testResult.message}
                      </div>
                      {testResult.botName && (
                        <div className="text-[10px] text-emerald-600 font-bold mt-1">
                          บอทที่เชื่อมต่อ: {testResult.botName}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick instructions on where to find LINE button */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  💡 ปุ่มส่ง LINE อยู่ตรงไหนบ้าง?
                </span>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  • <strong>หน้า Dashboard</strong>: ในแถบ "งานที่ต้องทำวันนี้" มีปุ่มสีเขียว <strong>[ส่ง LINE]</strong> ข้างทุกรายการงาน<br/>
                  • <strong>หน้าปฏิทิน (Calendar)</strong>: กดที่วันใดก็ได้ จะมีปุ่ม <strong>[แจ้งเตือน LINE]</strong> ในรายการงานของวันนั้น<br/>
                  • <strong>หน้ารายการงาน (Tasks)</strong>: ในตารางจะมีคอลัมน์ <strong>LINE Reminder</strong> สำหรับกดส่งได้ตลอดเวลา
                </p>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  LINE Channel Access Token (Long-lived):
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="เช่น eyJhbGciOiJIUzI1NiJ9..."
                  className="w-full bg-[#F5F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#00B900] focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  คัดลอกได้จาก LINE Developers Console &gt; Messaging API &gt; Channel access token
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  LINE User ID (ของคุณหรือผู้รับ):
                </label>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="เช่น U1234567890abcdef1234567890abcdef"
                  className="w-full bg-[#F5F5F7] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#00B900] focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  ต้องเป็น User ID ของ LINE Developers (ขึ้นต้นด้วยตัว U ตามด้วยตัวอักษรและตัวเลข 32 ตัว) ไม่ใช่ Line ID ทั่วไป
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00B900] hover:bg-[#009900] active:scale-97 text-white font-bold rounded-xl transition-all shadow-sm shadow-[#00B900]/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกการตั้งค่า</span>
                </button>

                {saveSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    บันทึกสำเร็จ!
                  </span>
                )}
              </div>
            </form>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>ประวัติข้อความที่ส่ง ({logs.length} รายการล่าสุด)</span>
                <span className="text-[10px]">บันทึกอัตโนมัติ</span>
              </div>

              {logs.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  ยังไม่มีประวัติการส่งข้อความ
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">
                          {log.taskTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          log.status === 'sent' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {log.status === 'sent' ? '✓ ส่งจริงสำเร็จ' : '📱 จำลอง (Simulator)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {log.message}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono pt-1">
                        <span>ผู้รับ: {log.recipient}</span>
                        <span>เวลา: {log.sentAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 leading-relaxed text-slate-600">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                📱 ขั้นตอนการเปิดใช้งาน LINE Messaging API (ฟรี 100%):
              </div>
              <ol className="list-decimal list-inside space-y-2 pl-1">
                <li>
                  เปิดเว็บไซต์ <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-[#0071E3] underline font-bold">LINE Developers Console</a> แล้วล็อกอินด้วยบัญชี LINE ของคุณ
                </li>
                <li>
                  กด <strong>Create a new provider</strong> ตั้งชื่ออะไรก็ได้ (เช่น My Tasks)
                </li>
                <li>
                  กดสร้าง <strong>Create a Messaging API channel</strong> กรอกชื่อ Bot และรูปภาพตามใจชอบ
                </li>
                <li>
                  เข้าไปที่แท็บ <strong>Messaging API</strong> เลื่อนลงล่างสุด แล้วกด <strong>Issue</strong> ที่หัวข้อ <strong>Channel access token</strong>
                </li>
                <li>
                  คัดลอก Token มาวางในแท็บ <strong>"ตั้งค่า Token & User ID"</strong> ในหน้านี้
                </li>
                <li>
                  เพิ่มเพื่อนกับบอทของคุณ โดยสแกน QR Code ที่อยู่ในแท็บ Messaging API
                </li>
                <li>
                  คัดลอก <strong>Your user ID</strong> (ที่อยู่ด้านล่างสุดของแท็บ Basic settings) มาวางในช่อง User ID
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ธีมปัจจุบัน: <strong className="text-slate-800">{LINE_THEMES[currentThemeId]?.name.split(' ')[0]}</strong>
          </span>
          <button
            onClick={() => setIsLineSetupModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
