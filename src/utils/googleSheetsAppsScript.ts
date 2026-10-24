/**
 * Google Apps Script (Code.gs) template for integrating Google Sheets + LINE Messaging API
 * รองรับทั้งการซิงค์ข้อมูลกับปฏิทิน และการพิมพ์สั่งงาน/บันทึกนัดหมายลงปฏิทินผ่าน LINE โดยตรง (Direct LINE Webhook)
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * Book Intelligent - To Do List Calendar + LINE Reminder & Direct Chat
 * =========================================================================
 * 
 * คุณสมบัติเด่น:
 * 1. ฐานข้อมูล Google Sheets บันทึกและดึงข้อมูลงาน 100%
 * 2. รองรับพิมพ์บันทึกนัดหมายผ่าน LINE OA โดยตรง! เช่น:
 *    - "นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน"
 *    - "เตือน จ่ายค่าภาษี วันที่ 25/10/2026 เวลา 14:30 สำคัญมาก"
 *    - "นัดพบลูกค้า วันศุกร์ 14:00 ด่วน"
 * 3. ส่งข้อความแจ้งเตือนอัตโนมัติก่อนถึงเวลานัดหมาย (Trigger)
 * 4. สรุปตารางงานประจำวัน (Morning Briefing)
 * 
 * -------------------------------------------------------------------------
 * วิธีการติดตั้งและเปิดใช้งาน LINE Webhook:
 * 1. เปิด Google Sheets เปล่าขึ้นมา
 * 2. ไปที่เมนู ส่วนขยาย (Extensions) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดชุดนี้ลงไป
 * 4. แก้ไข LINE_CHANNEL_ACCESS_TOKEN ด้านล่างให้เป็น Token ของคุณ
 * 5. กด บันทึก (Save)
 * 6. กดปุ่ม 'Deploy' (การทำให้ใช้งานได้) > 'New deployment' (การทำให้ใช้งานได้ใหม่)
 *    - เลือกประเภท: 'Web app' (เว็บแอป)
 *    - Execute as: Me (ฉัน)
 *    - Who has access: Anyone (ทุกคน) **สำคัญมาก ต้องเลือก Anyone**
 * 7. คัดลอก 'Web App URL' (ที่ลงท้ายด้วย /exec)
 * 8. นำ URL ไปใช้งาน 2 ที่:
 *    a) วางในเมนู "ตั้งค่าระบบ" > แท็บ Google Sheets ของระบบปฏิทิน
 *    b) วางใน LINE Developers Console > Messaging API > เมนู "Webhook settings"
 *       - วางในช่อง Webhook URL
 *       - เปิดสวิตช์ "Use Webhook" เป็น ON
 * 9. ตั้งเวลา Trigger (รูปนาฬิกาด้านซ้ายของ Apps Script):
 *    - Function: checkAndSendDueReminders
 *    - Time-driven > Minutes timer > Every 1 minute หรือ Every 5 minutes
 */

// ⚙️ ตั้งค่าความปลอดภัยและ LINE API
const CONFIG = {
  LINE_CHANNEL_ACCESS_TOKEN: 'YOUR_LINE_CHANNEL_ACCESS_TOKEN_HERE',
  DEFAULT_LINE_USER_ID: 'YOUR_LINE_USER_OR_GROUP_ID_HERE',
  SHEET_NAME: 'Tasks',
  MEMBERS_SHEET_NAME: 'LineMembers',
  TIMEZONE: 'Asia/Bangkok',
  APP_URL: 'https://ais-dev-f6dbiiwy3w3yu5bdq7tyax-1077673389760.asia-southeast1.run.app'
};

/**
 * สร้างหัวตารางอัตโนมัติเมื่อเริ่มต้นใช้งาน (Tasks)
 */
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  const headers = [
    'ID', 'Title', 'Description', 'Date', 'Time', 
    'Category', 'Priority', 'Status', 'Assignee', 
    'ReminderMinutes', 'Reminded', 'CreatedAt'
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#2563EB').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * สร้างตารางสมาชิก LINE และกลุ่มที่แอดบอทอัตโนมัติ (LineMembers)
 * ไม่ต้องขอ LINE User ID จากเพื่อนหรือสมาชิกแม้แต่คนเดียว!
 */
function initMembersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.MEMBERS_SHEET_NAME || 'LineMembers');
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.MEMBERS_SHEET_NAME || 'LineMembers');
  }
  const headers = ['LINE_User_ID', 'Display_Name', 'Picture_Url', 'Type', 'Joined_At', 'Last_Active'];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#059669').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * GET Webhook: ดึงข้อมูลงานทั้งหมด หรือดึงรายชื่อเพื่อน LINE จาก Google Sheet
 */
