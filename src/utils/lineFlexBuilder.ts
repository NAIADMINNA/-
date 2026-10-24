import { Task, Category, UserAssignee } from '../types';
import { formatThaiDate } from './thaiDate';

export type LineThemeId = 
  | 'executive-slate'
  | 'apple-modern' 
  | 'vibrant-emerald' 
  | 'sunset-coral' 
  | 'champagne-gold'
  | 'category-color';

export interface LineThemeConfig {
  id: LineThemeId;
  name: string;
  description: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  buttonColor: string;
  timeHighlightColor: string;
  previewGradient: string;
}

export const LINE_THEMES: Record<LineThemeId, LineThemeConfig> = {
  'executive-slate': {
    id: 'executive-slate',
    name: 'Executive Slate (มิดไนท์ หรูหรา สะอาดตา)',
    description: 'โทนสีเทาดำลักชัวรี สไตล์โปรแกรมระดับพรีเมียม ตัดขอบด้วยสีมินต์คมชัด',
    headerBg: '#0F172A',
    headerText: '#FFFFFF',
    badgeBg: '#1E293B',
    badgeText: '#34D399',
    accentColor: '#10B981',
    buttonColor: '#0F172A',
    timeHighlightColor: '#2563EB',
    previewGradient: 'from-[#0F172A] to-[#1E293B]',
  },
  'apple-modern': {
    id: 'apple-modern',
    name: 'Apple Modern (พรีเมียม สไตล์แอปเปิ้ล)',
    description: 'โทนสี Indigo ลุ่มลึก ดีไซน์เรียบหรู คมชัด สไตล์ Apple iOS',
    headerBg: '#1E1B4B',
    headerText: '#FFFFFF',
    badgeBg: '#312E81',
    badgeText: '#A5B4FC',
    accentColor: '#2563EB',
    buttonColor: '#2563EB',
    timeHighlightColor: '#2563EB',
    previewGradient: 'from-[#1E1B4B] to-[#312E81]',
  },
  'vibrant-emerald': {
    id: 'vibrant-emerald',
    name: 'Vibrant Emerald (เขียว LINE พรีเมียม)',
    description: 'โทนสีเขียว LINE OA สดใส โดดเด่น มองเห็นง่าย สบายตา',
    headerBg: '#00B900',
    headerText: '#FFFFFF',
    badgeBg: '#059669',
    badgeText: '#D1FAE5',
    accentColor: '#059669',
    buttonColor: '#00B900',
    timeHighlightColor: '#059669',
    previewGradient: 'from-[#00B900] to-[#059669]',
  },
  'sunset-coral': {
    id: 'sunset-coral',
    name: 'Sunset Luxury (ม่วง-เบอร์รี่ หรูหรา)',
    description: 'โทนสีม่วงตัดส้มคอรัล สวยงามทันสมัย สำหรับแจ้งเตือนที่น่าตื่นเต้น',
    headerBg: '#831843',
    headerText: '#FFFFFF',
    badgeBg: '#9D174D',
    badgeText: '#FCE7F3',
    accentColor: '#BE185D',
    buttonColor: '#9D174D',
    timeHighlightColor: '#BE185D',
    previewGradient: 'from-[#831843] to-[#9D174D]',
  },
  'champagne-gold': {
    id: 'champagne-gold',
    name: 'Champagne Gold (แชมเปญทอง อบอุ่น สง่างาม)',
    description: 'โทนสีทองอำพันคลาสสิก เหมาะสำหรับผู้บริหารและการนัดหมายระดับสูง',
    headerBg: '#78350F',
    headerText: '#FFFFFF',
    badgeBg: '#92400E',
    badgeText: '#FEF3C7',
    accentColor: '#D97706',
    buttonColor: '#92400E',
    timeHighlightColor: '#D97706',
    previewGradient: 'from-[#78350F] to-[#92400E]',
  },
  'category-color': {
    id: 'category-color',
    name: 'Dynamic Category (เปลี่ยนสีตามหมวดหมู่งาน)',
    description: 'สีการ์ดจะเปลี่ยนอัตโนมัติตามสีของหมวดหมู่แต่ละงาน เพื่อแยกประเภทชัดเจน',
    headerBg: '#0284C7',
    headerText: '#FFFFFF',
    badgeBg: '#0369A1',
    badgeText: '#BAE6FD',
    accentColor: '#0284C7',
    buttonColor: '#0284C7',
    timeHighlightColor: '#0284C7',
    previewGradient: 'from-[#0284C7] to-[#0369A1]',
  },
};

