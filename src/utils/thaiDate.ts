export const THAI_MONTHS_FULL = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
export const THAI_DAYS_FULL = [
  'วันอาทิตย์',
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
];

/**
 * Converts Western Year (CE) to Buddhist Era (BE, พ.ศ.)
 */
export function toBuddhistYear(year: number): number {
  return year + 543;
}

/**
 * Formats a Date object or YYYY-MM-DD string to full Thai date string
 * Example: "21 มิถุนายน 2568"
 */
export function formatThaiDate(dateInput: Date | string, options?: { showDayName?: boolean; shortMonth?: boolean }): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(date.getTime())) return dateInput.toString();

  const dayName = options?.showDayName ? `${THAI_DAYS_FULL[date.getDay()]}ที่ ` : '';
  const day = date.getDate();
  const monthList = options?.shortMonth ? THAI_MONTHS_SHORT : THAI_MONTHS_FULL;
  const month = monthList[date.getMonth()];
  const buddhistYear = toBuddhistYear(date.getFullYear());

  return `${dayName}${day} ${month} ${buddhistYear}`;
}

/**
 * Formats YYYY-MM-DD and HH:mm to Thai short date/time
 * Example: "21 มิ.ย. 2568 เวลา 07:15 น."
 */
export function formatThaiDateTime(dateStr: string, timeStr?: string): string {
  const shortDate = formatThaiDate(dateStr, { shortMonth: true });
  if (timeStr) {
    return `${shortDate} เวลา ${timeStr} น.`;
  }
  return shortDate;
}

/**
 * Formats current date for dashboard title
 * Example: "21 มิถุนายน 2568"
 */
export function formatThaiMonthYear(year: number, monthZeroIndexed: number): string {
  return `${THAI_MONTHS_FULL[monthZeroIndexed]} ${toBuddhistYear(year)}`;
}

/**
 * Returns today's ISO date string YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
