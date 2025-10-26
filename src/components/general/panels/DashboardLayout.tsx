'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/general/panels/header';
import Sidebar from '@/components/general/panels/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  User,
  ShoppingBag,
  Truck,
  Settings,
  BarChart3,
  Store,
  Users,
  MapPin,
  Package,
  CreditCard
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const { user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rol bazlı varsayılan title ve subtitle
  const getDefaultTitle = () => {
    switch (role) {
      case 0: return "Admin Paneli";
      case 1: return "Mağaza Paneli";
      case 2: return "Müşteri Paneli";
      case 3: return "Kurye Paneli";
      default: return "Dashboard";
    }
  };

  const getDefaultSubtitle = () => {
    switch (role) {
      case 0: return "Sistem yönetimi ve istatistikler";
      case 1: return "Mağaza yönetimi ve siparişler";
      case 2: return "Alışveriş ve sipariş takibi";
      case 3: return "Teslimat yönetimi";
      default: return "Yönetim Paneli";
    }
  };

  const displayTitle = title || getDefaultTitle();
  const displaySubtitle = subtitle || getDefaultSubtitle();

  // Rol bazlı tema renkleri
  const getRoleTheme = () => {
    switch (role) {
      case 0: // Admin - Kırmızı/Mavi tonları
        return {
          active: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
          hover: 'hover:bg-red-50 dark:hover:bg-red-900/50'
        };
      case 1: // Mağaza - Yeşil tonları
        return {
          active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
          hover: 'hover:bg-green-50 dark:hover:bg-green-900/50'
        };
      case 2: // Müşteri - Mavi tonları
        return {
          active: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
          hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/50'
        };
      case 3: // Kurye - Turuncu tonları
        return {
          active: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
          hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/50'
        };
      default:
        return {
          active: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
          hover: 'hover:bg-gray-100 dark:hover:bg-gray-700'
        };
    }
  };

  // Rol bazlı badge ve bilgiler
  const getRoleInfo = () => {
    switch (role) {
      case 0: return { name: 'Admin', color: 'bg-red-500', icon: Settings };
      case 1: return { name: 'Mağaza Sahibi', color: 'bg-green-500', icon: Store };
      case 2: return { name: 'Müşteri', color: 'bg-blue-500', icon: User };
      case 3: return { name: 'Kurye', color: 'bg-orange-500', icon: Truck };
      default: return { name: 'Kullanıcı', color: 'bg-gray-500', icon: User };
    }
  };

  const roleInfo = getRoleInfo();
  const theme = getRoleTheme();

  const getNavigationItems = useMemo(() => {
    // Aktif sayfa kontrolü
    const isActive = (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    };

    const baseItems = [
      {
        name: 'Ana Sayfa',
        href: '/',
        icon: Home,
        current: isActive('/')
      },
      {
        name: 'Profil',
        href: '/profile',
        icon: User,
        current: isActive('/profile')
      }
    ];

    switch (role) {
      case 0: // Admin
        return [
          ...baseItems,
          {
            name: 'İstatistikler',
            href: '/admin/stats',
            icon: BarChart3,
            current: isActive('/admin/stats')
          },
          {
            name: 'Mağazalar',
            href: '/admin/stores',
            icon: Store,
            current: isActive('/admin/stores')
          },
          {
            name: 'Kullanıcılar',
            href: '/admin/users',
            icon: Users,
            current: isActive('/admin/users')
          },
          {
            name: 'Siparişler',
            href: '/admin/orders',
            icon: Package,
            current: isActive('/admin/orders')
          },
          {
            name: 'Konumlar',
            href: '/admin/locations',
            icon: MapPin,
            current: isActive('/admin/locations')
          }
        ];
      case 1: // Mağaza Sahibi
        return [
          ...baseItems,
          {
            name: 'Mağaza Yönetimi',
            href: '/partners',
            icon: Store,
            current: isActive('/partners') || isActive('/partner')
          },
          {
            name: 'Ürün Yönetimi',
            href: '/partner/products',
            icon: Package,
            current: isActive('/partner/products') || isActive('/partner/menu') || isActive('/partner/categories')
          },
          {
            name: 'Sipariş Yönetimi',
            href: '/partner/orders',
            icon: ShoppingBag,
            current: isActive('/partner/orders') || isActive('/partner/active-orders') || isActive('/partner/past-orders')
          },
          {
            name: 'İstatistikler',
            href: '/partner/stats',
            icon: BarChart3,
            current: isActive('/partner/stats')
          }
        ];
      case 2: // Müşteri
        return [
          ...baseItems,
          {
            name: 'Mağazalar',
            href: '/store',
            icon: Store,
            current: isActive('/store') && !isActive('/store/myaccount') && !isActive('/store/favorites')
          },
          {
            name: 'Siparişlerim',
            href: '/store/myaccount/orders',
            icon: ShoppingBag,
            current: isActive('/store/myaccount/orders')
          },
          {
            name: 'Favoriler',
            href: '/store/favorites',
            icon: CreditCard,
            current: isActive('/store/favorites')
          },
          {
            name: 'Hesabım',
            href: '/store/myaccount',
            icon: User,
            current: isActive('/store/myaccount') && !isActive('/store/myaccount/orders')
          }
        ];
      case 3: // Kurye
        return [
          ...baseItems,
          {
            name: 'Teslimatlar',
            href: '/courier/deliveries',
            icon: Truck,
            current: isActive('/courier/deliveries')
          },
          {
            name: 'Siparişler',
            href: '/courier/orders',
            icon: Package,
            current: isActive('/courier/orders')
          },
          {
            name: 'İstatistikler',
            href: '/courier/stats',
            icon: BarChart3,
            current: isActive('/courier/stats')
          }
        ];
      default:
        return baseItems;
    }
  }, [role, pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Full width at top */}
      <Header
        title={displayTitle}
        subtitle={displaySubtitle}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          {/* Rol Bilgisi */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${roleInfo.color} flex items-center justify-center`}>
                <roleInfo.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.profile?.displayName || user?.email || 'Kullanıcı'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{roleInfo.name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 p-4">
            {getNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? theme.active
                      : `text-gray-700 dark:text-gray-300 ${theme.hover}`
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              );
            })}
          </div>
        </Sidebar>

        {/* Page content */}
        <main className="flex-1 lg:ml-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;