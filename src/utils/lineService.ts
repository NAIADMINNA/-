import { Task, Category, Priority, UserAssignee } from '../types';
import { formatThaiDate } from './thaiDate';
import { LineThemeId, buildLineFlexBubble, buildMorningBriefingFlexBubble, formatMorningBriefingTextMessage } from './lineFlexBuilder';

/**
 * Play a gentle mobile notification chime using Web Audio API
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Pleasant double chime: 880Hz (A5) then 1174.66Hz (D6)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {
    // AudioContext might require user gesture in some browsers
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'high':
      return '🔴 สำคัญมาก (High)';
    case 'medium':
      return '🟡 ปานกลาง (Medium)';
    case 'low':
      return '🟢 ทั่วไป (Low)';
  }
}

/**
 * Formats task into clean, elegant text message with Thai date and badges
 */
export function formatLineTextMessage(task: Task, categoryName = 'ทั่วไป', assigneeName?: string): string {
  const thaiDate = formatThaiDate(task.date, { shortMonth: false });
  const priorityThai = task.priority === 'high' ? '🔴 สำคัญมาก' : task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ทั่วไป';

  return `🔔 [TO-DO REMINDER] แจ้งเตือนงานใกล้ถึงเวลา!
━━━━━━━━━━━━━━━━━━
📌 งาน: ${task.title}
${task.description ? `📝 รายละเอียด: ${task.description}\n` : ''}📅 กำหนดส่ง: ${thaiDate}
🕒 เวลา: ${task.time} น. (${task.reminderMinutesBefore > 0 ? `เตือนก่อน ${task.reminderMinutesBefore} นาที` : 'ตรงเวลา'})
📁 หมวดหมู่: ${categoryName}
⭐ ความสำคัญ: ${priorityThai}
${assigneeName ? `👤 ผู้รับผิดชอบ: ${assigneeName}\n` : ''}━━━━━━━━━━━━━━━━━━
⚡ สามารถเปิดดูงานในระบบ เพื่ออัปเดตสถานะเมื่อทำเสร็จสิ้น`;
}

export interface LinePushResult {
  success: boolean;
  message: string;
  isRealLine?: boolean;
  isNotConfigured?: boolean;
}

/**
 * Sends a push notification to LINE via backend proxy / Google Apps Script
 */
export async function sendLinePushNotification({
  task,
  category,
  assignee,
  themeId = 'apple-modern',
  token,
  userId,
  userIds,
  appsScriptUrl
}: {
  task: Task;
  category?: Category;
  assignee?: UserAssignee;
  themeId?: LineThemeId;
  token?: string;
  userId?: string;
  userIds?: string[];
  appsScriptUrl?: string;
}): Promise<LinePushResult> {
  const hasToken = Boolean(token && token.trim());
  const hasUser = Boolean((userId && userId.trim()) || (userIds && userIds.length > 0));

  // If user hasn't configured Token or User ID yet
  if (!hasToken || !hasUser) {
    return {
      success: false,
      isNotConfigured: true,
      message: 'ยังไม่ได้ระบุ LINE Channel Access Token และ User ID / Group ID ในหน้าตั้งค่าระบบ (กำลังแสดงผลจำลองในหน้าจอขวามือ)',
    };
  }

  // 1. Try our full-stack server-side proxy endpoint (/api/line/push)
  try {
    const response = await fetch('/api/line/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token?.trim(),
        userId: userId?.trim(),
        userIds,
        task: {
          ...task,
          categoryName: category?.name || task.categoryId,
        },
        category,
        assignee,
        themeId,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return {
        success: true,
        isRealLine: true,
        message: 'ส่งการแจ้งเตือนเข้าแอป LINE บนมือถือของคุณสำเร็จเรียบร้อย! 🎉',
      };
    }

    // Server returned an error from LINE API (e.g. invalid token, user ID mismatch)
    return {
      success: false,
      message: data.error || 'LINE API ปฏิเสธการส่ง กรุณาตรวจสอบ Token และ User ID',
    };
  } catch (err: any) {
    // If backend proxy failed, try Google Apps Script URL fallback if configured
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const gasResponse = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_line_push',
            task: {
              ...task,
              categoryName: category?.name || task.categoryId,
            },
            userId: userId?.trim(),
          }),
        });
        if (gasResponse.ok) {
          return {
            success: true,
            isRealLine: true,
            message: 'ส่งการแจ้งเตือนผ่าน Google Apps Script เข้า LINE สำเร็จ!',
          };
        }
      } catch (gasErr) {
        console.warn('Apps Script push error:', gasErr);
      }
    }

    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ LINE: ${err.message}`,
    };
  }
}

/**
 * Sends a Daily Morning Briefing Push Notification via LINE
 */
export async function sendLineMorningBriefingNotification({
  tasks,
  categories,
  users = [],
  token,
  userId,
  themeId = 'apple-modern',
  dateString,
  customBriefingTime = '07:30',
}: {
  tasks: Task[];
  categories: Category[];
  users?: UserAssignee[];
  token?: string;
  userId?: string;
  themeId?: LineThemeId;
  dateString?: string;
  customBriefingTime?: string;
}): Promise<{ success: boolean; isRealLine?: boolean; isNotConfigured?: boolean; message: string; customFlex?: any }> {
  const targetDate = dateString || new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === targetDate);
  const thaiDate = formatThaiDate(targetDate, { shortMonth: false });

  // Build the gorgeous Morning Briefing Flex Bubble
  const briefingBubble = buildMorningBriefingFlexBubble({
    tasks,
    categories,
    users,
    dateString: targetDate,
    briefingTime: customBriefingTime,
    themeId,
  });

  // Plain text fallback
  const plainTextMessage = formatMorningBriefingTextMessage(
    tasks,
    targetDate,
    customBriefingTime
  );

  // If credentials are not configured, simulate in UI
  if (!token?.trim() || !userId?.trim()) {
    return {
      success: true,
      isRealLine: false,
      isNotConfigured: true,
      message: `จำลองการส่งสรุปตารางงานยามเช้าประจำวันที่ ${thaiDate} (${todayTasks.length} งาน) ในหน้าจอ LINE Phone Simulator เรียบร้อย`,
      customFlex: briefingBubble,
    };
  }

  // Send to backend proxy
  try {
    const response = await fetch('/api/line/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.trim(),
        userId: userId.trim(),
        customFlex: briefingBubble,
        altText: `☀️ [สรุปตารางงานวันนี้] วันที่ ${thaiDate} (${todayTasks.length} งาน)`,
        messageText: plainTextMessage,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return {
        success: true,
        isRealLine: true,
        message: `ส่งสรุปตารางงานยามเช้า (${todayTasks.length} งาน) เข้าแอป LINE มือถือจริงเรียบร้อยแล้ว! ☀️`,
        customFlex: briefingBubble,
      };
    }

    return {
      success: false,
      message: data.error || 'LINE API ปฏิเสธการส่งสรุปงานยามเช้า กรุณาตรวจสอบ Token และ User ID',
      customFlex: briefingBubble,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ LINE: ${err.message}`,
      customFlex: briefingBubble,
    };
  }
}

/**
 * Tests connection with LINE Developers API
 */
export async function testLineConnection(token: string, userId?: string): Promise<{ success: boolean; message: string; botName?: string }> {
  try {
    const res = await fetch('/api/line/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim(), userId: userId?.trim() }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message,
        botName: data.botName,
      };
    }
    return {
      success: false,
      message: data.error || 'การเชื่อมต่อกับ LINE ล้มเหลว',
    };
  } catch (e: any) {
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${e.message}`,
    };
  }
}
