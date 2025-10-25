import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Search, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield, ShoppingCart, Users } from 'lucide-react';
import ShoppingSection from './store/ShoppingSection';
import DocumentSection from './doc/DocumentSection';
import Header from './navigations/Header';
import MobileNavigation from './navigations/MobileNavigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import HowItWorksModal from './modals/HowItWorksModal';
import HeroSection from './hero/HeroSection';

export default function Yummine() {
  const [darkMode, setDarkMode] = useState(true);
  const [heroMode, setHeroMode] = useState('shopping');
  const [activeTab, setActiveTab] = useState(heroMode === 'document' ? 'documents' : 'home');
  const [isMobile, setIsMobile] = useState(false);
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage when it changes
  const handleDarkModeToggle = (newDarkMode: boolean) => {
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update activeTab when heroMode changes
  useEffect(() => {
    setActiveTab(heroMode === 'document' ? 'documents' : 'home');
  }, [heroMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-neutral-950'}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={handleDarkModeToggle}
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
        isMobile={isMobile}
      />

      {/* Hero Section */}
      {!user && <HeroSection darkMode={darkMode} heroMode={heroMode} setHeroMode={setHeroMode} onHowItWorksClick={() => setShowHowItWorksModal(true)} router={router} />}

      {/* Content - Changes based on heroMode */}
      {heroMode === 'shopping' ? (
        <ShoppingSection darkMode={darkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isMobile={isMobile} />
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
      {isMobile && <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} user={user} logout={logout} heroMode={heroMode} setHeroMode={setHeroMode} />}
    </div>
  );
}