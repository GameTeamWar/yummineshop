'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Store, Settings, LogOut, Filter, Folder, BarChart3, Package, Building2, Users, Tag, Percent, UserCheck, ChevronDown, ChevronRight, Star, TrendingUp, Clock, CreditCard, User, Menu } from 'lucide-react';
import { FaTshirt } from "react-icons/fa";
import { TbCategory2,TbTableOptions  } from "react-icons/tb";
import Header from '@/components/general/panels/header';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const partnerId = params.id as string;
  const [isProductManagementOpen, setIsProductManagementOpen] = useState(false);
  const [isSalesManagementOpen, setIsSalesManagementOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Aktif link kontrolü
  const isActive = (href: string) => {
    return pathname === href;
  };

  // Aktif link stilleri
  const getLinkClasses = (href: string, hoverClasses: string) => {
    const baseClasses = "flex items-center px-5 py-4 rounded-xl text-base font-semibold transition-all duration-200 group hover:shadow-lg";
    const activeClasses = "bg-blue-600/30 text-blue-400 border-blue-500/50 shadow-lg";
    const inactiveClasses = `text-gray-300 ${hoverClasses} border border-transparent hover:border-opacity-30`;

    return isActive(href)
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  useEffect(() => {
    if (!user || (role !== 1 && role !== 3)) {
      router.push('/auth/login?type=partner');
    }
  }, [user, role, router]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || (role !== 1 && role !== 3)) {
    return null;
  }

  const isStore = role === 1;

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 text-white dark:text-white flex flex-col">
      {/* Header - Geçici olarak kaldırıldı */}
      {/* <Header title="Yummine" subtitle="Partner Paneli" /> */}

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 shadow-xl border-r border-gray-700 flex flex-col h-screen">
          {/* Restaurant Info Section */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Restoran Adı</h3>
                  <p className="text-xs text-gray-400">ID: {partnerId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/partner/${partnerId}/settings`}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                  title="Restoran Ayarları"
                >
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </Link>
                <div className="relative user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                    title="Kullanıcı Menüsü"
                  >
                    <Menu className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute left-full ml-2 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                      <Link
                        href={`/partner/${partnerId}/profile`}
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push('/auth/login');
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-700 hover:text-white transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Çıkış</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
         
          <nav className="mt-6 flex-1 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 max-h-[calc(100vh-180px)]">
            {/* Ana İşlemler Bölümü */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Ana İşlemler</h3>
              <div className="space-y-1">
                {/* Siparişlerim */}
                <div>
                  <button
                    onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                    className="flex items-center w-full px-5 py-4 rounded-xl text-base font-semibold text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 border border-transparent hover:border-blue-500/30 transition-all duration-200 group hover:shadow-lg"
                  >
                    {isOrdersOpen ? (
                      <ChevronDown className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    ) : (
                      <ChevronRight className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    )}
                    <Package className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Siparişlerim</span>
                  </button>
                  {isOrdersOpen && (
                    <div className="ml-8 mt-3 space-y-2">
                      <Link
                        href={`/partner/${partnerId}/active-orders`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-blue-600/20 hover:text-blue-300 border border-transparent hover:border-blue-500/30 transition-all duration-200 group"
                      >
                        <Package className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Aktif Siparişler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/past-orders`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-green-600/20 hover:text-green-300 border border-transparent hover:border-green-500/30 transition-all duration-200 group"
                      >
                        <Package className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Geçmiş Siparişler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/cancelled-orders`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-600/20 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-200 group"
                      >
                        <Package className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>İptal Siparişler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/refund-orders`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-yellow-600/20 hover:text-yellow-300 border border-transparent hover:border-yellow-500/30 transition-all duration-200 group"
                      >
                        <Package className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>İade Siparişler</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* İstatistikler */}
                <Link
                  href={`/partner/${partnerId}/statistics`}
                  className={getLinkClasses(`/partner/${partnerId}/statistics`, "hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-500/30")}
                >
                  <BarChart3 className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">İstatistikler</span>
                </Link>

                {/* Alt Kullanıcılar */}
                <Link
                  href={`/partner/${partnerId}/sub-users`}
                  className={getLinkClasses(`/partner/${partnerId}/sub-users`, "hover:bg-orange-600/20 hover:text-orange-400 hover:border-orange-500/30")}
                >
                  <Users className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Alt Kullanıcılar</span>
                </Link>
              </div>
            </div>

            {/* Finans Bölümü */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Finans</h3>
              <div className="space-y-1">
                {/* Ödemeler */}
                <Link
                  href={`/partner/${partnerId}/payments`}
                  className={getLinkClasses(`/partner/${partnerId}/payments`, "hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30")}
                >
                  <CreditCard className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">Ödemeler</span>
                </Link>
              </div>
            </div>

            {/* Yönetim Bölümü */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Yönetim</h3>
              <div className="space-y-1">
                {/* Ürün Yönetimi */}
                <div>
                  <button
                    onClick={() => setIsProductManagementOpen(!isProductManagementOpen)}
                    className="flex items-center w-full px-5 py-4 rounded-xl text-base font-semibold text-gray-300 hover:bg-green-600/20 hover:text-green-400 border border-transparent hover:border-green-500/30 transition-all duration-200 group hover:shadow-lg"
                  >
                    {isProductManagementOpen ? (
                      <ChevronDown className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    ) : (
                      <ChevronRight className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    )}
                    <Store className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Ürün Yönetimi</span>
                  </button>
                  {isProductManagementOpen && (
                    <div className="ml-8 mt-3 space-y-2">
                      <Link
                        href={`/partner/${partnerId}/menu`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-green-600/20 hover:text-green-300 border border-transparent hover:border-green-500/30 transition-all duration-200 group"
                      >
                        <FaTshirt  className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Ürünler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/categories`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-yellow-600/20 hover:text-yellow-300 border border-transparent hover:border-yellow-500/30 transition-all duration-200 group"
                      >
                        <TbCategory2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Kategoriler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/options`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-indigo-600/20 hover:text-indigo-300 border border-transparent hover:border-indigo-500/30 transition-all duration-200 group"
                      >
                        <TbTableOptions  className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Opsiyonlar</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/tags`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-teal-600/20 hover:text-teal-300 border border-transparent hover:border-teal-500/30 transition-all duration-200 group"
                      >
                        <Tag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Etiketler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/filters`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-purple-600/20 hover:text-purple-300 border border-transparent hover:border-purple-500/30 transition-all duration-200 group"
                      >
                        <Filter className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Filtreler</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Satış & Müşteri Yönetimi */}
                <div>
                  <button
                    onClick={() => setIsSalesManagementOpen(!isSalesManagementOpen)}
                    className="flex items-center w-full px-5 py-4 rounded-xl text-base font-semibold text-gray-300 hover:bg-orange-600/20 hover:text-orange-400 border border-transparent hover:border-orange-500/30 transition-all duration-200 group hover:shadow-lg"
                  >
                    {isSalesManagementOpen ? (
                      <ChevronDown className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    ) : (
                      <ChevronRight className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    )}
                    <TrendingUp className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Satış & Müşteri</span>
                  </button>
                  {isSalesManagementOpen && (
                    <div className="ml-8 mt-3 space-y-2">
                      <Link
                        href={`/partner/${partnerId}/discounts`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-600/20 hover:text-red-300 border border-transparent hover:border-red-500/30 transition-all duration-200 group"
                      >
                        <Percent className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>İndirimler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/customers`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-cyan-600/20 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 transition-all duration-200 group"
                      >
                        <UserCheck className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Müşteriler</span>
                      </Link>
                      <Link
                        href={`/partner/${partnerId}/reviews`}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-amber-600/20 hover:text-amber-300 border border-transparent hover:border-amber-500/30 transition-all duration-200 group"
                      >
                        <Star className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span>Değerlendirmeler</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
          
          {/* Footer - Mağaza Durumu */}
          <div className="p-3 border-t border-gray-700 bg-gray-800/50">
            {/* Mağaza Açık/Kapalı Durumu */}
            <div className="p-2 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Mağaza</span>
                </div>
                <button
                  onClick={() => setIsStoreOpen(!isStoreOpen)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                    isStoreOpen ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      isStoreOpen ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs font-medium ${isStoreOpen ? 'text-green-400' : 'text-red-400'}`}>
                  {isStoreOpen ? 'Açık' : 'Kapalı'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                <span>Çalışma Saatleri: 09:00 - 22:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}