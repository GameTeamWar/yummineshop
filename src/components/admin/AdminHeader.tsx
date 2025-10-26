'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = "Yummine Admin",
  subtitle = "Yönetim Paneli"
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Hydration hatalarını önlemek için
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {subtitle}
              </div>
              <div className="p-2 rounded-lg w-9 h-9"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {subtitle}
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;