/**
 * Builds an official LINE Flex Message bubble object with premier typography and layout
 */
export function buildLineFlexBubble({
  task,
  category,
  assignee,
  themeId = 'executive-slate',
  appUrl = 'https://ais-dev-f6dbiiwy3w3yu5bdq7tyax-1077673389760.asia-southeast1.run.app',
}: {
  task: Task;
  category?: Category;
  assignee?: UserAssignee;
  themeId?: LineThemeId;
  appUrl?: string;
}) {
  let theme = LINE_THEMES[themeId] || LINE_THEMES['executive-slate'];

  // If theme is dynamic category color, adapt to category color
  let headerBg = theme.headerBg;
  let buttonColor = theme.buttonColor;
  let accentColor = theme.accentColor;

  if (themeId === 'category-color' && category?.color) {
    headerBg = category.color;
    buttonColor = category.color;
    accentColor = category.color;
  }

  const thaiDateFormatted = formatThaiDate(task.date, { shortMonth: false });
  const shortDate = formatThaiDate(task.date, { shortMonth: true });
  
  // Priority styling
  let priorityLabel = '🟢 ทั่วไป';
  let priorityBg = '#F0FDF4';
  let priorityColor = '#15803D';
  if (task.priority === 'high') {
    priorityLabel = '🔴 ด่วนมาก';
    priorityBg = '#FEF2F2';
    priorityColor = '#B91C1C';
  } else if (task.priority === 'medium') {
    priorityLabel = '🟡 ปานกลาง';
    priorityBg = '#FFFBEB';
    priorityColor = '#B45309';
  }

  const categoryName = category?.name || task.categoryId || 'งานทั่วไป';

  return {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: headerBg,
      paddingAll: '18px',
      paddingBottom: '16px',
      contents: [
        // Subheader pill row
        {
          type: 'box',
          layout: 'horizontal',
          alignItems: 'center',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#FFFFFF22',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                {
                  type: 'text',
                  text: '🔔 เตือนงานใกล้ถึงเวลา',
                  size: 'xxs',
                  color: '#FFFFFF',
                  weight: 'bold',
                },
              ],
            },
            {
              type: 'filler',
            },
            {
              type: 'text',
              text: task.reminderMinutesBefore > 0 
                ? `เตือนก่อน ${task.reminderMinutesBefore} นาที`
                : 'เตือนเมื่อถึงเวลา',
              size: 'xxs',
              color: '#FFFFFFCC',
              weight: 'bold',
            },
          ],
        },
        // Main Title
        {
          type: 'text',
          text: task.title,
          weight: 'bold',
          size: 'lg',
          color: '#FFFFFF',
          wrap: true,
          margin: 'md',
        },
        // Subtitle reminder badge
        {
          type: 'text',
          text: '⏰ ถึงกำหนดเวลาตามปฏิทินแล้วครับ',
          size: 'xs',
          color: '#FFFFFFDD',
          margin: 'xs',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      spacing: 'md',
      backgroundColor: '#FFFFFF',
      contents: [
        // Highlight Box: Date and Time
        {
          type: 'box',
          layout: 'horizontal',
          backgroundColor: '#F8FAFC',
          cornerRadius: '14px',
          paddingAll: '12px',
          contents: [
            // Left: Date
            {
              type: 'box',
              layout: 'vertical',
              flex: 3,
              contents: [
                {
                  type: 'text',
                  text: '📅 วันที่นัดหมาย',
                  size: 'xxs',
                  color: '#64748B',
                  weight: 'bold',
                },
                {
                  type: 'text',
                  text: shortDate,
                  size: 'xs',
                  weight: 'bold',
                  color: '#0F172A',
                  margin: 'xs',
                },
              ],
            },
            // Divider
            {
              type: 'box',
              layout: 'vertical',
              width: '1px',
              backgroundColor: '#E2E8F0',
              margin: 'sm',
            },
            // Right: Time
            {
              type: 'box',
              layout: 'vertical',
              flex: 2,
              alignItems: 'flex-end',
              contents: [
                {
                  type: 'text',
                  text: '🕒 เวลา',
                  size: 'xxs',
                  color: '#64748B',
                  weight: 'bold',
                },
                {
                  type: 'text',
                  text: `${task.time} น.`,
                  size: 'md',
                  weight: 'bold',
                  color: accentColor,
                  margin: 'xs',
                },
              ],
            },
          ],
        },

        // Tags Row: Category & Priority
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          contents: [
            // Category Capsule
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#F1F5F9',
              cornerRadius: '8px',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '4px',
              paddingBottom: '4px',
              contents: [
                {
                  type: 'text',
                  text: `📁 ${categoryName}`,
                  size: 'xxs',
                  color: '#334155',
                  weight: 'bold',
                },
              ],
            },
            // Priority Capsule
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: priorityBg,
              cornerRadius: '8px',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '4px',
              paddingBottom: '4px',
              contents: [
                {
                  type: 'text',
                  text: priorityLabel,
                  size: 'xxs',
                  color: priorityColor,
                  weight: 'bold',
                },
              ],
            },
          ],
        },

        // Assignee Row (if specified)
        ...(assignee ? [
          {
            type: 'box',
            layout: 'horizontal',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            cornerRadius: '8px',
            paddingAll: '8px',
            contents: [
              {
                type: 'text',
                text: '👤 ผู้รับผิดชอบ:',
                size: 'xxs',
                color: '#64748B',
                weight: 'bold',
              },
              {
                type: 'text',
                text: `${assignee.name} (${assignee.role})`,
                size: 'xs',
                color: '#0F172A',
                weight: 'bold',
                margin: 'sm',
              },
            ],
          },
        ] : []),

        // Description box (if available)
        ...(task.description ? [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#F8FAFC',
            cornerRadius: '8px',
            paddingAll: '10px',
            borderWidth: '1px',
            borderColor: '#E2E8F0',
            contents: [
              {
                type: 'text',
                text: '📝 รายละเอียด:',
                size: 'xxs',
                color: '#64748B',
                weight: 'bold',
              },
              {
                type: 'text',
                text: task.description,
                size: 'xs',
                color: '#334155',
                wrap: true,
                margin: 'xs',
              },
            ],
          },
        ] : []),

        // Action Status Note
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '⚡ แตะปุ่มด้านล่างเพื่อเปิดดูงานบนปฏิทินระบบ',
              size: 'xxs',
              color: '#94A3B8',
              wrap: true,
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '14px',
      spacing: 'sm',
      backgroundColor: '#FAFAFA',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: buttonColor,
          height: 'sm',
          action: {
            type: 'uri',
            label: '📅 เปิดดูในปฏิทินระบบ',
            uri: appUrl,
          },
        },
        {
          type: 'text',
          text: 'To Do List Calendar • ระบบน้องเลขา',
          size: 'xxs',
          color: '#94A3B8',
          align: 'center',
          margin: 'xs',
        },
      ],
    },
  };
}