function doGet(e) {
  try {
    // กรณีขอรายชื่อเพื่อนที่แอดบอทแล้ว (LineMembers)
    if (e && e.parameter && e.parameter.action === 'get_members') {
      const memSheet = initMembersSheet();
      const memRows = memSheet.getDataRange().getValues();
      const members = [];
      for (let j = 1; j < memRows.length; j++) {
        const mRow = memRows[j];
        if (!mRow[0]) continue;
        members.push({
          userId: String(mRow[0]),
          displayName: mRow[1] || 'สมาชิก LINE',
          pictureUrl: mRow[2] || '',
          type: mRow[3] || 'user',
          joinedAt: mRow[4] || '',
          lastActive: mRow[5] || ''
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: members }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = initSheet();
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] && !row[1]) continue;
      data.push({
        id: row[0] ? String(row[0]) : ('task-' + i),
        title: row[1] || '',
        description: row[2] || '',
        date: row[3] instanceof Date ? Utilities.formatDate(row[3], CONFIG.TIMEZONE, 'yyyy-MM-dd') : String(row[3] || ''),
        time: row[4] ? String(row[4]) : '',
        categoryId: row[5] || 'work',
        priority: row[6] || 'medium',
        status: row[7] || 'pending',
        assigneeId: row[8] || '',
        reminderMinutesBefore: Number(row[9]) || 15,
        reminded: row[10] === true || row[10] === 'true',
        createdAt: row[11] || new Date().toISOString()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST Webhook: รองรับทั้งคำขอจากระบบปฏิทิน และ Webhook ส่งตรงจาก LINE OA
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const postData = JSON.parse(e.postData.contents);

    // =========================================================================
    // 1. ตรวจจับคำขอที่มาจาก LINE Messaging API Webhook
    // =========================================================================
    if (postData.events && Array.isArray(postData.events)) {
      const sheet = initSheet();
      
      for (let i = 0; i < postData.events.length; i++) {
        const event = postData.events[i];
        
        // ---------------------------------------------------------------------
        // ก) ผู้ใช้กดเพิ่มบอทเป็นเพื่อน (Follow Event) -> บันทึก User ID และชื่อไลน์อัตโนมัติ!
        // ผู้ใช้ไม่ต้องค้นหาหรือบอก LINE User ID เองเลยแม้แต่คนเดียว!
        // ---------------------------------------------------------------------
        if (event.type === 'follow') {
          const followUserId = event.source && event.source.userId;
          if (followUserId) {
            const member = recordOrUpdateLineMember(followUserId, 'user');
            sendLineReplyFollowWelcome(event.replyToken, member.displayName);
          }
          continue;
        }

        // ---------------------------------------------------------------------
        // ข) บอทถูกเชิญเข้ากลุ่ม LINE (Join Event) -> บันทึก Group ID อัตโนมัติ!
        // ---------------------------------------------------------------------
        if (event.type === 'join') {
          const groupId = event.source && (event.source.groupId || event.source.roomId);
          if (groupId) {
            recordOrUpdateLineMember(groupId, 'group');
            sendLineReplyGroupWelcome(event.replyToken);
          }
          continue;
        }

        // ---------------------------------------------------------------------
        // ค) ผู้ใช้พิมพ์ข้อความแชท (Message Event)
        // ---------------------------------------------------------------------
        if (event.type === 'message' && event.message && event.message.type === 'text') {
          const userMessage = event.message.text.trim();
          const replyToken = event.replyToken;
          const senderUserId = (event.source && event.source.userId) ? event.source.userId : CONFIG.DEFAULT_LINE_USER_ID;
          
          // บันทึก/อัปเดตผู้ใช้รายนี้ลงในตาราง LineMembers อัตโนมัติ
          if (event.source && event.source.userId) {
            recordOrUpdateLineMember(event.source.userId, 'user');
          }

          // ตรวจสอบคำสั่งช่วยเหลือ / วิธีใช้
          if (/^(วิธีใช้|ช่วยเหลือ|help|คำสั่ง|คู่มือ)$/i.test(userMessage)) {
            sendLineReplyHelp(replyToken);
            continue;
          }
          
          // ตรวจสอบคำสั่งดูงานวันนี้
          if (/^(ดูงานวันนี้|งานวันนี้|สรุปงาน|schedule)$/i.test(userMessage)) {
            sendLineReplyTodayTasks(sheet, replyToken);
            continue;
          }

          // แปลงข้อความภาษาไทยเป็นข้อมูลงาน
          const parsedTask = parseThaiTaskInAppsScript(userMessage);
          
          // บันทึกลง Google Sheet ทันที
          const taskId = 'line_' + new Date().getTime();
          const newRow = [
            taskId,
            parsedTask.title,
            'บันทึกผ่าน LINE OA แชท: "' + userMessage + '"',
            parsedTask.date,
            parsedTask.time,
            parsedTask.categoryId,
            parsedTask.priority,
            'pending',
            '',
            15,
            'false',
            new Date().toISOString()
          ];
          
          sheet.appendRow(newRow);
          
          // ส่งข้อความตอบกลับยืนยันการบันทึก (Flex Card) ไปยังผู้ใช้ใน LINE ทันที
          sendLineReplySuccess(replyToken, parsedTask, userMessage);
        }
      }
      
      // ส่ง HTTP 200 ให้ LINE เสมอเพื่อยืนยันว่าได้รับ Webhook แล้ว
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 2. คำขอซิงค์งานทั้งหมดจากระบบหน้าเว็บ To Do List Calendar
    // =========================================================================
    const action = postData.action;
    
    if (action === 'sync_all') {
      const sheet = initSheet();
      sheet.clearContents();
      
      const headers = [
        'ID', 'Title', 'Description', 'Date', 'Time', 
        'Category', 'Priority', 'Status', 'Assignee', 
        'ReminderMinutes', 'Reminded', 'CreatedAt'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      
      const tasks = postData.tasks || [];
      if (tasks.length > 0) {
        const rowsToInsert = tasks.map(function(t) {
          return [
            t.id, t.title, t.description || '', t.date, t.time,
            t.categoryId, t.priority, t.status, t.assigneeId || '',
            t.reminderMinutesBefore || 15, t.reminded ? 'true' : 'false', t.createdAt || new Date().toISOString()
          ];
        });
        sheet.getRange(2, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: tasks.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // =========================================================================
    // 3. คำขอส่ง Push แจ้งเตือนจากเซิร์ฟเวอร์
    // =========================================================================
    if (action === 'send_line_push') {
      const task = postData.task;
      const targetUserId = postData.userId || CONFIG.DEFAULT_LINE_USER_ID;
      const result = sendLineReminderMessage(task, targetUserId);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', lineResponse: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * แปลงข้อความภาษาไทยธรรมชาติเป็น วันที่, เวลา, ระดับความสำคัญ, หมวดหมู่ และชื่องาน
 * รองรับ:
 * - "นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน"
 * - "เตือนจ่ายภาษี 25/10/2026 เวลา 14:30 สำคัญมาก"
 * - "นัดหมอ วันศุกร์ 09:00"
 */
function parseThaiTaskInAppsScript(rawText) {
  let text = rawText.trim();
  let workingText = text;
  
  // 1. ระดับความสำคัญ
  let priority = 'medium';
  if (/(ด่วนมาก|ด่วนที่สุด|ด่วน|สำคัญมาก|urgent|high|🔴)/i.test(workingText)) {
    priority = 'high';
    workingText = workingText.replace(/(ด่วนมาก|ด่วนที่สุด|ด่วน|สำคัญมาก|urgent|high|🔴)/gi, ' ');
  } else if (/(สำคัญ|ปานกลาง|medium|🟡)/i.test(workingText)) {
    priority = 'medium';
    workingText = workingText.replace(/(สำคัญ|ปานกลาง|medium|🟡)/gi, ' ');
  } else if (/(ทั่วไป|ไม่ด่วน|ต่ำ|low|🟢)/i.test(workingText)) {
    priority = 'low';
    workingText = workingText.replace(/(ทั่วไป|ไม่ด่วน|ต่ำ|low|🟢)/gi, ' ');
  }

  // 2. หมวดหมู่
  let categoryId = 'work';
  if (/(ภาษี|เงิน|บิล|จ่าย|ค่าไฟ|ค่าน้ำ|โอนเงิน|ธนาคาร|invoice|tax|payment)/i.test(text)) {
    categoryId = 'finance';
  } else if (/(หมอ|ฟิตเนส|ออกกำลัง|ซื้อของ|ซูเปอร์|ตัดผม|บ้าน|ครอบครัว|หาหมอ)/i.test(text)) {
    categoryId = 'personal';
  } else if (/(เรียน|สัมมนา|อบรม|คอร์ส|อ่านหนังสือ|สอบ)/i.test(text)) {
    categoryId = 'education';
  }

  // 3. เวลา (HH:mm)
  let time = '10:00';
  const timeMatch = workingText.match(/(?:เวลา\s*)?([0-2]?[0-9])[:.]([0-5][0-9])\s*(?:น\.|น)?/i);
  if (timeMatch) {
    const hh = String('0' + parseInt(timeMatch[1], 10)).slice(-2);
    const mm = String('0' + parseInt(timeMatch[2], 10)).slice(-2);
    time = hh + ':' + mm;
    workingText = workingText.replace(timeMatch[0], ' ');
  } else {
    if (/บ่ายโมงครึ่ง/i.test(workingText)) { time = '13:30'; workingText = workingText.replace(/บ่ายโมงครึ่ง/i, ' '); }
    else if (/บ่ายสองครึ่ง/i.test(workingText)) { time = '14:30'; workingText = workingText.replace(/บ่ายสองครึ่ง/i, ' '); }
    else if (/บ่ายสามครึ่ง/i.test(workingText)) { time = '15:30'; workingText = workingText.replace(/บ่ายสามครึ่ง/i, ' '); }
    else if (/บ่ายโมง/i.test(workingText)) { time = '13:00'; workingText = workingText.replace(/บ่ายโมง/i, ' '); }
    else if (/บ่ายสอง/i.test(workingText)) { time = '14:00'; workingText = workingText.replace(/บ่ายสอง/i, ' '); }
    else if (/บ่ายสาม/i.test(workingText)) { time = '15:00'; workingText = workingText.replace(/บ่ายสาม/i, ' '); }
    else if (/บ่ายสี่|สี่โมงเย็น/i.test(workingText)) { time = '16:00'; workingText = workingText.replace(/บ่ายสี่|สี่โมงเย็น/i, ' '); }
    else if (/ห้าโมงเย็น/i.test(workingText)) { time = '17:00'; workingText = workingText.replace(/ห้าโมงเย็น/i, ' '); }
    else if (/เที่ยงครึ่ง/i.test(workingText)) { time = '12:30'; workingText = workingText.replace(/เที่ยงครึ่ง/i, ' '); }
    else if (/เที่ยง/i.test(workingText)) { time = '12:00'; workingText = workingText.replace(/เที่ยง/i, ' '); }
    else if (/เก้าโมง/i.test(workingText)) { time = '09:00'; workingText = workingText.replace(/เก้าโมง/i, ' '); }
    else if (/สิบโมง/i.test(workingText)) { time = '10:00'; workingText = workingText.replace(/สิบโมง/i, ' '); }
  }

  // 4. วันที่
  const now = new Date();
  const targetDate = new Date(now.getTime());
  let dateFound = false;

  if (/(?:วัน)?มะรืนนี้/i.test(workingText)) {
    targetDate.setDate(targetDate.getDate() + 2);
    dateFound = true;
    workingText = workingText.replace(/(?:วัน)?มะรืนนี้/i, ' ');
  } else if (/(?:วัน)?พรุ่งนี้/i.test(workingText)) {
    targetDate.setDate(targetDate.getDate() + 1);
    dateFound = true;
    workingText = workingText.replace(/(?:วัน)?พรุ่งนี้/i, ' ');
  } else if (/(?:วัน)?วันนี้/i.test(workingText)) {
    dateFound = true;
    workingText = workingText.replace(/(?:วัน)?วันนี้/i, ' ');
  }

  // วันในสัปดาห์ (วันจันทร์ - วันอาทิตย์)
  if (!dateFound) {
    const days = [
      { name: 'อาทิตย์', day: 0 },
      { name: 'จันทร์', day: 1 },
      { name: 'อังคาร', day: 2 },
      { name: 'พุธ', day: 3 },
      { name: 'พฤหัส', day: 4 },
      { name: 'ศุกร์', day: 5 },
      { name: 'เสาร์', day: 6 }
    ];
    for (let d = 0; d < days.length; d++) {
      const reg = new RegExp('(?:วัน)?' + days[d].name + '(?:นี้|หน้า)?', 'i');
      if (reg.test(workingText)) {
        const curDay = targetDate.getDay();
        let diff = days[d].day - curDay;
        if (diff <= 0) diff += 7;
        targetDate.setDate(targetDate.getDate() + diff);
        dateFound = true;
        workingText = workingText.replace(reg, ' ');
        break;
      }
    }
  }

  // วันที่รูปแบบตัวเลข DD/MM/YYYY หรือ DD/MM
  if (!dateFound) {
    const slashMatch = workingText.match(/(?:วันที่\s*)?([0-3]?[0-9])[\/\-]([0-1]?[0-9])(?:[\/\-]([0-9]{2,4}))?/i);
    if (slashMatch) {
      const d = parseInt(slashMatch[1], 10);
      const m = parseInt(slashMatch[2], 10) - 1;
      let y = now.getFullYear();
      if (slashMatch[3]) {
        let yr = parseInt(slashMatch[3], 10);
        if (yr > 2500) yr -= 543;
        if (yr < 100) yr += 2000;
        y = yr;
      }
      targetDate.setFullYear(y, m, d);
      dateFound = true;
      workingText = workingText.replace(slashMatch[0], ' ');
    }
  }

  const yyyy = targetDate.getFullYear();
  const mm = String('0' + (targetDate.getMonth() + 1)).slice(-2);
  const dd = String('0' + targetDate.getDate()).slice(-2);
  const dateStr = yyyy + '-' + mm + '-' + dd;

  // 5. ตัดคำรกรุงรังออกจากชื่อเรื่อง
  let cleanTitle = workingText
    .replace(/^[\s\+\*\-\#\!]+/, '')
    .replace(/(?:ช่วย)?(?:เตือน|นัดหมาย|จดบันทึก|บันทึก|เพิ่มงาน|สร้างงาน|นัด)\s*(?:เรื่อง|ว่า)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = text.slice(0, 40).trim();
  }

  return {
    title: cleanTitle,
    date: dateStr,
    time: time,
    priority: priority,
    categoryId: categoryId
  };
}

/**
 * ส่ง Flex Message ตอบกลับผู้ใช้ใน LINE ยืนยันการบันทึกงานสำเร็จ
 */
function sendLineReplySuccess(replyToken, task, rawMessage) {
  const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || token.indexOf('YOUR_') === 0) return;

  const priorityThai = task.priority === 'high' ? '🔴 ด่วนมาก' : task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ทั่วไป';
  const categoryThai = task.categoryId === 'finance' ? '💰 การเงิน' : task.categoryId === 'personal' ? '👤 ส่วนตัว' : task.categoryId === 'education' ? '🎓 การเรียน' : '💼 งาน';

  const flexBubble = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#0F172A',
      paddingAll: '16px',
      contents: [
        {
          type: 'text',
          text: '✓ บันทึกลงปฏิทินสำเร็จ',
          color: '#34D399',
          weight: 'bold',
          size: 'xs'
        },
        {
          type: 'text',
          text: task.title,
          color: '#ffffff',
          weight: 'bold',
          size: 'lg',
          wrap: true,
          margin: 'xs'
        }
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      spacing: 'md',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          backgroundColor: '#F8FAFC',
          cornerRadius: '12px',
          paddingAll: '12px',
          borderColor: '#E2E8F0',
          borderWidth: '1px',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              flex: 1,
              contents: [
                { type: 'text', text: '📅 วันที่', size: 'xxs', color: '#64748B', weight: 'bold' },
                { type: 'text', text: task.date, size: 'xs', color: '#0F172A', weight: 'bold', margin: 'xs' }
              ]
            },
            {
              type: 'box',
              layout: 'vertical',
              flex: 1,
              contents: [
                { type: 'text', text: '🕒 เวลาเริ่ม', size: 'xxs', color: '#64748B', weight: 'bold' },
                { type: 'text', text: task.time + ' น.', size: 'sm', color: '#2563EB', weight: 'bold', margin: 'xs' }
              ]
            }
          ]
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            { type: 'text', text: '⭐ ความสำคัญ:', size: 'xs', color: '#64748B', flex: 2 },
            { type: 'text', text: priorityThai, size: 'xs', color: '#0F172A', weight: 'bold', flex: 3 }
          ]
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            { type: 'text', text: '📁 หมวดหมู่:', size: 'xs', color: '#64748B', flex: 2 },
            { type: 'text', text: categoryThai, size: 'xs', color: '#0F172A', flex: 3 }
          ]
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#0F172A',
          action: {
            type: 'uri',
            label: 'เปิดดูในปฏิทินระบบ',
            uri: CONFIG.APP_URL
          }
        }
      ]
    }
  };

  const payload = {
    replyToken: replyToken,
    messages: [
      {
        type: 'flex',
        altText: '✅ บันทึกลงปฏิทินแล้ว: ' + task.title,
        contents: flexBubble
      }
    ]
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * ส่งข้อความวิธีใช้งานและรูปแบบคำสั่งกลับไปใน LINE
 */
function sendLineReplyHelp(replyToken) {
  const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || token.indexOf('YOUR_') === 0) return;

  const helpText = 
    '📌 วิธีพิมพ์บันทึกนัดหมายลงปฏิทินผ่าน LINE:\\n\\n' +
    'พิมพ์เป็นภาษาไทยธรรมชาติได้เลย เช่น:\\n' +
    '• นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน\\n' +
    '• เตือนจ่ายภาษี 25/10/2026 เวลา 14:30 สำคัญ\\n' +
    '• นัดพบลูกค้า วันศุกร์ 14:00\\n' +
    '• กินยาวันนี้ 12:30 ทั่วไป\\n\\n' +
    'คำสั่งอื่นๆ:\\n' +
    '• "ดูงานวันนี้" เพื่อดูรายการนัดหมายทั้งหมดของวันนี้';

  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: helpText }]
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * ส่งรายการงานของวันนี้กลับไปยังผู้ใช้
 */
function sendLineReplyTodayTasks(sheet, replyToken) {
  const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || token.indexOf('YOUR_') === 0) return;

  const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const rows = sheet.getDataRange().getValues();
  const todayTasks = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateVal = row[3] instanceof Date ? Utilities.formatDate(row[3], CONFIG.TIMEZONE, 'yyyy-MM-dd') : String(row[3]);
    if (dateVal === todayStr) {
      todayTasks.push({
        title: row[1],
        time: String(row[4] || '10:00'),
        priority: row[6],
        status: row[7]
      });
    }
  }

  let text = '☀️ สรุปตารางงานวันนี้ (' + todayStr + '):\\n';
  if (todayTasks.length === 0) {
    text += '🎉 วันนี้ไม่มีรายการงานค้าง ขอให้เป็นวันที่ราบรื่นครับ!';
  } else {
    for (let j = 0; j < todayTasks.length; j++) {
      const t = todayTasks[j];
      const pIcon = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
      const check = t.status === 'completed' ? '✓ ' : '';
      text += '\\n' + (j + 1) + '. ' + pIcon + ' [' + t.time + ' น.] ' + check + t.title;
    }
  }

  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: text }]
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * ส่งข้อความ Flex Message แจ้งเตือนเข้า LINE OA เมื่อถึงเวลานัดหมาย
 */
function sendLineReminderMessage(task, lineUserId) {
  const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || token.indexOf('YOUR_') === 0) {
    Logger.log('LINE Channel Access Token not configured');
    return { error: 'Token not set' };
  }
  
  const priorityThai = task.priority === 'high' ? '🔴 สูง' : task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ต่ำ';
  
  const flexPayload = {
    to: lineUserId,
    messages: [
      {
        type: 'flex',
        altText: '🔔 แจ้งเตือนงาน: ' + task.title,
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#0F172A',
            paddingAll: '16px',
            contents: [
              {
                type: 'text',
                text: '🔔 LINE REMINDER',
                color: '#34D399',
                weight: 'bold',
                size: 'xs'
              },
              {
                type: 'text',
                text: 'เตือนงานใกล้ถึงเวลา!',
                color: '#ffffff',
                weight: 'bold',
                size: 'lg',
                margin: 'xs'
              }
            ]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '16px',
            spacing: 'md',
            contents: [
              {
                type: 'text',
                text: task.title,
                weight: 'bold',
                size: 'lg',
                color: '#0F172A',
                wrap: true
              },
              {
                type: 'box',
                layout: 'horizontal',
                backgroundColor: '#F8FAFC',
                cornerRadius: '12px',
                paddingAll: '12px',
                borderColor: '#E2E8F0',
                borderWidth: '1px',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    contents: [
                      { type: 'text', text: '📅 วันที่', size: 'xxs', color: '#64748B', weight: 'bold' },
                      { type: 'text', text: task.date, size: 'xs', color: '#0F172A', weight: 'bold', margin: 'xs' }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    contents: [
                      { type: 'text', text: '🕒 เวลานัดหมาย', size: 'xxs', color: '#64748B', weight: 'bold' },
                      { type: 'text', text: task.time + ' น.', size: 'sm', color: '#2563EB', weight: 'bold', margin: 'xs' }
                    ]
                  }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '⭐ ความสำคัญ:', size: 'xs', color: '#64748B', flex: 2 },
                  { type: 'text', text: priorityThai, size: 'xs', color: '#0F172A', weight: 'bold', flex: 3 }
                ]
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            paddingAll: '16px',
            contents: [
              {
                type: 'button',
                style: 'primary',
                color: '#0F172A',
                action: {
                  type: 'uri',
                  label: 'เปิดดูงานในระบบ',
                  uri: CONFIG.APP_URL
                }
              }
            ]
          }
        }
      }
    ]
  };

  const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(flexPayload),
    muteHttpExceptions: true
  });
  
  return response.getContentText();
}

