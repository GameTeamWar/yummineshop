import React, { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import MobileMenuButton from './mobile-menu-button';

interface LayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  showSidebar?: boolean;
  headerProps?: {
    title?: string;
    subtitle?: string;
    onMenuClick?: () => void;
  };
}

const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarContent,
  showSidebar = true,
  headerProps
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header {...headerProps} onMenuClick={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar}>
            {sidebarContent}
          </Sidebar>
        )}

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300  overflow-auto ${
          showSidebar ? 'lg:ml-0' : ''
        }`}>
          <main className="p-3 sm:p-4 md:p-6 lg:p-0 w-full h-screen bg-white dark:bg-gray-800">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;