/**
 * Builds an official LINE Flex Message bubble for Daily Morning Briefing
 */
export function buildMorningBriefingFlexBubble({
  tasks,
  categories,
  users = [],
  dateString,
  briefingTime = '07:30',
  themeId = 'executive-slate',
  appUrl = 'https://ais-dev-f6dbiiwy3w3yu5bdq7tyax-1077673389760.asia-southeast1.run.app',
}: {
  tasks: Task[];
  categories: Category[];
  users?: UserAssignee[];
  dateString?: string;
  briefingTime?: string;
  themeId?: LineThemeId;
  appUrl?: string;
}) {
  const todayStr = dateString || new Date().toISOString().split('T')[0];
  const thaiDateFormatted = formatThaiDate(todayStr, { shortMonth: false });

  // Filter tasks for this target date & sort by time ascending
  const todayTasks = tasks
    .filter(t => t.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const totalTasks = todayTasks.length;
  const highPriorityCount = todayTasks.filter(t => t.priority === 'high').length;
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const firstTaskTime = todayTasks[0]?.time || '--:--';

  // Build task item rows (up to 5 items shown nicely)
  const taskRows: any[] = [];

  if (todayTasks.length === 0) {
    taskRows.push({
      type: 'box',
      layout: 'vertical',
      paddingAll: '12px',
      backgroundColor: '#F8FAFC',
      cornerRadius: '8px',
      alignItems: 'center',
      contents: [
        {
          type: 'text',
          text: '🎉 วันนี้ไม่มีรายการงานค้าง',
          size: 'xs',
          color: '#64748B',
          weight: 'bold',
        },
        {
          type: 'text',
          text: 'ขอให้เป็นวันที่ราบรื่นและมีพลังครับ!',
          size: 'xxs',
          color: '#94A3B8',
          margin: 'xs',
        },
      ],
    });
  } else {
    todayTasks.slice(0, 5).forEach((t) => {
      const isHigh = t.priority === 'high';
      const isDone = t.status === 'completed';
      const priorityDotColor = isHigh ? '#EF4444' : t.priority === 'medium' ? '#F59E0B' : '#10B981';

      taskRows.push({
        type: 'box',
        layout: 'horizontal',
        alignItems: 'center',
        paddingAll: '8px',
        backgroundColor: '#F8FAFC',
        cornerRadius: '8px',
        contents: [
          // Time badge
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: isHigh ? '#FEE2E2' : '#E2E8F0',
            cornerRadius: '4px',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: t.time,
                size: 'xxs',
                weight: 'bold',
                color: isHigh ? '#B91C1C' : '#334155',
              },
            ],
          },
          // Dot
          {
            type: 'box',
            layout: 'vertical',
            width: '6px',
            height: '6px',
            cornerRadius: 'xxl',
            backgroundColor: priorityDotColor,
            margin: 'sm',
          },
          // Title
          {
            type: 'text',
            text: (isDone ? '✓ ' : '') + t.title,
            size: 'xs',
            color: isDone ? '#94A3B8' : '#1E293B',
            weight: isDone ? 'regular' : 'bold',
            flex: 1,
            wrap: true,
            margin: 'sm',
          },
        ],
      });
    });

    if (todayTasks.length > 5) {
      taskRows.push({
        type: 'text',
        text: `+ อีก ${todayTasks.length - 5} รายการงาน...`,
        size: 'xxs',
        color: '#64748B',
        align: 'center',
        margin: 'xs',
      });
    }
  }

  return {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#EA580C',
      paddingAll: '18px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          alignItems: 'center',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#FEF3C7',
              cornerRadius: 'xxl',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '2px',
              paddingBottom: '2px',
              contents: [
                {
                  type: 'text',
                  text: '☀️ MORNING BRIEFING',
                  size: 'xxs',
                  color: '#92400E',
                  weight: 'bold',
                },
              ],
            },
            { type: 'filler' },
            {
              type: 'text',
              text: `เวลา ${briefingTime} น.`,
              size: 'xxs',
              color: '#FFEDD5',
              weight: 'bold',
            },
          ],
        },
        {
          type: 'text',
          text: 'สรุปตารางงานประจำวัน',
          weight: 'bold',
          size: 'xl',
          color: '#FFFFFF',
          margin: 'md',
        },
        {
          type: 'text',
          text: thaiDateFormatted,
          size: 'xs',
          color: '#FFEDD5',
          margin: 'xs',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      spacing: 'md',
      backgroundColor: '#FFFFFF',
      contents: [
        // 3-Column Summary Metrics
        {
          type: 'box',
          layout: 'horizontal',
          backgroundColor: '#FFF7ED',
          cornerRadius: '12px',
          paddingAll: '10px',
          borderColor: '#FFEDD5',
          borderWidth: '1px',
          contents: [
            // Total Tasks
            {
              type: 'box',
              layout: 'vertical',
              alignItems: 'center',
              flex: 1,
              contents: [
                { type: 'text', text: 'งานทั้งหมด', size: 'xxs', color: '#9A3412' },
                { type: 'text', text: String(totalTasks), size: 'lg', weight: 'bold', color: '#7C2D12' },
              ],
            },
            // Urgent Tasks
            {
              type: 'box',
              layout: 'vertical',
              alignItems: 'center',
              flex: 1,
              contents: [
                { type: 'text', text: 'งานด่วนมาก', size: 'xxs', color: '#9A3412' },
                { type: 'text', text: String(highPriorityCount), size: 'lg', weight: 'bold', color: highPriorityCount > 0 ? '#DC2626' : '#7C2D12' },
              ],
            },
            // First Task Time
            {
              type: 'box',
              layout: 'vertical',
              alignItems: 'center',
              flex: 1,
              contents: [
                { type: 'text', text: 'เริ่มงานแรก', size: 'xxs', color: '#9A3412' },
                { type: 'text', text: firstTaskTime, size: 'sm', weight: 'bold', color: '#7C2D12', margin: 'xs' },
              ],
            },
          ],
        },

        // Task Items Header
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '📋 กำหนดการวันนี้:',
              size: 'xs',
              weight: 'bold',
              color: '#334155',
            },
            { type: 'filler' },
            {
              type: 'text',
              text: `${completedCount}/${totalTasks} เสร็จแล้ว`,
              size: 'xxs',
              color: '#64748B',
            },
          ],
        },

        // Task Items Box
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: taskRows,
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '14px',
      spacing: 'sm',
      backgroundColor: '#FAFAFA',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#EA580C',
          height: 'sm',
          action: {
            type: 'uri',
            label: '📱 เปิดดูปฏิทินงานทั้งหมด',
            uri: appUrl,
          },
        },
      ],
    },
  };
}