/**
 * ฟังก์ชันสำหรับตั้งเวลา Trigger อัตโนมัติ (เช่น ทุกๆ 1 หรือ 5 นาที)
 * ตรวจสอบงานที่ถึงเวลาเตือน แล้วส่งข้อความเข้า LINE ทันที
 */
function checkAndSendDueReminders() {
  const sheet = initSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return;
  
  const now = new Date();
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const isCompleted = row[7] === 'completed';
    const alreadyReminded = row[10] === true || row[10] === 'true';
    
    if (isCompleted || alreadyReminded) continue;
    
    const dateVal = row[3] instanceof Date ? Utilities.formatDate(row[3], CONFIG.TIMEZONE, 'yyyy-MM-dd') : String(row[3]);
    const timeVal = String(row[4] || '10:00');
    const reminderMinutes = Number(row[9]) || 15;
    
    const taskTime = new Date(dateVal + 'T' + timeVal + ':00');
    const triggerTime = new Date(taskTime.getTime() - reminderMinutes * 60 * 1000);
    
    // ถ้าถึงเวลาเตือนแล้วและยังไม่เลยเกิน 2 ชั่วโมง
    if (now >= triggerTime && (now.getTime() - triggerTime.getTime()) < 2 * 60 * 60 * 1000) {
      const task = {
        title: row[1],
        date: dateVal,
        time: timeVal,
        categoryId: row[5],
        priority: row[6]
      };
      sendLineReminderMessage(task, CONFIG.DEFAULT_LINE_USER_ID);
      sheet.getRange(i + 1, 11).setValue('true'); // ทำเครื่องหมายว่า Reminded แล้ว
    }
  }
}

