import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { buildLineFlexBubble } from './src/utils/lineFlexBuilder.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : null;
const PORT = Number(process.env.PORT) || portFromArg || 3000;

app.use(express.json());

// API: Send LINE Messaging API Push Notification (Server-side to bypass browser CORS)
app.post('/api/line/push', async (req: Request, res: Response) => {
  try {
    const { token, userId, userIds, task, category, assignee, themeId, messageText, customFlex, altText } = req.body;

    let targetList: string[] = [];
    if (Array.isArray(userIds) && userIds.length > 0) {
      targetList = userIds.map(s => String(s).trim()).filter(Boolean);
    } else if (userId) {
      targetList = String(userId).split(',').map(s => s.trim()).filter(Boolean);
    }

    if (!token || targetList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุทั้ง LINE Channel Access Token และ LINE User ID / Group ID ในหน้าตั้งค่าระบบ',
      });
    }

    // Build LINE Flex or Text message
    let lineMessages: any[] = [];

    if (customFlex) {
      lineMessages.push({
        type: 'flex',
        altText: altText || `☀️ [สรุปตารางงานประจำวัน] To Do List Calendar`,
        contents: customFlex,
      });
    } else if (task) {
      const appUrl = process.env.APP_URL || 'https://ais-dev-f6dbiiwy3w3yu5bdq7tyax-1077673389760.asia-southeast1.run.app';
      const flexBubble = buildLineFlexBubble({
        task,
        category,
        assignee,
        themeId: themeId || 'apple-modern',
        appUrl,
      });

      lineMessages.push({
        type: 'flex',
        altText: `🔔 [เตือนงาน] ${task.title} (กำหนด: ${task.time} น.)`,
        contents: flexBubble,
      });
    } else {
      lineMessages.push({
        type: 'text',
        text: messageText || '🔔 แจ้งเตือนจากระบบ To Do List Calendar',
      });
    }

    // Call LINE Official API for each target (Server-to-Server)
    let successCount = 0;
    let lastErrorBody: any = null;
    let lastStatus = 400;

    for (const targetId of targetList) {
      try {
        const lineResponse = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({
            to: targetId,
            messages: lineMessages,
          }),
        });

        if (lineResponse.ok) {
          successCount++;
        } else {
          lastStatus = lineResponse.status;
          lastErrorBody = await lineResponse.json().catch(() => ({}));
          console.error(`LINE API Error for ${targetId}:`, lastErrorBody);
        }
      } catch (err: any) {
        console.error(`Fetch error for ${targetId}:`, err);
      }
    }

    if (successCount > 0) {
      return res.json({
        success: true,
        sentCount: successCount,
        message: targetList.length > 1 
          ? `ส่งการแจ้งเตือนเข้าสู่แอป LINE (${successCount} ผู้รับ/กลุ่ม) สำเร็จเรียบร้อย!`
          : 'ส่งการแจ้งเตือนเข้าสู่แอป LINE สำเร็จเรียบร้อย!',
      });
    }

    let friendlyError = lastErrorBody?.message || 'ส่งไม่สำเร็จ';
    if (friendlyError.includes('Invalid reply token') || friendlyError.includes('access token')) {
      friendlyError = 'LINE Channel Access Token ไม่ถูกต้องหรือหมดอายุ';
    } else if (friendlyError.includes('Failed to send messages') || friendlyError.includes('userId')) {
      friendlyError = 'LINE User ID หรือ Group ID ไม่ถูกต้อง (ต้องเป็น ID จาก LINE Developers หรือ ID กลุ่มที่ดึงจาก Webhook)';
    }

    return res.status(lastStatus).json({
      success: false,
      error: friendlyError,
      raw: lastErrorBody,
    });
  } catch (err: any) {
    console.error('Error in /api/line/push:', err);
    return res.status(500).json({
      success: false,
      error: `เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: ${err.message}`,
    });
  }
});

