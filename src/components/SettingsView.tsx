import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Copy, 
  Check, 
  Download, 
  Database, 
  Smartphone, 
  Bell, 
  RefreshCw,
  FileCode,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Palette,
  Sun,
  Clock,
  Sparkles,
  FolderKanban,
  Users,
  Settings as SettingsIcon,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Bot,
  Share2,
  UserCheck,
  Key,
  Upload,
  ArrowRight
} from 'lucide-react';
import { useApp, SettingsTab } from '../context/AppContext';
import { GOOGLE_APPS_SCRIPT_CODE, downloadFile } from '../utils/googleSheetsAppsScript';
import { testLineConnection } from '../utils/lineService';
import { LINE_THEMES, LineThemeId } from '../utils/lineFlexBuilder';
import { CategoriesView } from './CategoriesView';
import { UsersView } from './UsersView';

interface SettingsViewProps {
  initialTab?: SettingsTab;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab }) => {
  const { 
    settings, 
    updateSettings, 
    tasks,
    categories,
    users,
    syncWithGoogleSheet, 
    syncingWithSheet, 
    syncStatus, 
    logs, 
    resetAllData,
    settingsTab,
    setSettingsTab,
    setIsLinePhoneOpen,
    setLinePreviewMode,
    triggerMorningBriefing,
    setToastBanner
  } = useApp();

  // If initialTab is passed, update settingsTab
  useEffect(() => {
    if (initialTab) {
      setSettingsTab(initialTab);
    }
  }, [initialTab, setSettingsTab]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingLine, setIsTestingLine] = useState(false);
  const [isTestingBriefing, setIsTestingBriefing] = useState(false);
  const [testLineResult, setTestLineResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Local form state
  const [organizationName, setOrganizationName] = useState(settings.organizationName || 'ระบบน้องเลขา');
  const [botName, setBotName] = useState(settings.botName || 'น้องเลขา');
  const [lineBotBasicId, setLineBotBasicId] = useState(settings.lineBotBasicId || '@nonglekha');
  const [lineToken, setLineToken] = useState(settings.lineChannelAccessToken);
  const [lineUserId, setLineUserId] = useState(settings.lineUserId);
  const [googleSheetUrl, setGoogleSheetUrl] = useState(settings.googleSheetWebhookUrl);
  const [autoSyncSheet, setAutoSyncSheet] = useState(settings.autoSyncGoogleSheet !== false);
  const [defaultOffset, setDefaultOffset] = useState(settings.defaultReminderOffsetMinutes);
  const [autoReminder, setAutoReminder] = useState(settings.autoReminderEnabled);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [lineTheme, setLineTheme] = useState<LineThemeId>(settings.lineNotificationTheme || 'apple-modern');
  const [morningBriefingEnabled, setMorningBriefingEnabled] = useState(settings.morningBriefingEnabled ?? true);
  const [morningBriefingTime, setMorningBriefingTime] = useState(settings.morningBriefingTime || '07:30');

  // Export / Import Config Profile state
  const [importConfigText, setImportConfigText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedAddFriendUrl, setCopiedAddFriendUrl] = useState(false);

  // Sync state if context settings update
  useEffect(() => {
    setOrganizationName(settings.organizationName || 'ระบบน้องเลขา');
    setBotName(settings.botName || 'น้องเลขา');
    setLineBotBasicId(settings.lineBotBasicId || '@nonglekha');
    setLineToken(settings.lineChannelAccessToken);
    setLineUserId(settings.lineUserId);
    setGoogleSheetUrl(settings.googleSheetWebhookUrl);
    setAutoSyncSheet(settings.autoSyncGoogleSheet !== false);
    setDefaultOffset(settings.defaultReminderOffsetMinutes);
    setAutoReminder(settings.autoReminderEnabled);
    setSoundEnabled(settings.soundEnabled);
    setLineTheme(settings.lineNotificationTheme || 'apple-modern');
    setMorningBriefingEnabled(settings.morningBriefingEnabled ?? true);
    setMorningBriefingTime(settings.morningBriefingTime || '07:30');
  }, [settings]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      organizationName: organizationName.trim(),
      botName: botName.trim(),
      lineBotBasicId: lineBotBasicId.trim(),
      lineChannelAccessToken: lineToken.trim(),
      lineUserId: lineUserId.trim(),
      lineNotificationTheme: lineTheme,
      googleSheetWebhookUrl: googleSheetUrl.trim(),
      autoSyncGoogleSheet: autoSyncSheet,
      defaultReminderOffsetMinutes: Number(defaultOffset),
      autoReminderEnabled: autoReminder,
      soundEnabled: soundEnabled,
      morningBriefingEnabled: morningBriefingEnabled,
      morningBriefingTime: morningBriefingTime,
    });
    setSaveSuccess(true);
    setToastBanner({
      type: 'success',
      message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!',
    });
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportConfig = () => {
    const configToExport = {
      organizationName: organizationName.trim(),
      botName: botName.trim(),
      lineBotBasicId: lineBotBasicId.trim(),
      lineChannelAccessToken: lineToken.trim(),
      lineUserId: lineUserId.trim(),
      googleSheetWebhookUrl: googleSheetUrl.trim(),
      lineNotificationTheme: lineTheme,
      morningBriefingTime: morningBriefingTime,
      morningBriefingEnabled: morningBriefingEnabled,
      defaultReminderOffsetMinutes: defaultOffset,
    };
    navigator.clipboard.writeText(JSON.stringify(configToExport, null, 2));
    setCopiedExport(true);
    setToastBanner({
      type: 'success',
      message: 'คัดลอกชุดการตั้งค่า (Config JSON) สำหรับส่งต่อให้ผู้อื่นเรียบร้อยแล้ว!',
    });
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleImportConfig = () => {
    try {
      const parsed = JSON.parse(importConfigText.trim());
      if (parsed.organizationName) setOrganizationName(parsed.organizationName);
      if (parsed.botName) setBotName(parsed.botName);
      if (parsed.lineBotBasicId) setLineBotBasicId(parsed.lineBotBasicId);
      if (parsed.lineChannelAccessToken) setLineToken(parsed.lineChannelAccessToken);
      if (parsed.lineUserId) setLineUserId(parsed.lineUserId);
      if (parsed.googleSheetWebhookUrl) setGoogleSheetUrl(parsed.googleSheetWebhookUrl);
      if (parsed.lineNotificationTheme) setLineTheme(parsed.lineNotificationTheme);
      if (parsed.morningBriefingTime) setMorningBriefingTime(parsed.morningBriefingTime);
      if (parsed.morningBriefingEnabled !== undefined) setMorningBriefingEnabled(parsed.morningBriefingEnabled);
      if (parsed.defaultReminderOffsetMinutes !== undefined) setDefaultOffset(parsed.defaultReminderOffsetMinutes);

      updateSettings({
        ...parsed,
      });

      setToastBanner({
        type: 'success',
        message: 'นำเข้าการตั้งค่าสำเร็จเรียบร้อย! ข้อมูลได้รับการบันทึกแล้ว',
      });
      setShowImportBox(false);
      setImportConfigText('');
    } catch (e: any) {
      setToastBanner({
        type: 'error',
        message: 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบ JSON ที่นำมาวาง',
      });
    }
  };

  const handleCopyAppUrl = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedAppUrl(true);
    setToastBanner({
      type: 'success',
      message: 'คัดลอกลิงก์เว็บไซต์สำหรับส่งต่อให้ผู้ใช้งานเรียบร้อยแล้ว!',
    });
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    downloadFile('Code.gs', GOOGLE_APPS_SCRIPT_CODE, 'text/javascript');
  };

  const handleTestLine = async () => {
    setIsTestingLine(true);
    setTestLineResult(null);

    const token = lineToken.trim();
    const userId = lineUserId.trim();

    if (!token) {
      setIsTestingLine(false);
      setTestLineResult({
        success: false,
        message: 'กรุณากรอก LINE Channel Access Token ก่อนทดสอบ',
      });
      return;
    }

    try {
      const res = await testLineConnection(token, userId);
      setTestLineResult(res);
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
      setTestLineResult({
        success: false,
        message: `ข้อผิดพลาด: ${err.message}`,
      });
    } finally {
      setIsTestingLine(false);
    }
  };

  const handleTestMorningBriefing = async () => {
    setIsTestingBriefing(true);
    try {
      await triggerMorningBriefing();
    } finally {
      setIsTestingBriefing(false);
    }
  };

  const isLineConfigured = Boolean(settings.lineChannelAccessToken && settings.lineUserId);
  const isSheetConfigured = Boolean(settings.googleSheetWebhookUrl && !settings.googleSheetWebhookUrl.includes('docs.google.com/spreadsheets'));

  const MORNING_TIME_PRESETS = ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00'];

  const TABS: { id: SettingsTab; label: string; icon: React.ReactNode; statusLabel?: string; statusColor?: string }[] = [
    { 
      id: 'line', 
      label: 'LINE OA & สรุปยามเช้า', 
      icon: <Smartphone className="w-4 h-4 text-emerald-600" />,
      statusLabel: isLineConfigured ? 'พร้อมส่ง' : 'ยังไม่ตั้งค่า',
      statusColor: isLineConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { 
      id: 'sheets', 
      label: 'Google Sheets ฐานข้อมูล', 
      icon: <Database className="w-4 h-4 text-emerald-600" />,
      statusLabel: isSheetConfigured ? 'พร้อมซิงค์' : 'ยังไม่เชื่อมต่อ',
      statusColor: isSheetConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { 
      id: 'categories', 
      label: 'หมวดหมู่งาน', 
      icon: <FolderKanban className="w-4 h-4 text-slate-700" />,
      statusLabel: `${categories.length} หมวด`,
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    { 
      id: 'users', 
      label: 'สมาชิกในทีม', 
      icon: <Users className="w-4 h-4 text-slate-700" />,
      statusLabel: `${users.length} คน`,
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    { 
      id: 'preferences', 
      label: 'เวลาเตือน & บันทึกระบบ', 
      icon: <Bell className="w-4 h-4 text-slate-700" />,
      statusLabel: `ก่อน ${settings.defaultReminderOffsetMinutes || 15} นาที`,
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    { 
      id: 'handover', 
      label: '🤝 ส่งต่อให้ผู้อื่นใช้งาน (เจ้าของใหม่)', 
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      statusLabel: 'วิธีตั้งค่า',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title & Save Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              ตั้งค่าระบบ (System Settings)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10 sm:pl-10">
            ศูนย์รวมการตั้งค่าทั้งหมด: LINE OA, Google Sheets, หมวดหมู่, สมาชิกทีม และการแจ้งเตือน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>บันทึกแล้ว!</span>
            </div>
          )}

          {(settingsTab === 'line' || settingsTab === 'sheets' || settingsTab === 'preferences' || settingsTab === 'handover') && (
            <button
              onClick={() => handleSave()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-97 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer min-h-[38px]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-1.5 sm:p-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = settingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[42px] shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.statusLabel && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    isActive 
                      ? 'bg-white/20 text-white border-white/30' 
                      : tab.statusColor
                  }`}>
                    {tab.statusLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: LINE OA & Morning Briefing */}
      {settingsTab === 'line' && (
        <div className="space-y-6">
          {/* Section: LINE OA Messaging API */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    การเชื่อมต่อ LINE Official Account (Messaging API)
                  </h2>
                  <p className="text-xs text-slate-500">
                    สำหรับส่งข้อความแจ้งเตือนอัตโนมัติเข้าสู่ LINE ของคุณหรือกลุ่มทำงาน
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLinePhoneOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">เปิด LINE Simulator</span>
              </button>
            </div>

            {/* Board Owner & Assistant Names */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                  <span>ชื่อบอร์ด / เจ้าของระบบ (Board Title):</span>
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="เช่น บอร์ดงานคุณสมชาย, บริษัท สยามเทค จำกัด..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-500 shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  จะแสดงที่หัวมุมซ้ายบนของแถบเมนู เพื่อระบุตัวตนเจ้าของบอร์ด
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-slate-700" />
                  <span>ชื่อบอทเลขาในระบบ (Assistant Name):</span>
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="เช่น เลขาคุณสมชาย, น้องเลขา..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-500 shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ชื่อที่ใช้ในการทักทายและแจ้งเตือนใน LINE
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  LINE Channel Access Token (Long-lived):
                </label>
                <input
                  type="password"
                  value={lineToken}
                  onChange={(e) => setLineToken(e.target.value)}
                  placeholder="วาง Token จาก LINE Developers Console..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-500 focus:bg-white shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  รับ Token ได้จาก <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-slate-800 font-semibold underline inline-flex items-center gap-0.5">LINE Developers <ExternalLink className="w-3 h-3 inline" /></a>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>LINE Bot Basic ID (@...):</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">ไม่ต้องขอ ID</span>
                </label>
                <input
                  type="text"
                  value={lineBotBasicId}
                  onChange={(e) => setLineBotBasicId(e.target.value)}
                  placeholder="เช่น @nonglekha, @984abcde"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-500 focus:bg-white shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  LINE ID ของบอทเพื่อสร้างลิงก์และ QR Code เพิ่มเพื่อน
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  LINE User / Group ID เริ่มต้น:
                </label>
                <input
                  type="text"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  placeholder="เช่น U1234567890abcdef..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 font-mono text-xs focus:outline-none focus:border-slate-500 focus:bg-white shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  ผู้รับค่าเริ่มต้น หรือปล่อยว่างเพื่อใช้สมาชิกทีม
                </p>
              </div>
            </div>

            {/* Friend Auto-Capture Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    นวัตกรรมใหม่
                  </span>
                  <span>ให้สมาชิกแอดบอทเป็นเพื่อนแทน ไม่ต้องขอ LINE User ID!</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed max-w-2xl">
                  เมื่อสมาชิกกดแอดบอทหรือดึงเข้ากลุ่ม ระบบ Webhook จะบันทึกชื่อ รูปโปรไฟล์ และ User ID เข้าสู่หน้าระบบอัตโนมัติ คุณเพียงเลือกชื่อเขาจากรายการได้ทันที
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const cleanId = lineBotBasicId.startsWith('@') ? lineBotBasicId : '@' + lineBotBasicId;
                    const url = `https://line.me/R/ti/p/${encodeURIComponent(cleanId)}`;
                    navigator.clipboard.writeText(url);
                    setCopiedAddFriendUrl(true);
                    setToastBanner({
                      type: 'success',
                      message: `คัดลอกลิงก์แอดบอท (${url}) แล้ว! ส่งให้ทีมงานกดได้ทันที`,
                    });
                    setTimeout(() => setCopiedAddFriendUrl(false), 2500);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {copiedAddFriendUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAddFriendUrl ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์แอดบอท'}</span>
                </button>
              </div>
            </div>

            {/* LINE Card Theme Selector */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-700" />
                  <span>รูปแบบและโทนสีการ์ดแจ้งเตือน (LINE Card Theme):</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  แสดงผลทั้งในแอป LINE จริงและ Simulator
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(Object.keys(LINE_THEMES) as LineThemeId[]).map((tId) => {
                  const th = LINE_THEMES[tId];
                  const isSelected = lineTheme === tId;

                  return (
                    <div
                      key={tId}
                      onClick={() => setLineTheme(tId)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div 
                        className="h-8 rounded-xl flex items-center px-2.5 text-white text-[10px] font-bold shadow-2xs mb-2"
                        style={{ backgroundColor: th.headerBg }}
                      >
                        <span className="truncate">● {th.name.split(' ')[0]}</span>
                      </div>

                      <div className="font-bold text-slate-900 text-xs">
                        {th.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                        {th.description}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: th.headerBg }} 
                          />
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: th.buttonColor }} 
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                          {isSelected ? '✓ เลือกใช้อยู่' : 'เลือก'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LINE Testing Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestLine}
                  disabled={isTestingLine}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingLine ? 'animate-spin' : ''}`} />
                  <span>{isTestingLine ? 'กำลังทดสอบ...' : 'ทดสอบส่งข้อความเข้า LINE ทันที'}</span>
                </button>
              </div>

              {testLineResult && (
                <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  testLineResult.success 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testLineResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testLineResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Direct Chat to Calendar (LINE Webhook) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>พิมพ์สั่งงานลงปฏิทินผ่าน LINE ได้โดยตรง (ไม่ต้องเปิดระบบ)</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                      รองรับภาษาไทย 100%
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    เพียงพิมพ์ข้อความหา LINE OA บอทจะถอดรหัส วัน เวลา และระดับความสำคัญ แล้วลงปฏิทินให้ทันที
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLinePreviewMode('chat-record');
                  setIsLinePhoneOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>ทดลองพิมพ์ใน Simulator</span>
              </button>
            </div>

            {/* How It Works & Setup Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono font-bold shadow-2xs">1</span>
                  <span>คัดลอก Web App URL</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ไปที่แท็บ <button onClick={() => setSettingsTab('sheets')} className="font-bold text-blue-600 underline">ฐานข้อมูล Google Sheets</button> แล้วคัดลอก <b>Web App URL</b> (ที่ลงท้ายด้วย <code className="bg-slate-200/80 px-1 py-0.5 rounded text-[10px]">/exec</code>)
                </p>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono font-bold shadow-2xs">2</span>
                  <span>ตั้งค่า LINE Webhook</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ใน <b>LINE Developers Console</b> &gt; เมนู <b>Messaging API</b> &gt; หัวข้อ <b>Webhook settings</b> วาง URL ในช่อง Webhook URL แล้วเปิดสวิตช์ <b>Use Webhook</b> เป็น ON
                </p>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono font-bold shadow-2xs">3</span>
                  <span>พิมพ์สั่งงานใน LINE ได้เลย</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  เปิดแอป LINE ในมือถือ พิมพ์ข้อความหา LINE OA ระบบจะบันทึกลง Google Sheet และปฏิทินทันที พร้อมส่งการ์ดยืนยันกลับ
                </p>
              </div>
            </div>

            {/* Syntax Examples */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ตัวอย่างรูปแบบข้อความที่สามารถพิมพ์สั่งงานได้:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded w-fit">
                    🔴 งานด่วนมาก (High)
                  </div>
                  <div className="font-mono text-slate-800 text-[11px] font-semibold">
                    "นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน"
                  </div>
                  <div className="text-[10px] text-slate-500">
                    → บันทึกวันพรุ่งนี้ 10:00 น. ระดับความสำคัญสูง
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                    🟡 งานสำคัญ (Medium)
                  </div>
                  <div className="font-mono text-slate-800 text-[11px] font-semibold">
                    "เตือนจ่ายภาษี 25/10 14:30 สำคัญ"
                  </div>
                  <div className="text-[10px] text-slate-500">
                    → บันทึก 25/10/2026 14:30 น. หมวดการเงิน
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                    🟢 งานทั่วไป (Low)
                  </div>
                  <div className="font-mono text-slate-800 text-[11px] font-semibold">
                    "นัดพบลูกค้า วันศุกร์ 15:00"
                  </div>
                  <div className="text-[10px] text-slate-500">
                    → บันทึกวันศุกร์ที่จะถึง เวลา 15:00 น.
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">
                    📋 สรุปตารางงาน
                  </div>
                  <div className="font-mono text-slate-800 text-[11px] font-semibold">
                    "ดูงานวันนี้"
                  </div>
                  <div className="text-[10px] text-slate-500">
                    → บอทจะดึงรายการงานของวันนี้ส่งสรุปให้
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Daily Morning Briefing */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>แจ้งเตือนสรุปงานตอนเช้าก่อนเริ่มงาน (Daily Morning Briefing)</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                      แนะนำเปิดใช้งาน
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    รวบรวมงานทั้งหมดของวันนั้น (รวมถึงงานที่สร้างล่วงหน้า) ส่งสรุปเข้าแอป LINE ตามเวลาที่คุณกำหนด
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-semibold text-slate-700">
                  {morningBriefingEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <input
                  type="checkbox"
                  checked={morningBriefingEnabled}
                  onChange={(e) => setMorningBriefingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </label>
            </div>

            <div className={`space-y-4 transition-opacity ${morningBriefingEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>เวลาแจ้งเตือนสรุปตารางงานตอนเช้า (Morning Time):</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      เลือกเวลาตอนเช้าก่อนเริ่มงาน เพื่อให้บอท LINE ส่งสรุปตารางงานทั้งหมดของวัน
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">กำหนดเวลาเอง:</span>
                    <input
                      type="time"
                      value={morningBriefingTime}
                      onChange={(e) => setMorningBriefingTime(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                    />
                    <span className="text-xs font-bold text-slate-600">น.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-600 font-medium">เวลานิยม:</span>
                  {MORNING_TIME_PRESETS.map((t) => {
                    const isSelected = morningBriefingTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMorningBriefingTime(t)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t} น.
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestMorningBriefing}
                    disabled={isTestingBriefing}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-97 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Sun className={`w-3.5 h-3.5 text-white ${isTestingBriefing ? 'animate-spin' : ''}`} />
                    <span>{isTestingBriefing ? 'กำลังส่งสรุป...' : '☀️ ทดลองส่งสรุปงานวันนี้เข้า LINE ทันที'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLinePreviewMode('morning-briefing');
                      setIsLinePhoneOpen(true);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ดูตัวอย่างการ์ดสรุปยามเช้าใน LINE Simulator</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  ส่งอัตโนมัติ 1 ครั้งต่อวันเวลา {morningBriefingTime} น.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Google Sheets Database */}
      {settingsTab === 'sheets' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  ฐานข้อมูล Google Sheets (ข้อมูลเป็นของคุณ 100%)
                </h2>
                <p className="text-xs text-slate-500">
                  เชื่อมโยงผ่าน Google Apps Script Web App URL บันทึกงาน ปรับสถานะ และดึงข้อมูลอัตโนมัติ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด Apps Script'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCode}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด Code.gs</span>
              </button>
            </div>
          </div>

          <div className="text-xs space-y-4">
            {/* Troubleshooter & Diagnosis Banner */}
            <div className={`p-4 rounded-2xl border transition-all ${
              !googleSheetUrl.trim()
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : googleSheetUrl.includes('docs.google.com/spreadsheets')
                ? 'bg-rose-50/80 border-rose-300 text-rose-900'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    {!googleSheetUrl.trim() ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>เหตุผลที่ Google Sheet ยังไม่มีข้อมูล: ยังไม่ได้เชื่อมต่อ Web App URL</span>
                      </>
                    ) : googleSheetUrl.includes('docs.google.com/spreadsheets') ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>คุณใส่ลิงก์เปิดดู Google Sheets ธรรมดา ไม่ใช่ Web App URL</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>ตรวจพบ Web App URL พร้อมซิงค์ข้อมูล</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {!googleSheetUrl.trim()
                      ? 'เนื่องจาก Google Sheets ต้องใช้ช่องทาง Apps Script Web App ในการรับข้อมูลเข้าชีต กรุณาคัดลอกโค้ด Apps Script ไปติดตั้งและนำ URL ที่ลงท้ายด้วย /exec มาใส่'
                      : googleSheetUrl.includes('docs.google.com/spreadsheets')
                      ? 'ลิงก์ docs.google.com/spreadsheets... ไม่สามารถรับข้อมูลอัตโนมัติได้ ต้องใช้ URL ที่ได้จากการกด Deploy > Web App ใน Apps Script ครับ'
                      : `ปัจจุบันมีงานในระบบ ${tasks.length} รายการ สามารถกดปุ่ม "ซิงค์ข้อมูลเดี๋ยวนี้" ด้านล่าง เพื่ออัปเดตชีตได้ทันที`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Apps Script Web App URL:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className={`flex-1 bg-slate-50 border rounded-2xl px-3.5 py-2 text-slate-800 font-mono text-xs focus:outline-none transition-all shadow-2xs ${
                    googleSheetUrl.includes('docs.google.com/spreadsheets')
                      ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100 bg-rose-50/20'
                      : 'border-slate-200 focus:border-slate-500 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => syncWithGoogleSheet()}
                  disabled={syncingWithSheet || !googleSheetUrl.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs min-h-[38px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingWithSheet ? 'animate-spin' : ''}`} />
                  <span>{syncingWithSheet ? 'กำลังส่งข้อมูล...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
                </button>
              </div>

              {syncStatus.message && (
                <div className={`mt-2 text-xs font-semibold flex items-center gap-1.5 ${
                  syncStatus.status === 'success' ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {syncStatus.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{syncStatus.message}</span>
                </div>
              )}
            </div>

            {/* Auto-Sync Option */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">ซิงค์อัตโนมัติ (Auto-Sync to Google Sheets):</span>
                <p className="text-[11px] text-slate-500">
                  ส่งงานเข้า Google Sheet ทันทีที่มีการเพิ่มงานใหม่, ทำเครื่องหมายเสร็จ, หรือแก้ไขงาน
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={autoSyncSheet}
                  onChange={(e) => setAutoSyncSheet(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Quick Setup Instructions */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 mt-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-slate-700" />
                คู่มือการติดตั้ง Google Sheets + Apps Script แบบจับมือทำ (4 ขั้นตอน):
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                <li>เปิด Google Sheets ใหม่ที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-slate-900 underline font-semibold">sheets.new <ExternalLink className="w-3 h-3 inline" /></a></li>
                <li>ไปที่แถบเมนูด้านบนเลือก <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
                <li>ลบโค้ดเริ่มต้นทั้งหมด แล้วกดปุ่ม <strong>"คัดลอกโค้ด Apps Script"</strong> ด้านบนไปวางแทนที่ แล้วกด <strong>บันทึก (Save)</strong></li>
                <li>กดปุ่มสีน้ำเงิน <strong>Deploy</strong> &gt; <strong>New deployment</strong> &gt; เลือก <strong>Web app</strong> แล้วตั้งค่า:
                  <div className="mt-1 ml-4 p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                    <div>Execute as: <strong>Me (ฉัน)</strong></div>
                    <div>Who has access: <strong className="text-amber-800">Anyone (ทุกคน)</strong> *(สำคัญมาก)*</div>
                  </div>
                </li>
                <li>คัดลอก Web App URL (ลงท้ายด้วย <code className="bg-slate-200/80 px-1.5 py-0.5 rounded font-mono">/exec</code>) มาวางในช่องด้านบนนี้</li>
                <li className="text-emerald-700 font-medium">
                  <strong>พิมพ์สั่งงานผ่าน LINE โดยตรง:</strong> นำ Web App URL เดียวกันนี้ไปใส่ใน <strong>LINE Developers Console</strong> &gt; Messaging API &gt; <strong>Webhook settings</strong> แล้วเปิดสวิตช์ <strong>Use Webhook</strong> เป็น ON เท่านี้ก็สามารถพิมพ์สั่งงานผ่าน LINE ให้ลงปฏิทินได้ทันที!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Categories Management (Moved inside Settings) */}
      {settingsTab === 'categories' && (
        <CategoriesView />
      )}

      {/* Tab 4: Team & Assignees Management (Moved inside Settings) */}
      {settingsTab === 'users' && (
        <UsersView />
      )}

      {/* Tab 5: Preferences & Activity Logs */}
      {settingsTab === 'preferences' && (
        <div className="space-y-6">
          {/* Reminder & Audio Preferences */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  การตั้งเวลาเตือน & เสียงแจ้งเตือน
                </h2>
                <p className="text-xs text-slate-500">
                  กำหนดระยะเวลาแจ้งเตือนล่วงหน้า และระบบเสียงแจ้งเตือน
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เตือนล่วงหน้าตามค่าเริ่มต้น:
                </label>
                <select
                  value={defaultOffset}
                  onChange={(e) => setDefaultOffset(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-slate-500 cursor-pointer shadow-2xs"
                >
                  <option value={0}>ตรงเวลาเป๊ะ (0 นาที)</option>
                  <option value={15}>ล่วงหน้า 15 นาที</option>
                  <option value={30}>ล่วงหน้า 30 นาที</option>
                  <option value={60}>ล่วงหน้า 1 ชั่วโมง</option>
                  <option value={1440}>ล่วงหน้า 1 วัน</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div>
                  <div className="font-semibold text-slate-800">ระบบตรวจสอบเวลาอัตโนมัติ</div>
                  <div className="text-[11px] text-slate-400">ตรวจเช็คงานทุก 30 วินาที</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoReminder}
                  onChange={(e) => setAutoReminder(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div>
                  <div className="font-semibold text-slate-800">เปิดเสียงเตือน Chime</div>
                  <div className="text-[11px] text-slate-400">ส่งเสียงเมื่อถึงเวลาเตือน</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Notification Activity Logs */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              ประวัติการส่งแจ้งเตือนล่าสุด (Notification Activity Logs)
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {logs.length === 0 ? (
                <div className="py-6 text-center text-slate-400">ยังไม่มีประวัติการส่งข้อความ</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        log.status === 'sent' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                      <span className="font-semibold text-slate-800 truncate">{log.taskTitle}</span>
                      <span className="text-slate-400">({log.message})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {log.sentAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reset All Data Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-rose-200/60 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-rose-800">รีเซ็ตข้อมูลระบบกลับเป็นค่าเริ่มต้น</h4>
              <p className="text-[11px] text-slate-500">ล้างงานและประวัติทั้งหมด แล้วโหลดชุดข้อมูลตัวอย่างเริ่มต้น</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น?')) {
                  resetAllData();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูลตัวอย่างทั้งหมด</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Handover to New Owner Guide & Transfer Toolkit */}
      {settingsTab === 'handover' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Main Concept Banner */}
          <div className="bg-gradient-to-br from-blue-50/90 via-white to-emerald-50/80 text-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs border border-blue-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                🤝
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>วิธีส่งต่อระบบให้ผู้อื่นใช้งาน (บอร์ดในชื่อเขา + Google Sheet ของเขา 100%)</span>
                </h2>
                <p className="text-xs text-slate-600">
                  ระบบถูกออกแบบให้แยกอิสระ (Decoupled) แต่ละคนสามารถเป็นเจ้าของข้อมูลและมี LINE OA ของตนเองได้อย่างสมบูรณ์
                </p>
              </div>
            </div>

            {/* 3 Pillars Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-blue-700 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>1. Google Sheet ของเขา</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ข้อมูลงานจะถูกบันทึกลงใน Google Drive บัญชี Gmail ของเขาเอง ไม่ปะปนกับบัญชีของคุณ
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>2. LINE OA ในชื่อเขา</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  บอทจะแจ้งเตือนและรับคำสั่งแชทผ่าน LINE Official Account ที่เป็นชื่อและรูปโปรไฟล์ที่เขาต้องการ
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-indigo-700 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>3. บอร์ดในชื่อของเขา</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  หัวมุมซ้ายบนของระบบและชื่อเลขา จะแสดงเป็นชื่อเจ้าของใหม่ เช่น "บอร์ดงานคุณสมชาย"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Transfer Toolkit: Export / Import / Share Link */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    เครื่องมืออำนวยความสะดวกในการส่งต่อ (Quick Transfer Toolkit)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ส่งลิงก์ หรือคัดลอกชุดการตั้งค่า (Config JSON) ให้ผู้ใช้งานคนใหม่นำเข้าได้ทันที
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAppUrl}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAppUrl ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์เว็บระบบสำหรับแชร์'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>ส่งออกชุดการตั้งค่า (Export Config Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    เมื่อคุณช่วยเขาตั้งค่า Token หรือ Sheet URL เสร็จแล้ว สามารถคัดลอกชุดการตั้งค่าเป็น JSON เพื่อส่งให้เขานำไปใช้ในเครื่องของเขาได้ทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportConfig}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-98"
                >
                  {copiedExport ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExport ? 'คัดลอก JSON แล้ว! นำไปส่งต่อได้เลย' : 'คัดลอกชุดการตั้งค่า (Export JSON)'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>นำเข้าชุดการตั้งค่า (Import Config Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    หากเจ้าของใหม่ได้รับชุด JSON จากคุณ เขาสามารถกดนำเข้า เพื่อให้ระบบกรอก Token, Sheet URL และชื่อบอร์ดให้อัตโนมัติในคลิกเดียว
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportBox(!showImportBox)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-98"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{showImportBox ? 'ปิดกล่องนำเข้า' : 'เปิดกล่องนำเข้าชุดการตั้งค่า'}</span>
                </button>
              </div>
            </div>

            {/* Import Box */}
            {showImportBox && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <label className="block font-bold text-emerald-950 text-xs">
                  วางข้อความ JSON ที่ได้รับมาในช่องนี้:
                </label>
                <textarea
                  rows={4}
                  value={importConfigText}
                  onChange={(e) => setImportConfigText(e.target.value)}
                  placeholder='{"organizationName": "บอร์ดงานคุณสมชาย", "botName": "น้องเลขา", ...}'
                  className="w-full bg-white border border-emerald-300 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportBox(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-white text-xs cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleImportConfig}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    ยืนยันนำเข้าข้อมูล
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Step-by-Step Handover Guide */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
                📋
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ขั้นตอนการตั้งค่าอย่างละเอียด 3 ขั้นตอน (สำหรับตั้งค่าให้เจ้าของใหม่)
                </h3>
                <p className="text-xs text-slate-500">
                  ทำตามขั้นตอนนี้ ข้อมูลของเขาจะปลอดภัย แยกอิสระ และทำงานได้อย่างสมบูรณ์แบบ 100%
                </p>
              </div>
            </div>

            {/* Step 1: Google Sheet */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-2xs shrink-0">
                  1
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  ให้เขาสร้าง Google Sheet ในบัญชี Google Drive ของเขาเอง
                </h4>
              </div>

              <div className="ml-8 space-y-2 text-xs text-slate-600">
                <p>
                  เพื่อให้ข้อมูลงานทั้งหมดเป็นของเขา 100% ให้เปิดบัญชี Google ของเจ้าของใหม่ แล้วทำตามนี้:
                </p>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>เปิด Google Sheet เปล่าที่ <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">sheets.new <ExternalLink className="w-3 h-3 inline" /></a></li>
                    <li>ไปที่เมนู <b>ส่วนขยาย (Extensions)</b> &gt; <b>Apps Script</b></li>
                    <li>ลบโค้ดเดิมออกทั้งหมด แล้วนำโค้ดจากปุ่ม <b>"คัดลอกโค้ด Apps Script"</b> ด้านล่างนี้ไปวาง</li>
                    <li>กด <b>Deploy (การทำให้ใช้งานได้)</b> &gt; <b>New deployment</b> &gt; เลือก <b>Web app</b>:
                      <div className="mt-1 ml-4 p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono">
                        Execute as: <b>Me (ฉัน)</b><br />
                        Who has access: <b className="text-amber-800">Anyone (ทุกคน)</b> *(สำคัญมาก)*
                      </div>
                    </li>
                    <li>กด Deploy แล้วคัดลอก <b>Web App URL</b> (ที่ลงท้ายด้วย <code>/exec</code>)</li>
                  </ol>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'คัดลอกโค้ดเรียบร้อย!' : 'คัดลอกโค้ด Apps Script (Code.gs)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCode}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด Code.gs</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: LINE Official Account */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-2xs shrink-0">
                  2
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  สร้าง LINE Official Account ให้เป็นชื่อบอทของเขาเอง
                </h4>
              </div>

              <div className="ml-8 space-y-2 text-xs text-slate-600">
                <p>
                  ให้บอทส่งข้อความในนามองค์กรหรือชื่อของเขา และสามารถพิมพ์สั่งงานผ่าน LINE ได้:
                </p>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>เข้าสู่ระบบที่ <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">LINE Developers Console <ExternalLink className="w-3 h-3 inline" /></a> ด้วยบัญชี LINE ของเขา</li>
                    <li>สร้าง Provider ใหม่ (เช่น ชื่อบริษัท หรือชื่อของเขา) แล้วสร้าง Channel ประเภท <b>Messaging API</b> (ตั้งชื่อบอทและใส่รูปโปรไฟล์ที่เขาต้องการ)</li>
                    <li>ไปที่แท็บ <b>Messaging API</b>:
                      <ul className="list-disc list-inside ml-4 mt-1 text-[11px] space-y-0.5">
                        <li>เลื่อนลงมาด้านล่างสุด กด <b>Issue</b> ที่ช่อง <b>Channel access token (long-lived)</b> เพื่อรับ Token</li>
                        <li>ดู <b>Your user ID</b> ที่ด้านล่างแท็บ Basic settings เพื่อใช้เป็นผู้รับข้อความแจ้งเตือน</li>
                      </ul>
                    </li>
                    <li className="text-emerald-800 font-semibold">
                      <b>ตั้งค่าพิมพ์สั่งงานผ่าน LINE โดยตรง:</b> ในแท็บ Messaging API หัวข้อ <b>Webhook settings</b> วาง Web App URL จากขั้นตอนที่ 1 แล้วเปิดสวิตช์ <b>Use Webhook</b> เป็น ON
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Step 3: Fill in System Settings */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono shadow-2xs shrink-0">
                  3
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  นำค่าทั้งหมดมากรอกในหน้า "ตั้งค่าระบบ" ในเครื่องของเขา
                </h4>
              </div>

              <div className="ml-8 space-y-2 text-xs text-slate-600">
                <p>
                  ส่งลิงก์เว็บไซต์นี้ให้เขาเปิดในเบราว์เซอร์ของเขา แล้วไปที่เมนู <b>ตั้งค่าระบบ</b>:
                </p>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-800">ชื่อบอร์ด / เจ้าของระบบ</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">ระบุชื่อ เช่น "บอร์ดงานคุณสมชาย"</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-800">ชื่อบอทเลขา</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">ระบุชื่อ เช่น "เลขาคุณสมชาย"</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-800">LINE Access Token & User ID</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">วางค่าจาก LINE Developers ของเขา</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-800">Google Sheet Web App URL</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">วาง URL จาก Google Sheet ของเขา</div>
                    </div>
                  </div>
                  <div className="pt-1 text-slate-700 font-medium">
                    กดปุ่ม <b>"บันทึกการตั้งค่า"</b> เท่านี้ระบบก็จะเป็นของเขาอย่างสมบูรณ์ ข้อมูลทั้งหมดจะวิ่งเข้า Google Sheet ของเขา และแจ้งเตือนผ่านบอทชื่อของเขา 100%!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