/**
 * ดึงข้อมูลโปรไฟล์ของเพื่อน LINE ผ่าน Messaging API
 */
function getLineUserProfile(userId) {
  try {
    const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token || token.indexOf('YOUR_') === 0) {
      return { displayName: 'เพื่อนใน LINE', pictureUrl: '' };
    }
    const url = 'https://api.line.me/v2/bot/profile/' + encodeURIComponent(userId);
    const options = {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return {
        displayName: data.displayName || 'เพื่อนใน LINE',
        pictureUrl: data.pictureUrl || ''
      };
    }
  } catch (e) {
    Logger.log('getLineUserProfile error: ' + e);
  }
  return { displayName: 'เพื่อนใน LINE', pictureUrl: '' };
}

/**
 * บันทึกหรืออัปเดตสมาชิก LINE (คนแอดบอท หรือดึงบอทเข้ากลุ่ม) ลงในชีต LineMembers
 * ผู้ใช้ไม่ต้องค้นหาหรือระบุ User ID เองเลยแม้แต่คนเดียว!
 */
function recordOrUpdateLineMember(id, type) {
  try {
    const sheet = initMembersSheet();
    const rows = sheet.getDataRange().getValues();
    const nowStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
    
    let profile = { displayName: type === 'group' ? 'กลุ่มงาน LINE' : 'สมาชิกใน LINE', pictureUrl: '' };
    if (type !== 'group' && id && id.indexOf('U') === 0) {
      profile = getLineUserProfile(id);
    }
    
    // ตรวจสอบว่ามีบันทึก ID นี้อยู่แล้วหรือไม่
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) {
        if (profile.displayName && profile.displayName !== 'เพื่อนใน LINE') {
          sheet.getRange(i + 1, 2).setValue(profile.displayName);
        }
        if (profile.pictureUrl) {
          sheet.getRange(i + 1, 3).setValue(profile.pictureUrl);
        }
        sheet.getRange(i + 1, 6).setValue(nowStr);
        return { userId: id, displayName: rows[i][1] || profile.displayName, pictureUrl: profile.pictureUrl, type: type };
      }
    }
    
    // เพิ่มแถวสมาชิกใหม่
    sheet.appendRow([id, profile.displayName, profile.pictureUrl, type, nowStr, nowStr]);
    return { userId: id, displayName: profile.displayName, pictureUrl: profile.pictureUrl, type: type };
  } catch (err) {
    Logger.log('recordOrUpdateLineMember error: ' + err);
    return { userId: id, displayName: 'เพื่อนใน LINE', type: type };
  }
}

