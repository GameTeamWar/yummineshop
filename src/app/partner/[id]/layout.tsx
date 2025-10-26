'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Home, Store, Truck, Settings, LogOut } from 'lucide-react';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  useEffect(() => {
    if (!user || (role !== 1 && role !== 3)) {
      router.push('/auth/login?type=partner');
    }
  }, [user, role, router]);

  if (!user || (role !== 1 && role !== 3)) {
    return null;
  }

  const isStore = role === 1;
  const sidebarItems = [
    {
      name: 'Dashboard',
      href: `/partner/${partnerId}/dashboard`,
      icon: Home,
    },
    ...(isStore ? [{
      name: 'Mağaza',
      href: `/partner/${partnerId}/shop`,
      icon: Store,
    }] : []),
    {
      name: 'Kurye',
      href: `/partner/${partnerId}/kuryemaaskısmı`,
      icon: Truck,
    },
    {
      name: 'Ayarlar',
      href: `/partner/${partnerId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white">Yummine Partner</h2>
          <p className="text-gray-400 text-sm mt-1">ID: {partnerId}</p>
        </div>
        <nav className="mt-6">
          <div className="px-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={() => router.push('/auth/login')}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Çıkış
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}