import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { TaskListView } from './components/TaskListView';
import { CategoriesView } from './components/CategoriesView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { LinePhoneMockup } from './components/LinePhoneMockup';
import { TaskModal } from './components/TaskModal';
import { ToastBanner } from './components/ToastBanner';
import { LineSetupModal } from './components/LineSetupModal';
import { GoogleSheetSetupModal } from './components/GoogleSheetSetupModal';
import { Task } from './types';

const MainContent: React.FC = () => {
  const { activeView, tasks } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [taskDefaultDate, setTaskDefaultDate] = useState<string | undefined>(undefined);

  const handleOpenTaskModal = (task?: Task, defaultDate?: string) => {
    setTaskToEdit(task);
    setTaskDefaultDate(defaultDate);
    setIsTaskModalOpen(true);
  };

  const handleOpenTaskModalById = (taskId: string) => {
    const found = tasks.find(t => t.id === taskId);
    if (found) {
      handleOpenTaskModal(found);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Navigation (Desktop persistent & Mobile slide-out drawer) */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onCloseMobile={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onOpenAddTask={() => handleOpenTaskModal()} 
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-28 lg:pb-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView onOpenTaskModal={handleOpenTaskModal} />
          )}
          {activeView === 'calendar' && (
            <CalendarView onOpenTaskModal={handleOpenTaskModal} />
          )}
          {activeView === 'tasks' && (
            <TaskListView onOpenTaskModal={handleOpenTaskModal} />
          )}
          {activeView === 'categories' && <SettingsView initialTab="categories" />}
          {activeView === 'users' && <SettingsView initialTab="users" />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop, thumb-friendly on phone) */}
      <BottomNav onOpenAddTask={() => handleOpenTaskModal()} />

      {/* Interactive LINE Phone Simulator */}
      <LinePhoneMockup onOpenTaskDetails={handleOpenTaskModalById} />

      {/* LINE Setup & Instant Testing Modal */}
      <LineSetupModal />

      {/* Google Sheets Setup & Troubleshooter Modal */}
      <GoogleSheetSetupModal />

      {/* Global Real-time Notification Toast Banner */}
      <ToastBanner />

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultDate={taskDefaultDate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
