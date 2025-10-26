'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Settings, LogOut, Filter, Folder, BarChart3, Package, Building2, Users, Tag, Percent, UserCheck, ChevronDown, ChevronRight, Star, TrendingUp, Clock, CreditCard, User, Menu, X } from 'lucide-react';
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
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Aktif link kontrolü
  const isActive = (href: string) => {
    return pathname === href;
  };

  // Grup aktif link kontrolü (alt linklerden biri aktifse)
  const isGroupActive = (groupPages: string[]) => {
    return groupPages.some(page => pathname.includes(page));
  };

  // Ana menü butonları için aktif link stilleri
  const getMenuButtonClasses = (isOpen: boolean, groupPages: string[], hoverClasses: string) => {
    const baseClasses = "flex items-center w-full px-5 py-4 rounded-xl text-base font-semibold transition-all duration-200 group hover:shadow-lg";
    const activeClasses = "bg-blue-600/30 text-blue-400 border-blue-500/50 shadow-lg";
    const inactiveClasses = `text-gray-300 ${hoverClasses} border border-transparent hover:border-opacity-30`;

    const isActiveGroup = isGroupActive(groupPages);
    return isActiveGroup || isOpen
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  // Aktif link stilleri - Ana linkler için
  const getLinkClasses = (href: string, hoverClasses: string) => {
    const baseClasses = "flex items-center px-5 py-4 rounded-xl text-base font-semibold transition-all duration-200 group hover:shadow-lg";
    const activeClasses = "bg-blue-600/30 text-blue-400 border-blue-500/50 shadow-lg";
    const inactiveClasses = `text-gray-300 ${hoverClasses} border border-transparent hover:border-opacity-30`;

    return isActive(href)
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  // Aktif link stilleri - Alt linkler için
  const getSubLinkClasses = (href: string, hoverClasses: string) => {
    const baseClasses = "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group";
    const activeClasses = "bg-blue-600/20 text-blue-300 border-blue-500/30";
    const inactiveClasses = `text-gray-400 ${hoverClasses} border border-transparent hover:border-opacity-30`;

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

  // Aktif sayfaya göre menüleri otomatik aç
  useEffect(() => {
    const orderPages = ['active-orders', 'past-orders', 'cancelled-orders', 'refund-orders'];
    const productPages = ['menu', 'categories', 'options', 'tags', 'filters'];
    const salesPages = ['discounts', 'customers', 'reviews'];
    const userPages = ['sub-users', 'roles'];

    if (orderPages.some(page => pathname.includes(page))) {
      setIsOrdersOpen(true);
    }
    if (productPages.some(page => pathname.includes(page))) {
      setIsProductManagementOpen(true);
    }
    if (salesPages.some(page => pathname.includes(page))) {
      setIsSalesManagementOpen(true);
    }
    if (userPages.some(page => pathname.includes(page))) {
      setIsUserManagementOpen(true);
    }
  }, [pathname]);

  if (!user || (role !== 1 && role !== 3)) {
    return null;
  }

  const isStore = role === 1;

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 text-white dark:text-white flex flex-col">
      {/* Header */}
      <Header title="Yummine" subtitle="Partner Paneli" onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`bg-linear-to-b from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 shadow-xl border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72' : 'w-0 lg:w-72'
        } fixed lg:relative top-16 lg:top-0 left-0 z-50 lg:z-auto overflow-hidden`}>
          {/* Restaurant Info Section */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Menüyü Kapat"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Mağaza Adı</h3>
                  <p className="text-xs text-gray-400">ID: {partnerId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/partner/${partnerId}/settings`}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                  title="Mağaza Ayarları"
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
         
          <nav className="mt-6 flex-1 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 max-h-[calc(100vh-180px)] flex flex-col">
            <div className="flex-1">
              {/* Sipariş Yönetimi */}
              <button
                onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                className={getMenuButtonClasses(isOrdersOpen, ['active-orders', 'past-orders', 'cancelled-orders', 'refund-orders'], "hover:bg-gray-700")}
              >
                <Package className="mr-3 h-5 w-5" />
                <span>Sipariş Yönetimi</span>
                {isOrdersOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
              {isOrdersOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/active-orders`}
                    className={getSubLinkClasses(`/partner/${partnerId}/active-orders`, "hover:bg-gray-700")}
                  >
                    <Clock className="mr-3 h-4 w-4" />
                    <span>Aktif Siparişler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/past-orders`}
                    className={getSubLinkClasses(`/partner/${partnerId}/past-orders`, "hover:bg-gray-700")}
                  >
                    <TrendingUp className="mr-3 h-4 w-4" />
                    <span>Geçmiş Siparişler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/cancelled-orders`}
                    className={getSubLinkClasses(`/partner/${partnerId}/cancelled-orders`, "hover:bg-gray-700")}
                  >
                    <CreditCard className="mr-3 h-4 w-4" />
                    <span>İptal Edilenler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/refund-orders`}
                    className={getSubLinkClasses(`/partner/${partnerId}/refund-orders`, "hover:bg-gray-700")}
                  >
                    <Percent className="mr-3 h-4 w-4" />
                    <span>İade Siparişleri</span>
                  </Link>
                </div>
              )}

              {/* Ürün Yönetimi */}
              <button
                onClick={() => setIsProductManagementOpen(!isProductManagementOpen)}
                className={getMenuButtonClasses(isProductManagementOpen, ['menu', 'categories', 'options', 'tags', 'filters'], "hover:bg-gray-700")}
              >
                <FaTshirt className="mr-3 h-5 w-5" />
                <span>Ürün Yönetimi</span>
                {isProductManagementOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
              {isProductManagementOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/menu`}
                    className={getSubLinkClasses(`/partner/${partnerId}/menu`, "hover:bg-gray-700")}
                  >
                    <Store className="mr-3 h-4 w-4" />
                    <span>Menü</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/categories`}
                    className={getSubLinkClasses(`/partner/${partnerId}/categories`, "hover:bg-gray-700")}
                  >
                    <TbCategory2 className="mr-3 h-4 w-4" />
                    <span>Kategoriler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/options`}
                    className={getSubLinkClasses(`/partner/${partnerId}/options`, "hover:bg-gray-700")}
                  >
                    <TbTableOptions className="mr-3 h-4 w-4" />
                    <span>Seçenekler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/tags`}
                    className={getSubLinkClasses(`/partner/${partnerId}/tags`, "hover:bg-gray-700")}
                  >
                    <Tag className="mr-3 h-4 w-4" />
                    <span>Etiketler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/filters`}
                    className={getSubLinkClasses(`/partner/${partnerId}/filters`, "hover:bg-gray-700")}
                  >
                    <Filter className="mr-3 h-4 w-4" />
                    <span>Filtreler</span>
                  </Link>
                </div>
              )}

              {/* Satış Yönetimi */}
              <button
                onClick={() => setIsSalesManagementOpen(!isSalesManagementOpen)}
                className={getMenuButtonClasses(isSalesManagementOpen, ['discounts', 'customers', 'reviews'], "hover:bg-gray-700")}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                <span>Satış Yönetimi</span>
                {isSalesManagementOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
              {isSalesManagementOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/discounts`}
                    className={getSubLinkClasses(`/partner/${partnerId}/discounts`, "hover:bg-gray-700")}
                  >
                    <Percent className="mr-3 h-4 w-4" />
                    <span>İndirimler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/customers`}
                    className={getSubLinkClasses(`/partner/${partnerId}/customers`, "hover:bg-gray-700")}
                  >
                    <Users className="mr-3 h-4 w-4" />
                    <span>Müşteriler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/reviews`}
                    className={getSubLinkClasses(`/partner/${partnerId}/reviews`, "hover:bg-gray-700")}
                  >
                    <Star className="mr-3 h-4 w-4" />
                    <span>Yorumlar</span>
                  </Link>
                </div>
              )}

              {/* Kullanıcı Yönetimi */}
              <button
                onClick={() => setIsUserManagementOpen(!isUserManagementOpen)}
                className={getMenuButtonClasses(isUserManagementOpen, ['sub-users', 'roles'], "hover:bg-gray-700")}
              >
                <User className="mr-3 h-5 w-5" />
                <span>Kullanıcı Yönetimi</span>
                {isUserManagementOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
              {isUserManagementOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/sub-users`}
                    className={getSubLinkClasses(`/partner/${partnerId}/sub-users`, "hover:bg-gray-700")}
                  >
                    <UserCheck className="mr-3 h-4 w-4" />
                    <span>Alt Kullanıcılar</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/roles`}
                    className={getSubLinkClasses(`/partner/${partnerId}/roles`, "hover:bg-gray-700")}
                  >
                    <UserCheck className="mr-3 h-4 w-4" />
                    <span>Roller</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mağaza Açık/Kapalı Durumu */}
            <div className="border-t border-gray-700 bg-gray-800/30 mt-2">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-200">Mağaza Durumu</span>
                  </div>
                  <button
                    onClick={() => setIsStoreOpen(!isStoreOpen)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      isStoreOpen ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        isStoreOpen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={`text-sm font-semibold ${isStoreOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {isStoreOpen ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">09:00 - 22:00</span>
                </div>
              </div>
            </div>
          </nav>

        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full min-h-[calc(100vh-4rem)] lg:mx-7 mt-5">
          <main className={`flex-1 w-full min-h-full ${isSidebarOpen ? 'p-1 sm:p-3 lg:p-6' : 'p-1'}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700 bg-gray-800 lg:hidden">
        <div className="flex items-center justify-around py-2">
          <Link
            href={`/partner/${partnerId}/active-orders`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              pathname.includes('orders')
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Siparişler</span>
          </Link>

          <Link
            href={`/partner/${partnerId}/menu`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              pathname.includes('menu') || pathname.includes('categories') || pathname.includes('options')
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Store className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Menü</span>
          </Link>

          <Link
            href={`/partner/${partnerId}/stats`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              pathname.includes('stats')
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">İstatistik</span>
          </Link>

          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              isMobileDrawerOpen
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Menü</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer - Slide up from bottom */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl shadow-xl border border-gray-700 bg-gray-800">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Partner Menüsü</h3>
                <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 rounded hover:bg-gray-700 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Sipariş Yönetimi */}
              <div className="space-y-2">
                <div className="flex items-center p-3">
                  <Package className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-white font-medium">Sipariş Yönetimi</span>
                </div>
                <div className="ml-8 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/active-orders`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Aktif Siparişler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/past-orders`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Geçmiş Siparişler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/cancelled-orders`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">İptal Edilenler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/refund-orders`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Percent className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">İade Siparişleri</span>
                  </Link>
                </div>
              </div>

              {/* Ürün Yönetimi */}
              <div className="space-y-2">
                <div className="flex items-center p-3">
                  <FaTshirt className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-white font-medium">Ürün Yönetimi</span>
                </div>
                <div className="ml-8 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/menu`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Store className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Menü</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/categories`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <TbCategory2 className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Kategoriler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/options`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <TbTableOptions className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Seçenekler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/tags`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Etiketler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/filters`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Filtreler</span>
                  </Link>
                </div>
              </div>

              {/* Satış Yönetimi */}
              <div className="space-y-2">
                <div className="flex items-center p-3">
                  <BarChart3 className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-white font-medium">Satış Yönetimi</span>
                </div>
                <div className="ml-8 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/discounts`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Percent className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">İndirimler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/customers`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Müşteriler</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/reviews`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <Star className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Yorumlar</span>
                  </Link>
                </div>
              </div>

              {/* Kullanıcı Yönetimi */}
              <div className="space-y-2">
                <div className="flex items-center p-3">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-white font-medium">Kullanıcı Yönetimi</span>
                </div>
                <div className="ml-8 space-y-1">
                  <Link
                    href={`/partner/${partnerId}/sub-users`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Alt Kullanıcılar</span>
                  </Link>
                  <Link
                    href={`/partner/${partnerId}/roles`}
                    className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-300 text-sm">Roller</span>
                  </Link>
                </div>
              </div>

              {/* Ayarlar */}
              <Link
                href={`/partner/${partnerId}/settings`}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3 text-gray-400" />
                <span className="text-white">Ayarlar</span>
              </Link>

              {/* Profil */}
              <Link
                href={`/partner/${partnerId}/profile`}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span className="text-white">Profil</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}