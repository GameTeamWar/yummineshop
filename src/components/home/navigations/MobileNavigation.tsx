import React from 'react';
import { Home, ShoppingBag, FileText, User, Heart } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
}

export default function MobileNavigation({ activeTab, setActiveTab, darkMode }: MobileNavigationProps) {
  const navItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'shopping', label: 'Alışveriş', icon: ShoppingBag },
    { id: 'documents', label: 'Belge', icon: FileText },
    { id: 'favorites', label: 'Favoriler', icon: Heart },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
  );
}