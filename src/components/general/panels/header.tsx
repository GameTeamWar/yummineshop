'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sun, Moon, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = "Yummine",
  subtitle = "Yönetim Paneli",
  onMenuClick
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, role, logout, getProfile } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // İsim formatını düzenleme fonksiyonu
  const formatDisplayName = (name: string | undefined) => {
    if (!name) return 'Kullanıcı';

    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Kullanıcı adı belirleme
  const getUserDisplayName = () => {
    const profile = getProfile();
    
    // Önce profile'dan displayName'i kontrol et
    if (profile?.displayName) {
      return formatDisplayName(profile.displayName);
    }

    // Sonra Auth'dan displayName'i kontrol et
    if (user?.displayName) {
      return formatDisplayName(user.displayName);
    }

    // Son olarak email'den türet
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return formatDisplayName(emailName);
    }

    return 'Kullanıcı';
  };

  // Hydration hatalarını önlemek için
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="p-2 rounded-lg w-9 h-9 bg-gray-200 dark:bg-gray-700"></div>
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
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {role === 0 ? 'Admin' : role === 1 ? 'Mağaza' : role === 2 ? 'Müşteri' : role === 3 ? 'Kurye' : 'Kullanıcı'}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {role === 0 ? 'Admin' : role === 1 ? 'Mağaza' : role === 2 ? 'Müşteri' : role === 3 ? 'Kurye' : 'Kullanıcı'}
                      </div>
                    </div>

                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profil
                    </a>

                    <a
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Ayarlar
                    </a>

                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {resolvedTheme === 'dark' ? (
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

export default Header;