// API: Test Connection & Profile lookup
app.post('/api/line/test', async (req: Request, res: Response) => {
  try {
    const { token, userId } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุ Channel Access Token' });
    }

    // Verify token by calling LINE bot info endpoint
    const infoRes = await fetch('https://api.line.me/v2/bot/info', {
      headers: { Authorization: `Bearer ${token.trim()}` },
    });

    if (!infoRes.ok) {
      return res.status(401).json({
        success: false,
        error: 'Token ไม่ถูกต้อง (LINE API แจ้งว่า Unauthorized)',
      });
    }

    const botInfo = await infoRes.json();

    // If userId provided, send quick greeting test
    let pushSuccess = false;
    let pushErrorMsg = '';

    if (userId) {
      const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({
          to: userId.trim(),
          messages: [
            {
              type: 'text',
              text: `✅ ทดสอบการเชื่อมต่อระบบสำเร็จ!\nระบบ To Do List Calendar สามารถส่งข้อความเข้า LINE ของคุณได้เรียบร้อยแล้วครับ 🎉\n\nบอท: ${botInfo.displayName} (@${botInfo.basicId || ''})`,
            },
          ],
        }),
      });

      pushSuccess = pushRes.ok;
      if (!pushSuccess) {
        const errJson = await pushRes.json().catch(() => ({}));
        console.warn('Test Push failed:', errJson);
        pushErrorMsg = errJson.message || 'ไม่สามารถส่งเข้า User ID ได้ (กรุณาเพิ่มบอทเป็นเพื่อนก่อน และใช้ User ID จาก LINE Developers)';
      }
    }

    let returnMessage = `เชื่อมต่อกับ Bot "${botInfo.displayName}" สำเร็จ`;
    if (userId) {
      if (pushSuccess) {
        returnMessage = `เชื่อมต่อกับ Bot "${botInfo.displayName}" สำเร็จ และส่งข้อความเข้ามือถือเรียบร้อย! 🎉`;
      } else {
        returnMessage = `เชื่อมต่อกับ Bot สำเร็จ แต่ยังส่งเข้า User ID ไม่ได้: ${pushErrorMsg}`;
      }
    }

    return res.json({
      success: pushSuccess || (!userId && true),
      botName: botInfo.displayName,
      botId: botInfo.basicId,
      pushSuccess,
      message: returnMessage,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API: Proxy sync to Google Apps Script (Bypasses browser CORS & follows 302 redirects)
app.post('/api/sheets/sync', async (req: Request, res: Response) => {
  try {
    const { webhookUrl, tasks } = req.body;

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ยังไม่ได้ระบุ Google Apps Script Web App URL กรุณาตั้งค่าในหน้า "ตั้งค่าระบบ"',
        reasonCode: 'MISSING_URL',
      });
    }

    const trimmedUrl = webhookUrl.trim();

    // Check if user accidentally pasted Google Sheets view/edit link instead of Apps Script Web App URL
    if (trimmedUrl.includes('docs.google.com/spreadsheets')) {
      return res.status(400).json({
        success: false,
        error: 'คุณกรอกลิงก์เปิดดู Google Sheets ธรรมดา (ไม่ใช่ Web App URL) ต้องใช้ URL ที่ได้จากการกด "Deploy > New deployment" ใน Apps Script ที่ลงท้ายด้วย /exec',
        reasonCode: 'WRONG_URL_TYPE',
      });
    }

    if (!trimmedUrl.startsWith('https://script.google.com/macros/s/')) {
      return res.status(400).json({
        success: false,
        error: 'รูปแบบ Web App URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย https://script.google.com/macros/s/... และลงท้ายด้วย /exec)',
        reasonCode: 'INVALID_URL_FORMAT',
      });
    }

    // Call Google Apps Script with follow redirects
    const scriptRes = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync_all',
        tasks: tasks || [],
      }),
      redirect: 'follow',
    });

    const responseText = await scriptRes.text();

    try {
      const data = JSON.parse(responseText);
      if (data.status === 'success') {
        const rowCount = data.count !== undefined ? data.count : (tasks?.length || 0);
        return res.json({
          success: true,
          count: rowCount,
          message: `ซิงค์งาน ${rowCount} รายการลงใน Google Sheets สำเร็จเรียบร้อย!`,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: data.message || 'Google Apps Script ตอบกลับข้อผิดพลาด',
          raw: data,
          reasonCode: 'SCRIPT_ERROR',
        });
      }
    } catch {
      // If HTML was returned, analyze common Apps Script configuration issues
      if (
        responseText.includes('accounts.google.com') ||
        responseText.includes('Service Login') ||
        responseText.includes('Sign in')
      ) {
        return res.status(403).json({
          success: false,
          error: 'สิทธิ์การเข้าถึงถูกปฏิเสธ: ในขั้นตอน Deploy ของ Apps Script ต้องตั้งค่า "Who has access" (ผู้มีสิทธิ์เข้าถึง) เป็น "Anyone" (ทุกคน)',
          reasonCode: 'AUTH_REQUIRED',
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Google Apps Script ส่งข้อมูลกลับมาไม่ถูกต้อง (โปรดตรวจสอบว่าได้วางโค้ด Code.gs ครบถ้วนและกด Deploy แล้วหรือยัง)',
        rawSnippet: responseText.slice(0, 300),
        reasonCode: 'UNEXPECTED_RESPONSE',
      });
    }
  } catch (err: any) {
    console.error('Error in /api/sheets/sync:', err);
    return res.status(500).json({
      success: false,
      error: `ไม่สามารถเชื่อมต่อไปยัง Google Apps Script: ${err.message}`,
      reasonCode: 'NETWORK_ERROR',
    });
  }
});

// API: Test Google Sheet Web App connection
app.post('/api/sheets/test', async (req: Request, res: Response) => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ยังไม่ได้ระบุ Google Apps Script Web App URL',
        reasonCode: 'MISSING_URL',
      });
    }

    const trimmedUrl = webhookUrl.trim();
    if (trimmedUrl.includes('docs.google.com/spreadsheets')) {
      return res.status(400).json({
        success: false,
        error: 'คุณกรอกลิงก์เปิดดู Google Sheets ธรรมดา ต้องใช้ Web App URL ที่ลงท้ายด้วย /exec',
        reasonCode: 'WRONG_URL_TYPE',
      });
    }

    const scriptRes = await fetch(trimmedUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    const responseText = await scriptRes.text();

    try {
      const data = JSON.parse(responseText);
      if (data.status === 'success') {
        const rowsFound = Array.isArray(data.data) ? data.data.length : 0;
        return res.json({
          success: true,
          rowCount: rowsFound,
          message: `เชื่อมต่อ Google Sheets สำเร็จ! ปัจจุบันพบข้อมูลในชีต ${rowsFound} รายการ`,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: data.message || 'Google Apps Script ตอบกลับข้อผิดพลาด',
        });
      }
    } catch {
      if (responseText.includes('Sign in') || responseText.includes('accounts.google.com')) {
        return res.status(403).json({
          success: false,
          error: 'สิทธิ์ถูกบล็อก: ต้องตั้งค่า Deploy Web App ให้ Who has access เป็น "Anyone" (ทุกคน)',
          reasonCode: 'AUTH_REQUIRED',
        });
      }
      return res.status(500).json({
        success: false,
        error: 'เชื่อมต่อได้ แต่ Apps Script ไม่ได้ส่งผลลัพธ์เป็น JSON กรุณาตรวจสอบโค้ด Code.gs',
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `เชื่อมต่อไปยัง Google ไม่สำเร็จ: ${err.message}`,
    });
  }
});

// Serve frontend in Dev vs Production
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} (0.0.0.0)`);
  });
}

startServer();