/**
 * ตอบกลับต้อนรับเมื่อผู้ใช้เพิ่มเพื่อน (Follow Welcome)
 */
function sendLineReplyFollowWelcome(replyToken, displayName) {
  const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || token.indexOf('YOUR_') === 0) return;

  const welcomeText = 
    'สวัสดีครับคุณ ' + (displayName || 'เพื่อนใหม่') + '! 🎉\\n\\n' +
    'ยินดีต้อนรับสู่ระบบปฏิทินงานอัจฉริยะ ✨\\n' +
    'ระบบได้บันทึกเชื่อมต่อบัญชี LINE ของคุณเรียบร้อยแล้ว (คุณไม่ต้องค้นหาหรือจำ User ID เองเลยครับ)\\n\\n' +
    'คุณสามารถ:\\n' +
    '• พิมพ์นัดหมายได้ทันที เช่น "นัดประชุม พรุ่งนี้ 10:00 ด่วน"\\n' +
    '• ตรวจดูงานวันนี้ เพียงพิมพ์ "ดูงานวันนี้"\\n' +
    '• รอรับการแจ้งเตือนเมื่อมีงานที่มอบหมายให้คุณ';

  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: welcomeText }]
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * ตอบกลับต้อนรับเมื่อบอทเข้าร่วมกลุ่ม LINE (Group Join Welcome)
 */
