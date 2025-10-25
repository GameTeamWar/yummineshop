import React, { useState } from 'react';
import { Home, ShoppingBag, FileText, User, Heart, LogOut, Package, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  user?: any;
  logout?: () => void;
  heroMode?: string;
  setHeroMode?: (mode: string) => void;
}

export default function MobileNavigation({ activeTab, setActiveTab, darkMode, user, logout, heroMode, setHeroMode }: MobileNavigationProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hamburgerDropdownOpen, setHamburgerDropdownOpen] = useState(false);
  const router = useRouter();

  const navItems = user ? [
    { id: 'home', label: 'Ana Sayfa', icon: Home, action: () => { setActiveTab('home'); if (setHeroMode) setHeroMode('shopping'); } },
    { id: 'documents', label: 'Belge', icon: FileText, action: () => { setActiveTab('documents'); if (setHeroMode) setHeroMode('document'); } },
    { id: 'shopping', label: 'Siparişlerim', icon: ShoppingBag, action: () => router.push('/orders') },
    { id: 'favorites', label: 'Favoriler', icon: Heart, action: () => router.push('/favorites') },
    { id: 'profile', label: 'Profil', icon: User, action: () => setProfileDropdownOpen(!profileDropdownOpen) },
  ] : [
    { id: 'home', label: 'Ana Sayfa', icon: Home, action: () => { setActiveTab('home'); if (setHeroMode) setHeroMode('shopping'); } },
    { id: 'documents', label: 'Belge', icon: FileText, action: () => { setActiveTab('documents'); if (setHeroMode) setHeroMode('document'); } },
    { id: 'hamburger', label: 'Menü', icon: Menu, action: () => setHamburgerDropdownOpen(!hamburgerDropdownOpen) },
  ];

  const handleNavigation = (item: any) => {
    // Close profile dropdown when navigating to other tabs
    if (item.id !== 'profile') {
      setProfileDropdownOpen(false);
    }
    // Close hamburger dropdown when navigating to other tabs
    if (item.id !== 'hamburger') {
      setHamburgerDropdownOpen(false);
    }
    item.action();
  };

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                    : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Dropdown Menu - Only show for logged in users */}
      {profileDropdownOpen && user && (
        <div className={`fixed bottom-16 left-4 right-4 z-50 rounded-lg shadow-xl border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
          <button
            onClick={() => {
              router.push('/profile');
              setProfileDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </div>
          </button>
          <button
            onClick={() => {
              router.push('/deliveries');
              setProfileDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Teslimatlarım
            </div>
          </button>
          <button
            onClick={() => {
              if (logout) logout();
              setProfileDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 last:rounded-b-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </div>
          </button>
        </div>
      )}

      {/* Hamburger Dropdown Menu - Only show for non-logged in users */}
      {hamburgerDropdownOpen && !user && (
        <div className={`fixed bottom-16 left-4 right-4 z-50 rounded-lg shadow-xl border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
          <button
            onClick={() => {
              router.push('/auth/register?type=customer');
              setHamburgerDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Kayıt Ol
            </div>
          </button>
          <div className={`border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}></div>
          <button
            onClick={() => {
              router.push('/auth/login?type=customer');
              setHamburgerDropdownOpen(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 last:rounded-b-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Giriş Yap
            </div>
          </button>
        </div>
      )}
    </>
  );
}