/**
 * Builds an official LINE Flex Message bubble for Task Creation Confirmation
 */
export function buildTaskConfirmationFlexBubble({
  task,
  appUrl = 'https://ais-dev-f6dbiiwy3w3yu5bdq7tyax-1077673389760.asia-southeast1.run.app',
}: {
  task: {
    title: string;
    date: string;
    time: string;
    priority: string;
    categoryId?: string;
  };
  appUrl?: string;
}) {
  const shortDate = formatThaiDate(task.date, { shortMonth: true });
  const priorityThai = task.priority === 'high' ? '🔴 ด่วนมาก' : task.priority === 'medium' ? '🟡 ปานกลาง' : '🟢 ทั่วไป';

  return {
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
          text: '✓ บันทึกลงปฏิทินสำเร็จแล้ว',
          color: '#34D399',
          weight: 'bold',
          size: 'xs',
        },
        {
          type: 'text',
          text: task.title,
          color: '#ffffff',
          weight: 'bold',
          size: 'md',
          wrap: true,
          margin: 'xs',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '14px',
      spacing: 'sm',
      backgroundColor: '#FFFFFF',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          backgroundColor: '#F8FAFC',
          cornerRadius: '10px',
          paddingAll: '10px',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              flex: 3,
              contents: [
                { type: 'text', text: '📅 วันที่', size: 'xxs', color: '#64748B' },
                { type: 'text', text: shortDate, size: 'xs', weight: 'bold', color: '#0F172A', margin: 'xs' },
              ],
            },
            {
              type: 'box',
              layout: 'vertical',
              flex: 2,
              alignItems: 'flex-end',
              contents: [
                { type: 'text', text: '🕒 เวลา', size: 'xxs', color: '#64748B' },
                { type: 'text', text: `${task.time} น.`, size: 'sm', weight: 'bold', color: '#2563EB', margin: 'xs' },
              ],
            },
          ],
        },
        {
          type: 'box',
          layout: 'horizontal',
          spacing: 'sm',
          margin: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              backgroundColor: '#F1F5F9',
              cornerRadius: '6px',
              paddingStart: '8px',
              paddingEnd: '8px',
              paddingTop: '3px',
              paddingBottom: '3px',
              contents: [
                { type: 'text', text: priorityThai, size: 'xxs', weight: 'bold', color: '#0F172A' },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '10px',
      backgroundColor: '#FAFAFA',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#0F172A',
          height: 'sm',
          action: {
            type: 'uri',
            label: 'เปิดดูในปฏิทินระบบ',
            uri: appUrl,
          },
        },
      ],
    },
  };
}

/**
 * Text formatter fallback for Morning Briefing
 */
export function formatMorningBriefingTextMessage(
  tasks: Task[], 
  dateStr: string, 
  briefingTime = '07:30'
): string {
  const thaiDate = formatThaiDate(dateStr, { shortMonth: false });
  const todayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  const highPriority = todayTasks.filter(t => t.priority === 'high');

  let text = `☀️ [สรุปตารางงานประจำวัน] ${thaiDate}\nเวลา ${briefingTime} น.\n━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 วันนี้มีงานทั้งหมด: ${todayTasks.length} งาน\n`;
  if (highPriority.length > 0) {
    text += `🔴 งานด่วนสำคัญมาก: ${highPriority.length} งาน\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━\n📋 กำหนดการ:\n`;

  if (todayTasks.length === 0) {
    text += `🎉 วันนี้ไม่มีรายการงานค้าง ขอให้เป็นวันที่ราบรื่นครับ!`;
  } else {
    todayTasks.forEach((t, idx) => {
      const p = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
      text += `${idx + 1}. [${t.time} น.] ${p} ${t.title}\n`;
    });
  }

  return text;
}