function sendLineReplyGroupWelcome(replyToken) {
  const token = CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || token.indexOf('YOUR_') === 0) return;

  const welcomeText = 
    'สวัสดีครับทุกคนในกลุ่ม! 🤖\\n\\n' +
    'น้องเลขาเข้าร่วมกลุ่มเรียบร้อยแล้วครับ\\n' +
    'ระบบได้บันทึก Group ID ของกลุ่มนี้ให้อัตโนมัติแล้ว\\n\\n' +
    'ตั้งแต่นี้ ทุกการแจ้งเตือนงานหรือสรุปงานที่มอบหมายให้กลุ่มนี้ จะส่งตรงมายังห้องแชทนี้ให้ทุกคนทราบพร้อมกันครับ ✨';

  const payload = {
    replyToken: replyToken,
    messages: [{ type: 'text', text: welcomeText }]
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
`;

/**
 * Downloads a string content as file in browser with UTF-8 support
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain') {
  // Add UTF-8 BOM if file is CSV to prevent Thai font mojibake in Microsoft Excel
  const isCsv = filename.endsWith('.csv') || mimeType.includes('csv');
  const finalContent = isCsv && !content.startsWith('\uFEFF') ? '\uFEFF' + content : content;
  
  const blob = new Blob([finalContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export tasks array to CSV format with UTF-8 BOM and Thai localized labels
 */
export function exportTasksToCsv(tasks: any[], categories: any[] = [], users: any[] = []): string {
  const headers = [
    'ID งาน',
    'ชื่องาน',
    'รายละเอียด',
    'วันที่ (YYYY-MM-DD)',
    'เวลา (HH:mm)',
    'หมวดหมู่',
    'ความสำคัญ',
    'สถานะ',
    'ผู้รับผิดชอบ',
    'เตือนล่วงหน้า (นาที)',
    'สถานะการเตือน',
    'วันที่สร้าง'
  ];

  const rows = tasks.map(t => {
    // Lookup human readable names
    const cat = categories.find(c => c.id === t.categoryId);
    const categoryName = cat ? cat.name : (t.categoryId || 'ทั่วไป');
    
    const user = users.find(u => u.id === t.assigneeId);
    const assigneeName = user ? user.name : (t.assigneeId || '-');

    const priorityLabel = 
      t.priority === 'high' ? 'สูง (High)' : 
      t.priority === 'medium' ? 'ปานกลาง (Medium)' : 'ต่ำ (Low)';

    const statusLabel = 
      t.status === 'completed' ? 'เสร็จสิ้น' : 
      t.status === 'in_progress' ? 'กำลังทำ' : 'รอดำเนินการ';

    const reminderLabel = t.reminded ? 'เตือนแล้ว' : 'ยังไม่ได้เตือน';

    return [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.date}"`,
      `"${t.time} น."`,
      `"${categoryName}"`,
      `"${priorityLabel}"`,
      `"${statusLabel}"`,
      `"${assigneeName}"`,
      `"${t.reminderMinutesBefore || 0}"`,
      `"${reminderLabel}"`,
      `"${t.createdAt || ''}"`,
    ];
  });

  // Prepend UTF-8 BOM (\uFEFF) explicitly so Microsoft Excel opens Thai perfectly without garbled text
  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}
