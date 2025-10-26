import React, { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import MobileMenuButton from './mobile-menu-button';

interface LayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarContent,
  showSidebar = true
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
      <Header />

      {/* Mobile menu button */}
      {showSidebar && (
        <MobileMenuButton onClick={toggleSidebar} />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar}>
            {sidebarContent}
          </Sidebar>
        )}

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${
          showSidebar ? 'lg:ml-0' : ''
        }`}>
          <main className="p-4 sm:p-6 lg:p-8 flex-1 bg-white dark:bg-gray-800 min-h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;