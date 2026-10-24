import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  FileCode, 
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Save,
  CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOOGLE_APPS_SCRIPT_CODE, downloadFile } from '../utils/googleSheetsAppsScript';

export const GoogleSheetSetupModal: React.FC = () => {
  const { 
    isGoogleSheetModalOpen, 
    setIsGoogleSheetModalOpen, 
    settings, 
    updateSettings, 
    tasks, 
    syncWithGoogleSheet,
    syncingWithSheet,
    testGoogleSheetConnection,
    exportToCsvFile,
    setToastBanner
  } = useApp();

  const [urlInput, setUrlInput] = useState(settings.googleSheetWebhookUrl || '');
  const [autoSync, setAutoSync] = useState(settings.autoSyncGoogleSheet !== false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowCount?: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isGoogleSheetModalOpen) return null;

  const trimmedUrl = urlInput.trim();
  const isDocSpreadsheetUrl = trimmedUrl.includes('docs.google.com/spreadsheets');
  const isValidWebAppUrl = trimmedUrl.startsWith('https://script.google.com/macros/s/') && trimmedUrl.includes('/exec');
  const hasUrl = !!trimmedUrl;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setToastBanner({
      type: 'success',
      message: 'คัดลอกโค้ด Google Apps Script แล้ว! นำไปวางใน Extensions > Apps Script',
    });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleDownloadCode = () => {
    downloadFile('Code.gs', GOOGLE_APPS_SCRIPT_CODE, 'text/plain;charset=utf-8');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      googleSheetWebhookUrl: trimmedUrl,
      autoSyncGoogleSheet: autoSync,
    });
    setSaveSuccess(true);
    setToastBanner({
      type: 'success',
      message: 'บันทึกการตั้งค่า Google Sheets สำเร็จเรียบร้อย!',
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTest = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testGoogleSheetConnection(trimmedUrl);
      setTestResult(res);
      if (res.success) {
        // Save URL if it worked
        updateSettings({ googleSheetWebhookUrl: trimmedUrl });
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleImmediateSync = async () => {
    // If input changed, update first
    if (trimmedUrl !== settings.googleSheetWebhookUrl) {
      updateSettings({ googleSheetWebhookUrl: trimmedUrl });
    }
    const result = await syncWithGoogleSheet();
    if (result.success) {
      setTestResult({
        success: true,
        message: result.message,
      });
    } else {
      setTestResult({
        success: false,
        message: result.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-black/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                <span>จัดการ & เชื่อมต่อ Google Sheets</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                ทำไมในชีตถึงยังไม่มีข้อมูล? และวิธีแก้ไขให้ข้อมูลซิงค์เข้าชีตอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGoogleSheetModalOpen(false)}
            className="p-2 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px] active:scale-95 shrink-0"
            title="ปิด"
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Diagnostic Status Card - Answers the user's exact query */}
          <div className="p-4 rounded-2xl border transition-all space-y-3 bg-gradient-to-br from-slate-50 to-emerald-50/30 border-slate-200/80">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {!hasUrl ? (
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                ) : isDocSpreadsheetUrl ? (
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                ) : isValidWebAppUrl ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    {!hasUrl && '⚠️ สาเหตุที่ใน Google Sheet ยังไม่มีข้อมูล: ยังไม่ได้ใส่ Web App URL'}
                    {isDocSpreadsheetUrl && '🛑 พบข้อผิดพลาด: คุณใส่ลิงก์ Google Sheets ธรรมดา'}
                    {hasUrl && !isDocSpreadsheetUrl && isValidWebAppUrl && '✅ ตรวจพบ Web App URL ถูกต้อง พร้อมส่งข้อมูล'}
                    {hasUrl && !isDocSpreadsheetUrl && !isValidWebAppUrl && '⚠️ รูปแบบ URL อาจไม่ถูกต้อง (ต้องลงท้ายด้วย /exec)'}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {!hasUrl && 'ในปัจจุบันระบบบันทึกงานทั้งหมดไว้ในเครื่องของคุณเรียบร้อยแล้ว แต่เพื่อส่งข้อมูลไปโผล่ใน Google Sheet ของคุณ คุณต้องเชื่อมโยงผ่าน Google Apps Script Web App (ใช้เวลาทำเพียง 1 นาที ทำตาม 4 ขั้นตอนด้านล่าง)'}
                    {isDocSpreadsheetUrl && 'ลิงก์ที่ขึ้นต้นด้วย docs.google.com/spreadsheets เป็นเพียงลิงก์หน้าเว็บสำหรับเปิดดูชีต ไม่สามารถรับข้อมูลอัตโนมัติได้ ต้องใช้ URL ที่ได้จากการกด Deploy ใน Apps Script ที่ลงท้ายด้วย /exec เท่านั้นครับ'}
                    {hasUrl && !isDocSpreadsheetUrl && isValidWebAppUrl && 'ระบบพร้อมส่งข้อมูลงานทั้งหมดเข้าสู่ Google Sheet ของคุณแล้ว กดปุ่ม "ซิงค์ข้อมูลเดี๋ยวนี้" หรือเปิด Auto-Sync ด้านล่าง'}
                    {hasUrl && !isDocSpreadsheetUrl && !isValidWebAppUrl && 'กรุณาตรวจสอบว่า URL ขึ้นต้นด้วย https://script.google.com/macros/s/... และลงท้ายด้วย /exec'}
                  </p>
                </div>
              </div>

              {settings.lastGoogleSheetSyncAt && (
                <span className="hidden sm:inline-block px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-full whitespace-nowrap shadow-2xs">
                  ซิงค์ล่าสุด: {settings.lastGoogleSheetSyncAt} น.
                </span>
              )}
            </div>

            {/* Quick Test / Sync Action Buttons */}
            <div className="pt-2 border-t border-black/[0.05] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleImmediateSync}
                  disabled={syncingWithSheet || !trimmedUrl}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingWithSheet ? 'animate-spin' : ''}`} />
                  <span>{syncingWithSheet ? 'กำลังส่งข้อมูล...' : `ส่งข้อมูลทั้งหมด (${tasks.length} งาน) เข้า Google Sheet ทันที`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testingConnection || !trimmedUrl}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{testingConnection ? 'กำลังตรวจสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-[11px] ${
                  testResult.success 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Web App URL Input Form */}
          <form onSubmit={handleSave} className="space-y-3 bg-[#F5F5F7] p-4 rounded-2xl border border-black/[0.05]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Google Apps Script Web App URL:</span>
                <span className="text-rose-500">*</span>
              </label>
              {saveSuccess && (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> บันทึกแล้ว
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className={`flex-1 bg-white border rounded-2xl px-3.5 py-2 text-slate-800 font-mono text-xs focus:outline-none transition-all shadow-2xs ${
                  isDocSpreadsheetUrl
                    ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-100'
                    : isValidWebAppUrl
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-slate-300 focus:border-emerald-500'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 active:scale-97 transition-all shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึก URL</span>
              </button>
            </div>

            {/* Auto-Sync Toggle Option */}
            <div className="pt-2 flex items-center justify-between border-t border-black/[0.05]">
              <div>
                <span className="font-semibold text-slate-800">ซิงค์อัตโนมัติ (Auto-Sync to Google Sheets):</span>
                <p className="text-[11px] text-slate-500">
                  ทุกครั้งที่มีการเพิ่มงานใหม่, ทำเครื่องหมายเสร็จ, หรือแก้ไขงาน จะส่งเข้าชีตทันที
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => {
                    setAutoSync(e.target.checked);
                    updateSettings({ autoSyncGoogleSheet: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </form>

          {/* 4-Step Visual Guided Setup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span>วิธีติดตั้ง Google Apps Script ให้เชื่อมต่อกับชีต (ทำเพียงครั้งเดียว):</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด Apps Script'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCode}
                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                  title="ดาวน์โหลดไฟล์ Code.gs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ดาวน์โหลด</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span className="font-bold text-slate-800">เปิด Google Sheets ใหม่</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  เปิดหน้าต่างชีตว่างเปล่าที่ต้องการเก็บข้อมูลงาน
                </p>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#0071E3] font-bold text-[11px] hover:underline pt-0.5"
                >
                  <span>สร้าง Google Sheets ใหม่ (sheets.new)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span className="font-bold text-slate-800">เปิด Apps Script & วางโค้ด</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  ที่เมนูด้านบนของ Google Sheets เลือก:
                  <br />
                  <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong>
                  <br />
                  ลบโค้ดเดิมออกทั้งหมด แล้วกดปุ่ม <strong>"คัดลอกโค้ด Apps Script"</strong> ไปวาง แล้วกด Save (รูปแผ่นดิสก์)
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl border-2 border-orange-300 bg-orange-50/50 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span className="font-bold text-orange-950">กด Deploy (สำคัญมาก!)</span>
                </div>
                <p className="text-orange-900 leading-relaxed text-[11px]">
                  กดปุ่มสีน้ำเงิน <strong>Deploy (การทำให้ใช้งานได้)</strong> &gt; <strong>New deployment</strong>
                  <br />
                  เลือกเฟืองซ้ายมือเป็น <strong>Web app</strong> แล้วตั้งค่า:
                </p>
                <div className="bg-white/90 p-2 rounded-xl border border-orange-200 text-[11px] font-mono text-slate-800 space-y-0.5">
                  <div>Execute as: <strong className="text-emerald-700">Me (ฉัน)</strong></div>
                  <div>Who has access: <strong className="text-orange-700">Anyone (ทุกคน)</strong></div>
                </div>
                <p className="text-[10px] text-orange-800 font-semibold">
                  * หากไม่เลือก Anyone (ทุกคน) Google จะบล็อกไม่ให้ระบบบันทึกงานเข้าชีต
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span className="font-bold text-slate-800">คัดลอก URL มาวาง</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  คัดลอก <strong>Web app URL</strong> ที่ขึ้นมาหลัง Deploy (ที่ลงท้ายด้วย <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">/exec</code>)
                  นำมาวางในช่องด้านบน แล้วกดปุ่ม <strong>"ส่งข้อมูลเข้าชีตทันที"</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Alternative 1-Click: Download CSV for Immediate Import */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ทางเลือกด่วน: ต้องการดูข้อมูลใน Google Sheet เดี๋ยวนี้โดยยังไม่ตั้งค่า Apps Script?</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                คุณสามารถกดดาวน์โหลดไฟล์ CSV แล้วไปที่ Google Sheets เลือก <strong>ไฟล์ (File) &gt; นำเข้า (Import) &gt; อัปโหลด</strong> เพื่อเปิดดูงาน {tasks.length} รายการได้ทันที (รองรับภาษาไทยสมบูรณ์ 100%)
              </p>
            </div>
            <button
              type="button"
              onClick={exportToCsvFile}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-97 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV สำหรับเปิดใน Google Sheets</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.06] bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            ระบบรองรับ Google Apps Script Web App และระบบจัดการตารางงานแบบ Real-time
          </div>
          <button
            type="button"
            onClick={() => setIsGoogleSheetModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
