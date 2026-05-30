import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import NotificationPanel from '../common/NotificationPanel';

export const DashboardLayout = ({ title, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex text-text-primary overflow-x-hidden font-body">
      {/* Sidebar navigation layer */}
      <Sidebar isMobileOpen={isSidebarOpen} setIsMobileOpen={setIsSidebarOpen} />

      {/* Backdrop overlay for active mobile sidebars */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Scaffolding Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top toolbar */}
        <DashboardHeader title={title} onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Scrollable Work area */}
        <main className="flex-1 overflow-y-auto pt-20 pb-10 px-4 sm:px-6 lg:px-8 mt-1 flex flex-col gap-6">
          {children}
        </main>
      </div>

      {/* Global Slide-out Notification Drawer */}
      <NotificationPanel />
    </div>
  );
};

export default DashboardLayout;
