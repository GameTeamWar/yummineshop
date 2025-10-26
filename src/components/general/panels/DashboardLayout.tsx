'use client';

import React, { useState } from 'react';
import Header from '@/components/general/panels/header';
import Sidebar from '@/components/general/panels/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
  title = "Dashboard",
  subtitle = "Yönetim Paneli"
}) => {
  const { user, role } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Ana Sayfa',
        href: '/',
        icon: Home,
        current: false
      },
      {
        name: 'Profil',
        href: '/profile',
        icon: User,
        current: true
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
            current: false
          },
          {
            name: 'Mağazalar',
            href: '/admin/stores',
            icon: Store,
            current: false
          },
          {
            name: 'Kullanıcılar',
            href: '/admin/users',
            icon: Users,
            current: false
          },
          {
            name: 'Siparişler',
            href: '/admin/orders',
            icon: Package,
            current: false
          },
          {
            name: 'Konumlar',
            href: '/admin/locations',
            icon: MapPin,
            current: false
          }
        ];
      case 1: // Mağaza
        return [
          ...baseItems,
          {
            name: 'Mağaza',
            href: '/partner',
            icon: Store,
            current: false
          },
          {
            name: 'Ürünler',
            href: '/partner/products',
            icon: Package,
            current: false
          },
          {
            name: 'Siparişler',
            href: '/partner/orders',
            icon: ShoppingBag,
            current: false
          }
        ];
      case 2: // Müşteri
        return [
          ...baseItems,
          {
            name: 'Mağazalar',
            href: '/store',
            icon: Store,
            current: false
          },
          {
            name: 'Siparişlerim',
            href: '/store/myaccount/orders',
            icon: ShoppingBag,
            current: false
          },
          {
            name: 'Favoriler',
            href: '/store/favorites',
            icon: CreditCard,
            current: false
          }
        ];
      case 3: // Kurye
        return [
          ...baseItems,
          {
            name: 'Teslimatlar',
            href: '/courier/deliveries',
            icon: Truck,
            current: false
          },
          {
            name: 'Siparişler',
            href: '/courier/orders',
            icon: Package,
            current: false
          }
        ];
      default:
        return baseItems;
    }
  };

  const navigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Full width at top */}
      <Header
        title={title}
        subtitle={subtitle}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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