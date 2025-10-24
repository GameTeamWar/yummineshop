import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield, ShoppingCart, Users } from 'lucide-react';
import ShoppingSection from './store/ShoppingSection';
import DocumentSection from './doc/DocumentSection';
import Header from './Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import HowItWorksModal from './modals/HowItWorksModal';
import HeroSection from './hero/HeroSection';

export default function Yummine() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true);
  const [heroMode, setHeroMode] = useState('shopping');
  const [isMobile, setIsMobile] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-neutral-950'}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        heroMode={heroMode}
        setHeroMode={setHeroMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartSidebarOpen={cartSidebarOpen}
        setCartSidebarOpen={setCartSidebarOpen}
        showAddAddressModal={showAddAddressModal}
        setShowAddAddressModal={setShowAddAddressModal}
        showHowItWorksModal={showHowItWorksModal}
        setShowHowItWorksModal={setShowHowItWorksModal}
      />

      {/* Hero Section */}
      {!user && <HeroSection darkMode={darkMode} heroMode={heroMode} setHeroMode={setHeroMode} onHowItWorksClick={() => setShowHowItWorksModal(true)} router={router} />}

      {/* Content - Changes based on heroMode */}
      {heroMode === 'shopping' ? (
        <ShoppingSection darkMode={darkMode} searchQuery={searchQuery} />
      ) : (
        user && <DocumentSection darkMode={darkMode} user={user} />
      )}

      {/* How It Works Modal */}
      <HowItWorksModal
        darkMode={darkMode}
        showHowItWorksModal={showHowItWorksModal}
        setShowHowItWorksModal={setShowHowItWorksModal}
        router={router}
      />

      {/* Bottom Navigation - Only show on mobile */}
      {isMobile && (
        <nav className={`fixed bottom-0 left-0 right-0 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-t`}>
          <div className="w-full mx-auto px-4">
            <div className="flex justify-around">
              {[
                { id: 'home', icon: ShoppingBag, label: 'Mağazalar' },
                { id: 'orders', icon: Package, label: 'Siparişler' },
                { id: 'favorites', icon: Heart, label: 'Favoriler' },
                { id: 'profile', icon: User, label: 'Profil' }
              ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 py-2 px-3 sm:py-3 sm:px-4 transition-colors duration-300 text-xs sm:text-sm ${activeTab === item.id ? (darkMode ? 'text-white' : 'text-neutral-950') : (darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950')}`}>
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}