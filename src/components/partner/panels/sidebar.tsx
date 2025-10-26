import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Store, Settings, LogOut, Filter, Folder, BarChart3, Package, Building2, Users, Tag, Percent, UserCheck, ChevronDown, ChevronRight, Star, TrendingUp, Clock, CreditCard, User, Menu, X } from 'lucide-react';
import { FaTshirt } from "react-icons/fa";
import { TbCategory2,TbTableOptions  } from "react-icons/tb";

interface PartnerSidebarProps {
  onClose?: () => void;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ onClose }) => {
  const params = useParams();
  const pathname = usePathname();
  const partnerId = params.id as string;
  const [isProductManagementOpen, setIsProductManagementOpen] = useState(false);
  const [isSalesManagementOpen, setIsSalesManagementOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

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

  // Aktif sayfaya göre menüleri otomatik aç
  useEffect(() => {
    const orderPages = ['active-orders', 'past-orders', 'cancelled-orders', 'refund-orders'];
        const productPages = ['urun', 'categories', 'options', 'tags', 'filters'];
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

  return (
    <div className="flex flex-col h-full">
      {/* Restaurant Info Section */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
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
            className={getMenuButtonClasses(isProductManagementOpen, ['urun', 'categories', 'options', 'tags', 'filters'], "hover:bg-gray-700")}
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
                href={`/partner/${partnerId}/urun`}
                className={getSubLinkClasses(`/partner/${partnerId}/urun`, "hover:bg-gray-700")}
              >
                <Store className="mr-3 h-4 w-4" />
                <span>Ürün</span>
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
        <div className="border-t border-gray-700 bg-gray-800/30">
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
  );
};

export default PartnerSidebar;