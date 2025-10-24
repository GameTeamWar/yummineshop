import React, { useState } from 'react';
import { ShoppingBag, Package, Heart, User, X } from 'lucide-react';
import { FaMotorcycle } from 'react-icons/fa';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
}

export default function MobileNavigation({ activeTab, setActiveTab, darkMode }: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (id === 'profile' || id === 'orders') {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
    }
  };

  return (
    <>
      <nav className={`fixed bottom-0 left-0 right-0 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-t`}>
        <div className="w-full mx-auto px-4">
          <div className="flex justify-around">
            {[
              { id: 'home', icon: ShoppingBag, label: 'Mağazalar' },
              { id: 'favorites', icon: Heart, label: 'Favoriler' },
              { id: 'deliveries', icon: FaMotorcycle, label: 'Teslimatlarım' },
              { id: 'orders', icon: Package, label: 'Siparişler' },
              { id: 'profile', icon: User, label: 'Profil' }
            ].map(item => (
              <button key={item.id} onClick={() => handleTabClick(item.id)} className={`flex flex-col items-center gap-1 py-2 px-3 sm:py-3 sm:px-4 transition-colors duration-300 text-xs sm:text-sm ${activeTab === item.id ? (darkMode ? 'text-white' : 'text-neutral-950') : (darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950')}`}>
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      {isDrawerOpen && (
        <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-2xl transform transition-transform duration-300 translate-y-0 z-50`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{activeTab === 'profile' ? 'Profil' : 'Siparişler'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            <ul className="space-y-2">
              {activeTab === 'profile' ? (
                <>
                  <li className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">Hesap Ayarları</li>
                  <li className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">Adreslerim</li>
                  <li className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">Çıkış</li>
                </>
              ) : (
                <>
                  <li className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">Mevcut Siparişler</li>
                  <li className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">Geçmiş Siparişler</li>
                  <li className="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">İptal Edilen Siparişler</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
