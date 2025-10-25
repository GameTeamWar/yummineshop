'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/store/navigations/Header';
import {
  User,
  Package,
  Star,
  Heart,
  MapPin,
  Truck,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  category: 'account' | 'orders';
}

const sidebarItems: SidebarItem[] = [
  // Hesabım kategorisi
  {
    id: 'reviews',
    label: 'Değerlendirmelerim',
    href: '/store/myaccount/reviews',
    icon: <Star className="w-5 h-5" />,
    category: 'account'
  },
  {
    id: 'favorites',
    label: 'Favorilerim',
    href: '/store/myaccount/favorites',
    icon: <Heart className="w-5 h-5" />,
    category: 'account'
  },
  {
    id: 'addresses',
    label: 'Adreslerim',
    href: '/store/myaccount/addresses',
    icon: <MapPin className="w-5 h-5" />,
    category: 'account'
  },
  // Siparişlerim kategorisi
  {
    id: 'orders',
    label: 'Siparişlerim',
    href: '/store/myaccount/orders',
    icon: <Package className="w-5 h-5" />,
    category: 'orders'
  },
  {
    id: 'deliveries',
    label: 'Teslimatlarım',
    href: '/store/myaccount/deliveries',
    icon: <Truck className="w-5 h-5" />,
    category: 'orders'
  }
];

interface MyAccountLayoutProps {
  children: React.ReactNode;
}

const MyAccountLayout: React.FC<MyAccountLayoutProps> = ({ children }) => {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    account: true,
    orders: true
  });
  // Header states
  const [searchQuery, setSearchQuery] = useState('');
  const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
    };
    fetchUserData();
  }, [user]);

  // Save darkMode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActiveItem = (href: string) => {
    return pathname === href;
  };

  const accountItems = sidebarItems.filter(item => item.category === 'account');
  const ordersItems = sidebarItems.filter(item => item.category === 'orders');

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        heroMode={'shopping'}
        setHeroMode={() => {}}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartSidebarOpen={cartSidebarOpen}
        setCartSidebarOpen={setCartSidebarOpen}
        showAddAddressModal={showAddAddressModal}
        setShowAddAddressModal={setShowAddAddressModal}
        showHowItWorksModal={showHowItWorksModal}
        setShowHowItWorksModal={setShowHowItWorksModal}
        isMobile={isMobile}
        cart={cart}
        cartTotal={cartTotal}
        setCart={setCart}
        setCartTotal={setCartTotal}
      />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <div className="w-80 shrink-0">
            <div className={`h-full min-h-[calc(100vh-80px)] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-xl`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <User className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData?.firstName && userData?.lastName 
                        ? `${userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()} ${userData.lastName.charAt(0).toUpperCase() + userData.lastName.slice(1).toLowerCase()}` 
                        : 'Hesabım'}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1">
                {/* Hesabım Kategorisi */}
                <div className="mb-8">
                  <button
                    onClick={() => toggleCategory('account')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Hesabım</span>
                    </div>
                    {expandedCategories.account ? (
                      <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </button>

                  {expandedCategories.account && (
                    <div className="ml-8 mt-2 space-y-1">
                      {accountItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => router.push(item.href)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            isActiveItem(item.href)
                              ? `${darkMode ? 'bg-blue-900/40 text-blue-300 border-l-4 border-blue-400' : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'}`
                              : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                          }`}
                        >
                          <span className={isActiveItem(item.href) ? `${darkMode ? 'text-blue-300' : 'text-blue-600'}` : 'opacity-70'}>
                            {item.icon}
                          </span>
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Siparişlerim Kategorisi */}
                <div>
                  <button
                    onClick={() => toggleCategory('orders')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Siparişlerim</span>
                    </div>
                    {expandedCategories.orders ? (
                      <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </button>

                  {expandedCategories.orders && (
                    <div className="ml-8 mt-2 space-y-1">
                      {ordersItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => router.push(item.href)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            isActiveItem(item.href)
                              ? `${darkMode ? 'bg-blue-900/40 text-blue-300 border-l-4 border-blue-400' : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'}`
                              : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                          }`}
                        >
                          <span className={isActiveItem(item.href) ? `${darkMode ? 'text-blue-300' : 'text-blue-600'}` : 'opacity-70'}>
                            {item.icon}
                          </span>
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`${isMobile ? 'w-full' : 'flex-1'} p-8`}>
          {children}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => router.push('/store/myaccount')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                pathname === '/store/myaccount'
                  ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                  : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              <User className={`w-5 h-5 mb-1 transition-transform duration-200 ${pathname === '/store/myaccount' ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">Hesabım</span>
            </button>
            <button
              onClick={() => router.push('/store/myaccount/orders')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                pathname === '/store/myaccount/orders'
                  ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                  : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              <Package className={`w-5 h-5 mb-1 transition-transform duration-200 ${pathname === '/store/myaccount/orders' ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">Siparişler</span>
            </button>
            <button
              onClick={() => router.push('/store/myaccount/addresses')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                pathname === '/store/myaccount/addresses'
                  ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                  : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              <MapPin className={`w-5 h-5 mb-1 transition-transform duration-200 ${pathname === '/store/myaccount/addresses' ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">Adresler</span>
            </button>
            <button
              onClick={() => router.push('/store/myaccount/favorites')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                pathname === '/store/myaccount/favorites'
                  ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                  : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              <Heart className={`w-5 h-5 mb-1 transition-transform duration-200 ${pathname === '/store/myaccount/favorites' ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">Favoriler</span>
            </button>
            <button
              onClick={() => router.push('/store/myaccount/reviews')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                pathname === '/store/myaccount/reviews'
                  ? `text-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`
                  : `text-gray-500 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
            >
              <Star className={`w-5 h-5 mb-1 transition-transform duration-200 ${pathname === '/store/myaccount/reviews' ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">Yorumlar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccountLayout;