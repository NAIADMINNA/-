import { Priority } from '../types';
import { THAI_MONTHS_SHORT, THAI_MONTHS_FULL } from './thaiDate';

export interface ParsedThaiTask {
  title: string;
  originalText: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  priority: Priority;
  categoryId: string;
  confidence: 'high' | 'medium' | 'low';
  parsedSummary: string;
}

/**
 * Parses Thai natural language chat messages to extract task details:
 * e.g. "นัดประชุมทีม พรุ่งนี้ 10:00 ด่วน"
 *      "เตือน จ่ายค่าภาษี วันที่ 25/10/2026 เวลา 14:30 สำคัญมาก"
 *      "+ นัดหมอ ศุกร์นี้ 09:30"
 *      "ส่งงานลูกค้า วันนี้ 16:00 ด่วนที่สุด"
 */
export function parseThaiTask(rawText: string, baseDate = new Date()): ParsedThaiTask {
  const text = rawText.trim();
  let workingText = text;

  // 1. Determine Priority
  let priority: Priority = 'medium';
  const highPriorityRegex = /(ด่วนมาก|ด่วนที่สุด|ด่วน|สำคัญมาก|สำคัญยิ่ง|urgent|high|asap|🔴)/i;
  const mediumPriorityRegex = /(สำคัญ|ปานกลาง|ระดับกลาง|medium|🟡)/i;
  const lowPriorityRegex = /(ทั่วไป|ไม่ด่วน|เรื่อยๆ|ต่ำ|low|🟢)/i;

  if (highPriorityRegex.test(workingText)) {
    priority = 'high';
    workingText = workingText.replace(highPriorityRegex, ' ');
  } else if (mediumPriorityRegex.test(workingText)) {
    priority = 'medium';
    workingText = workingText.replace(mediumPriorityRegex, ' ');
  } else if (lowPriorityRegex.test(workingText)) {
    priority = 'low';
    workingText = workingText.replace(lowPriorityRegex, ' ');
  }

  // 2. Determine Category
  let categoryId = 'work';
  const financeRegex = /(ภาษี|เงิน|บิล|จ่าย|ค่าไฟ|ค่าน้ำ|โอนเงิน|ธนาคาร|invoice|tax|payment|เงินเดือน)/i;
  const personalRegex = /(หมอ|ฟิตเนส|ออกกำลังกาย|ซื้อของ|ซูเปอร์|ตัดผม|บ้าน|ครอบครัว|ดูหนัง|กินข้าว)/i;
  const educationRegex = /(เรียน|สัมมนา|อบรม|คอร์ส|อ่านหนังสือ|สอบ|วิจัย)/i;

  if (financeRegex.test(text)) {
    categoryId = 'finance';
  } else if (personalRegex.test(text)) {
    categoryId = 'personal';
  } else if (educationRegex.test(text)) {
    categoryId = 'education';
  }

  // 3. Determine Time (HH:mm)
  let time = '10:00'; // Default 10:00 AM
  let timeFound = false;

  // Match 14:30, 14.30, 09:00, 9:00น., 14:30 น.
  const timeRegex = /(?:เวลา\s*)?([0-2]?[0-9])[:.]([0-5][0-9])\s*(?:น\.|น)?/i;
  const timeMatch = workingText.match(timeRegex);

  if (timeMatch) {
    const hours = String(parseInt(timeMatch[1], 10)).padStart(2, '0');
    const minutes = String(parseInt(timeMatch[2], 10)).padStart(2, '0');
    time = `${hours}:${minutes}`;
    timeFound = true;
    workingText = workingText.replace(timeMatch[0], ' ');
  } else {
    // Thai natural time words
    if (/บ่ายโมงครึ่ง|13:30/i.test(workingText)) {
      time = '13:30';
      timeFound = true;
      workingText = workingText.replace(/บ่ายโมงครึ่ง/i, ' ');
    } else if (/บ่ายสองครึ่ง|14:30/i.test(workingText)) {
      time = '14:30';
      timeFound = true;
      workingText = workingText.replace(/บ่ายสองครึ่ง/i, ' ');
    } else if (/บ่ายสามครึ่ง|15:30/i.test(workingText)) {
      time = '15:30';
      timeFound = true;
      workingText = workingText.replace(/บ่ายสามครึ่ง/i, ' ');
    } else if (/บ่ายโมง/i.test(workingText)) {
      time = '13:00';
      timeFound = true;
      workingText = workingText.replace(/บ่ายโมง/i, ' ');
    } else if (/บ่ายสอง/i.test(workingText)) {
      time = '14:00';
      timeFound = true;
      workingText = workingText.replace(/บ่ายสอง/i, ' ');
    } else if (/บ่ายสาม/i.test(workingText)) {
      time = '15:00';
      timeFound = true;
      workingText = workingText.replace(/บ่ายสาม/i, ' ');
    } else if (/บ่ายสี่|สี่โมงเย็น/i.test(workingText)) {
      time = '16:00';
      timeFound = true;
      workingText = workingText.replace(/บ่ายสี่|สี่โมงเย็น/i, ' ');
    } else if (/ห้าโมงเย็น/i.test(workingText)) {
      time = '17:00';
      timeFound = true;
      workingText = workingText.replace(/ห้าโมงเย็น/i, ' ');
    } else if (/เที่ยงครึ่ง/i.test(workingText)) {
      time = '12:30';
      timeFound = true;
      workingText = workingText.replace(/เที่ยงครึ่ง/i, ' ');
    } else if (/เที่ยง|ตอนเที่ยง/i.test(workingText)) {
      time = '12:00';
      timeFound = true;
      workingText = workingText.replace(/เที่ยง|ตอนเที่ยง/i, ' ');
    } else if (/เก้าโมงเช้า|9 โมง/i.test(workingText)) {
      time = '09:00';
      timeFound = true;
      workingText = workingText.replace(/เก้าโมงเช้า|9 โมง/i, ' ');
    } else if (/สิบโมงเช้า|10 โมง/i.test(workingText)) {
      time = '10:00';
      timeFound = true;
      workingText = workingText.replace(/สิบโมงเช้า|10 โมง/i, ' ');
    } else if (/สิบเอ็ดโมง|11 โมง/i.test(workingText)) {
      time = '11:00';
      timeFound = true;
      workingText = workingText.replace(/สิบเอ็ดโมง|11 โมง/i, ' ');
    }
  }

  // 4. Determine Date (YYYY-MM-DD)
  const targetDate = new Date(baseDate.getTime());
  let dateFound = false;

  // Relative dates
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

  // Day of week e.g. วันจันทร์, วันศุกร์, ศุกร์นี้
  if (!dateFound) {
    const daysMap: { [key: string]: number } = {
      'อาทิตย์': 0, 'จันทร์': 1, 'อังคาร': 2, 'พุธ': 3, 'พฤหัสบดี': 4, 'พฤหัส': 4, 'ศุกร์': 5, 'เสาร์': 6
    };
    for (const [dayName, dayIndex] of Object.entries(daysMap)) {
      const reg = new RegExp(`(?:วัน)?${dayName}(?:นี้|หน้า)?`, 'i');
      if (reg.test(workingText)) {
        const currentDay = targetDate.getDay();
        let diff = dayIndex - currentDay;
        if (diff <= 0) diff += 7; // Next occurrence
        targetDate.setDate(targetDate.getDate() + diff);
        dateFound = true;
        workingText = workingText.replace(reg, ' ');
        break;
      }
    }
  }

  // Exact dates: DD/MM/YYYY or DD/MM
  if (!dateFound) {
    const slashDateRegex = /(?:วันที่\s*)?([0-3]?[0-9])[\/\-]([0-1]?[0-9])(?:[\/\-]([0-9]{2,4}))?/i;
    const slashMatch = workingText.match(slashDateRegex);
    if (slashMatch) {
      const d = parseInt(slashMatch[1], 10);
      const m = parseInt(slashMatch[2], 10) - 1;
      let y = baseDate.getFullYear();
      if (slashMatch[3]) {
        let yr = parseInt(slashMatch[3], 10);
        if (yr > 2500) yr -= 543; // Buddhist Era
        if (yr < 100) yr += 2000;
        y = yr;
      }
      targetDate.setFullYear(y, m, d);
      dateFound = true;
      workingText = workingText.replace(slashMatch[0], ' ');
    }
  }

  // Thai Month words: 24 ต.ค., 25 ตุลาคม
  if (!dateFound) {
    for (let m = 0; m < 12; m++) {
      const shortM = THAI_MONTHS_SHORT[m];
      const fullM = THAI_MONTHS_FULL[m];
      const monthRegex = new RegExp(`(?:วันที่\\s*)?([0-3]?[0-9])\\s*(?:${fullM}|${shortM.replace('.', '\\.')})(?:\\s*([0-9]{2,4}))?`, 'i');
      const mMatch = workingText.match(monthRegex);
      if (mMatch) {
        const d = parseInt(mMatch[1], 10);
        let y = baseDate.getFullYear();
        if (mMatch[2]) {
          let yr = parseInt(mMatch[2], 10);
          if (yr > 2500) yr -= 543;
          if (yr < 100) yr += 2000;
          y = yr;
        }
        targetDate.setFullYear(y, m, d);
        dateFound = true;
        workingText = workingText.replace(mMatch[0], ' ');
        break;
      }
    }
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // 5. Clean Title
  let cleanTitle = workingText
    .replace(/^[\s\+\*\-\#\!]+/, '') // Leading symbols like + or #
    .replace(/(?:ช่วย)?(?:เตือน|นัดหมาย|จดบันทึก|บันทึก|เพิ่มงาน|สร้างงาน|นัด)\s*(?:เรื่อง|ว่า)?/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If title was stripped too much or empty, recover gracefully
  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = text.slice(0, 50).trim();
  }

  const confidence = (dateFound && timeFound) ? 'high' : (dateFound || timeFound) ? 'medium' : 'low';
  const priorityThai = priority === 'high' ? '🔴 ด่วนมาก' : priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ทั่วไป';

  return {
    title: cleanTitle,
    originalText: text,
    date: dateStr,
    time: time,
    priority,
    categoryId,
    confidence,
    parsedSummary: `${cleanTitle} (${dateStr} เวลา ${time} น. • ${priorityThai})`
  };
}
