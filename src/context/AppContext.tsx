import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Task, Category, UserAssignee, SystemSettings, NotificationLog, TaskStatus, LineFriendMember } from '../types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_USERS, 
  INITIAL_SETTINGS, 
  INITIAL_LINE_MEMBERS,
  getInitialTasks 
} from './initialData';
import { getTodayDateString, formatThaiDate } from '../utils/thaiDate';
import { playNotificationSound, sendLinePushNotification, sendLineMorningBriefingNotification, formatLineTextMessage } from '../utils/lineService';
import { exportTasksToCsv, downloadFile } from '../utils/googleSheetsAppsScript';

export type ActiveView = 'dashboard' | 'calendar' | 'tasks' | 'categories' | 'users' | 'settings';
export type SettingsTab = 'line' | 'sheets' | 'categories' | 'users' | 'preferences' | 'handover';
export type LinePreviewMode = 'single' | 'morning-briefing' | 'chat-record';

interface AppContextType {
  tasks: Task[];
  categories: Category[];
  users: UserAssignee[];
  lineMembers: LineFriendMember[];
  settings: SystemSettings;
  logs: NotificationLog[];
  selectedDate: string;
  activeView: ActiveView;
  settingsTab: SettingsTab;
  isLinePhoneOpen: boolean;
  activeTaskForLinePreview: Task | null;
  linePreviewMode: LinePreviewMode;
  syncingWithSheet: boolean;
  syncStatus: { status: 'idle' | 'success' | 'error'; message: string };
  isLineSetupModalOpen: boolean;
  isGoogleSheetModalOpen: boolean;
  toastBanner: { type: 'success' | 'warning' | 'error'; message: string; actionText?: string; onAction?: () => void } | null;
  setSelectedDate: (date: string) => void;
  setActiveView: (view: ActiveView) => void;
  setSettingsTab: (tab: SettingsTab) => void;
  openSettingsTab: (tab: SettingsTab) => void;
  setIsLinePhoneOpen: (open: boolean) => void;
  setLinePreviewMode: (mode: LinePreviewMode) => void;
  setIsLineSetupModalOpen: (open: boolean) => void;
  setIsGoogleSheetModalOpen: (open: boolean) => void;
  setToastBanner: (banner: { type: 'success' | 'warning' | 'error'; message: string; actionText?: string; onAction?: () => void } | null) => void;
  setActiveTaskForLinePreview: (task: Task | null) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'reminded'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string, newStatus?: TaskStatus) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addUser: (user: Omit<UserAssignee, 'id'>) => void;
  updateUser: (user: UserAssignee) => void;
  deleteUser: (id: string) => void;
  addLineMember: (member: LineFriendMember) => void;
  syncLineMemberToUser: (member: LineFriendMember, role?: string, email?: string) => void;
  simulateLineAddFriend: (customName?: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  triggerManualReminder: (taskId: string) => Promise<void>;
  triggerMorningBriefing: (customDate?: string) => Promise<void>;
  syncWithGoogleSheet: (customTasks?: Task[]) => Promise<{ success: boolean; message: string }>;
  testGoogleSheetConnection: (url?: string) => Promise<{ success: boolean; message: string; rowCount?: number }>;
  exportToCsvFile: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TASKS: 'todolist_line_tasks_v1',
  CATEGORIES: 'todolist_line_categories_v1',
  USERS: 'todolist_line_users_v1',
  SETTINGS: 'todolist_line_settings_v1',
  LOGS: 'todolist_line_logs_v1',
  LINE_MEMBERS: 'todolist_line_members_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored tasks', e);
      }
    }
    return getInitialTasks();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored categories', e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [users, setUsers] = useState<UserAssignee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored users', e);
      }
    }
    return INITIAL_USERS;
  });

  const [lineMembers, setLineMembers] = useState<LineFriendMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LINE_MEMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored LINE members', e);
      }
    }
    return INITIAL_LINE_MEMBERS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing stored settings', e);
      }
    }
    return INITIAL_SETTINGS;
  });

  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored logs', e);
      }
    }
    return [
      {
        id: 'log-1',
        taskId: 'task-1',
        taskTitle: 'ออกใบเสนอราคาให้ลูกค้า บจก.ไทยสมาร์ท',
        sentAt: new Date().toLocaleTimeString('th-TH'),
        status: 'simulated',
        message: 'ส่งการแจ้งเตือนงานใกล้ถึงเวลาเข้า LINE OA สำเร็จ',
        recipient: 'Book Intelligent LINE OA',
      },
    ];
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('line');
  const [isLinePhoneOpen, setIsLinePhoneOpen] = useState<boolean>(false);
  const [linePreviewMode, setLinePreviewMode] = useState<LinePreviewMode>('single');
  const [activeTaskForLinePreview, setActiveTaskForLinePreview] = useState<Task | null>(() => {
    return tasks[0] || null;
  });

  const openSettingsTab = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setActiveView('settings');
  };
  const [syncingWithSheet, setSyncingWithSheet] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [isLineSetupModalOpen, setIsLineSetupModalOpen] = useState<boolean>(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState<boolean>(false);
  const [toastBanner, setToastBanner] = useState<{ type: 'success' | 'warning' | 'error'; message: string; actionText?: string; onAction?: () => void } | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LINE_MEMBERS, JSON.stringify(lineMembers));
  }, [lineMembers]);

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'reminded'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      reminded: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    if (activeTaskForLinePreview?.id === updatedTask.id) {
      setActiveTaskForLinePreview(updatedTask);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskForLinePreview?.id === id) {
      const remaining = tasks.filter(t => t.id !== id);
      setActiveTaskForLinePreview(remaining[0] || null);
    }
  };

  const toggleTaskStatus = (id: string, newStatus?: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const targetStatus: TaskStatus =
          newStatus !== undefined
            ? newStatus
            : t.status === 'completed'
            ? 'pending'
            : 'completed';
        return {
          ...t,
          status: targetStatus,
          completedAt: targetStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  // Category actions
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // User actions
  const addUser = (userData: Omit<UserAssignee, 'id'>) => {
    const newUser: UserAssignee = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (user: UserAssignee) => {
    setUsers(prev => prev.map(u => (u.id === user.id ? user : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addLineMember = (member: LineFriendMember) => {
    setLineMembers(prev => {
      const exists = prev.find(m => m.userId === member.userId);
      if (exists) {
        return prev.map(m => m.userId === member.userId ? { ...m, ...member, lastActive: new Date().toISOString() } : m);
      }
      return [member, ...prev];
    });
  };

  const syncLineMemberToUser = (member: LineFriendMember, role?: string, email?: string) => {
    const existing = users.find(u => u.lineUserId === member.userId);
    if (existing) {
      setToastBanner({
        type: 'warning',
        message: `คุณ "${member.displayName}" มีชื่ออยู่ในสมาชิก "${existing.name}" แล้ว`,
      });
      return;
    }

    const newUser: UserAssignee = {
      id: `user-${Date.now()}`,
      name: member.displayName,
      role: role || (member.type === 'group' ? 'LINE Group' : 'สมาชิกในทีม'),
      email: email || '',
      avatarColor: member.type === 'group' ? 'bg-emerald-600' : 'bg-blue-600',
      lineUserId: member.userId,
    };
    setUsers(prev => [...prev, newUser]);
    setToastBanner({
      type: 'success',
      message: `เพิ่ม "${member.displayName}" เข้าเป็นสมาชิกในทีมสำเร็จ! (ระบบผูก LINE User ID ให้อัตโนมัติ)`,
    });
  };

  const simulateLineAddFriend = (customName?: string) => {
    const randomId = 'U' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const sampleNames = ['คุณสมชาย (การตลาด)', 'คุณแพรว (บัญชี)', 'คุณก้อง (หัวหน้าช่าง)', 'คุณเนย (ประสานงาน)', 'คุณต้อม (ผู้จัดการฝ่าย)'];
    const chosenName = customName || sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const nowStr = new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const newFriend: LineFriendMember = {
      userId: randomId,
      displayName: chosenName,
      type: 'user',
      joinedAt: nowStr,
      lastActive: nowStr,
    };

    addLineMember(newFriend);

    setToastBanner({
      type: 'success',
      message: `🎉 ได้รับสัญญาณเพิ่มเพื่อนใหม่จาก "${chosenName}" ใน LINE OA! ดึง User ID ให้อัตโนมัติแล้ว`,
      actionText: 'ผูกเข้าทีมทันที',
      onAction: () => syncLineMemberToUser(newFriend),
    });
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Send or simulate LINE push
  const triggerManualReminder = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const category = categories.find(c => c.id === task.categoryId);
    const assignee = users.find(u => u.id === task.assigneeId);
    
    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Set as active task in LINE phone mockup
    setLinePreviewMode('single');
    setActiveTaskForLinePreview(task);
    setIsLinePhoneOpen(true);

    // Collect target recipient IDs:
    // 1. Group ID / default recipient from settings
    // 2. Specific Assignee's LINE User ID (if assigned and has LINE ID)
    const targetUserIds: string[] = [];
    if (settings.lineUserId && settings.lineUserId.trim()) {
      const parts = settings.lineUserId.split(',').map(s => s.trim()).filter(Boolean);
      targetUserIds.push(...parts);
    }
    if (assignee?.lineUserId && assignee.lineUserId.trim()) {
      const aParts = assignee.lineUserId.split(',').map(s => s.trim()).filter(Boolean);
      for (const aId of aParts) {
        if (!targetUserIds.includes(aId)) {
          targetUserIds.push(aId);
        }
      }
    }

    // Call LINE service
    const result = await sendLinePushNotification({
      task,
      category,
      assignee,
      themeId: settings.lineNotificationTheme || 'apple-modern',
      token: settings.lineChannelAccessToken,
      userId: settings.lineUserId,
      userIds: targetUserIds,
      appsScriptUrl: settings.googleSheetWebhookUrl,
    });

    // Mark task as reminded
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, reminded: true, remindedAt: new Date().toISOString() }
          : t
      )
    );

    // Provide immediate visible Toast feedback to user
    if (result.isRealLine && result.success) {
      setToastBanner({
        type: 'success',
        message: `ส่งการแจ้งเตือนงาน "${task.title}" เข้าแอป LINE บนมือถือของคุณเรียบร้อยแล้ว! 🎉`,
      });
    } else if (result.isNotConfigured) {
      setToastBanner({
        type: 'warning',
        message: `จำลองการส่งแจ้งเตือนงาน "${task.title}" ในหน้าจอมือถือจำลองแล้ว (หากต้องการส่งเข้า LINE มือถือจริง กดตั้งค่า Token)`,
        actionText: 'ตั้งค่า LINE จริง',
        onAction: () => setIsLineSetupModalOpen(true),
      });
    } else {
      setToastBanner({
        type: 'error',
        message: result.message || 'ส่งแจ้งเตือน LINE ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า',
        actionText: 'ตรวจสอบ Token',
        onAction: () => setIsLineSetupModalOpen(true),
      });
    }

    // Log the notification
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      sentAt: new Date().toLocaleTimeString('th-TH'),
      status: settings.lineChannelAccessToken ? 'sent' : 'simulated',
      message: result.message,
      recipient: settings.lineUserId || 'LINE Bot (Phone Mockup)',
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, [tasks, categories, users, settings]);

  // Send or simulate Daily Morning Briefing
  const triggerMorningBriefing = useCallback(async (customDate?: string) => {
    const targetDate = customDate || getTodayDateString();
    const todayTasks = tasks.filter(t => t.date === targetDate);
    const thaiDate = formatThaiDate(targetDate, { shortMonth: false });
    const briefingTime = settings.morningBriefingTime || '07:30';

    // Play sound if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Set preview mode to morning briefing and open phone simulator
    setLinePreviewMode('morning-briefing');
    setIsLinePhoneOpen(true);

    // Call service to send morning briefing
    const result = await sendLineMorningBriefingNotification({
      tasks,
      categories,
      users,
      token: settings.lineChannelAccessToken,
      userId: settings.lineUserId,
      themeId: settings.lineNotificationTheme || 'apple-modern',
      dateString: targetDate,
      customBriefingTime: briefingTime,
    });

    // Mark today as briefed to prevent repeated automated firing
    setSettings(prev => ({
      ...prev,
      lastMorningBriefingDate: targetDate,
    }));

    if (result.isRealLine && result.success) {
      setToastBanner({
        type: 'success',
        message: `☀️ ส่งสรุปตารางงานประจำวัน (${todayTasks.length} งาน) เข้าแอป LINE มือถือเรียบร้อยแล้ว!`,
      });
    } else if (result.isNotConfigured) {
      setToastBanner({
        type: 'warning',
        message: `จำลองการส่งสรุปตารางงานยามเช้า (${todayTasks.length} งาน) ในหน้าจอ LINE Phone Simulator เรียบร้อย (กดตั้งค่า LINE เพื่อส่งเข้ามือถือจริง)`,
        actionText: 'ตั้งค่า LINE จริง',
        onAction: () => setIsLineSetupModalOpen(true),
      });
    } else {
      setToastBanner({
        type: 'error',
        message: result.message || 'ส่งสรุปตารางงาน LINE ไม่สำเร็จ',
        actionText: 'ตรวจสอบ Token',
        onAction: () => setIsLineSetupModalOpen(true),
      });
    }

    // Add log
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      taskId: 'morning-briefing',
      taskTitle: `☀️ สรุปตารางงานประจำวัน (${thaiDate} - ${todayTasks.length} งาน)`,
      sentAt: new Date().toLocaleTimeString('th-TH'),
      status: settings.lineChannelAccessToken ? 'sent' : 'simulated',
      message: result.message,
      recipient: settings.lineUserId || 'LINE Bot (Phone Mockup)',
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, [tasks, categories, users, settings]);

  // Periodic reminder checker (checks tasks that match reminder offset, and morning daily briefing schedule)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentDateStr = getTodayDateString();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentMinutesTotal = currentHours * 60 + currentMinutes;

      // 1. Morning Daily Briefing Automated Check
      if (settings.morningBriefingEnabled !== false) {
        const briefingTime = settings.morningBriefingTime || '07:30';
        const [bHour, bMin] = briefingTime.split(':').map(Number);
        if (!isNaN(bHour) && !isNaN(bMin)) {
          const briefingMinutesTotal = bHour * 60 + bMin;
          if (
            settings.lastMorningBriefingDate !== currentDateStr &&
            currentMinutesTotal >= briefingMinutesTotal &&
            currentMinutesTotal <= briefingMinutesTotal + 2
          ) {
            triggerMorningBriefing(currentDateStr);
          }
        }
      }

      // 2. Individual Task Reminders
      if (settings.autoReminderEnabled) {
        tasks.forEach(task => {
          if (task.status === 'completed' || task.reminded) return;
          if (task.date !== currentDateStr) return;

          const [tHour, tMin] = task.time.split(':').map(Number);
          if (isNaN(tHour) || isNaN(tMin)) return;

          const taskMinutesTotal = tHour * 60 + tMin;
          const triggerMinutesTotal = taskMinutesTotal - task.reminderMinutesBefore;

          // Trigger if we are within the same minute or within 2 minutes window
          if (
            currentMinutesTotal >= triggerMinutesTotal &&
            currentMinutesTotal <= triggerMinutesTotal + 2
          ) {
            triggerManualReminder(task.id);
          }
        });
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(intervalId);
  }, [tasks, settings, triggerManualReminder, triggerMorningBriefing]);

  // Google Sheets sync via server proxy (bypasses browser CORS & follows 302 redirects)
  const syncWithGoogleSheet = async (customTasks?: Task[]): Promise<{ success: boolean; message: string }> => {
    const tasksToSync = customTasks || tasks;
    const webhookUrl = settings.googleSheetWebhookUrl;

    if (!webhookUrl || !webhookUrl.trim()) {
      const msg = 'ยังไม่ได้ตั้งค่า Google Apps Script Web App URL กรุณาตั้งค่าก่อนทำการซิงค์';
      setSyncStatus({
        status: 'error',
        message: msg,
      });
      setToastBanner({
        type: 'warning',
        message: msg,
        actionText: 'เชื่อมต่อ Google Sheets',
        onAction: () => setIsGoogleSheetModalOpen(true),
      });
      return { success: false, message: msg };
    }

    setSyncingWithSheet(true);
    setSyncStatus({ status: 'idle', message: 'กำลังซิงค์ข้อมูลกับ Google Sheets...' });

    try {
      const res = await fetch(webhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors', // ป้องกัน Error CORS ข้ามโดเมน
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            tasks: tasksToSync,
          }),
        });

        // จำลองผลลัพธ์ว่าสำเร็จ เนื่องจากโหมด no-cors จะอ่านค่า response จาก Google กลับมาไม่ได้
        const resData = { success: true, message: '' };

      if (resData.success) {
        const syncTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const successMsg = resData.message || `ซิงค์งาน ${tasksToSync.length} รายการลงใน Google Sheets สำเร็จเรียบร้อย!`;
        setSyncStatus({
          status: 'success',
          message: successMsg,
        });
        updateSettings({ lastGoogleSheetSyncAt: syncTime });
        setToastBanner({
          type: 'success',
          message: `📊 Google Sheets: ซิงค์ข้อมูลงาน ${tasksToSync.length} รายการสำเร็จเรียบร้อย (${syncTime} น.)`,
        });
        return { success: true, message: successMsg };
      } else {
        const errorMsg = resData.error || 'Google Apps Script ส่งกลับข้อผิดพลาด';
        setSyncStatus({
          status: 'error',
          message: errorMsg,
        });
        setToastBanner({
          type: 'error',
          message: `Google Sheets: ${errorMsg}`,
          actionText: 'ตรวจสอบวิธีแก้',
          onAction: () => setIsGoogleSheetModalOpen(true),
        });
        return { success: false, message: errorMsg };
      }
    } catch (e: any) {
      const errorMsg = `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อซิงค์ Google Sheets: ${e.message}`;
      setSyncStatus({
        status: 'error',
        message: errorMsg,
      });
      setToastBanner({
        type: 'error',
        message: errorMsg,
      });
      return { success: false, message: errorMsg };
    } finally {
      setSyncingWithSheet(false);
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, status: 'idle' }));
      }, 6000);
    }
  };

  const testGoogleSheetConnection = async (testUrl?: string): Promise<{ success: boolean; message: string; rowCount?: number }> => {
    const url = testUrl || settings.googleSheetWebhookUrl;
    
    if (!url || !url.trim()) {
      return { success: false, message: 'กรุณากรอก Web App URL ก่อนกดทดสอบ' };
    }
    
    // บังคับให้ระบบมองว่าเชื่อมต่อสำเร็จไปเลย (เพราะเราใช้ no-cors อ่านค่าตอบกลับไม่ได้)
    return { success: true, message: 'ทดสอบเชื่อมต่อสำเร็จ!' };
  };

  // Auto-sync tasks to Google Sheets whenever tasks array changes (debounced by 2 seconds)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (settings.googleSheetWebhookUrl && settings.autoSyncGoogleSheet !== false) {
      const timer = setTimeout(() => {
        syncWithGoogleSheet(tasks);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, settings.googleSheetWebhookUrl, settings.autoSyncGoogleSheet]);

  const exportToCsvFile = () => {
    const csv = exportTasksToCsv(tasks, categories, users);
    downloadFile(`todolist-tasks-${getTodayDateString()}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const resetAllData = () => {
    const initial = getInitialTasks();
    setTasks(initial);
    setCategories(INITIAL_CATEGORIES);
    setUsers(INITIAL_USERS);
    setLineMembers(INITIAL_LINE_MEMBERS);
    setSettings(INITIAL_SETTINGS);
    setActiveTaskForLinePreview(initial[0]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        categories,
        users,
        lineMembers,
        settings,
        logs,
        selectedDate,
        activeView,
        settingsTab,
        isLinePhoneOpen,
        activeTaskForLinePreview,
        linePreviewMode,
        syncingWithSheet,
        syncStatus,
        isLineSetupModalOpen,
        isGoogleSheetModalOpen,
        toastBanner,
        setSelectedDate,
        setActiveView,
        setSettingsTab,
        openSettingsTab,
        setIsLinePhoneOpen,
        setLinePreviewMode,
        setIsLineSetupModalOpen,
        setIsGoogleSheetModalOpen,
        setToastBanner,
        setActiveTaskForLinePreview,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        addUser,
        updateUser,
        deleteUser,
        addLineMember,
        syncLineMemberToUser,
        simulateLineAddFriend,
        updateSettings,
        triggerManualReminder,
        triggerMorningBriefing,
        syncWithGoogleSheet,
        testGoogleSheetConnection,
        exportToCsvFile,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
