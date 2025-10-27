import React, { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Layout from '../../general/panels/layout';
import PartnerSidebar from './sidebar';
import BranchManagementModal from './BranchManagementModal';
import { X, Package, Store, BarChart3, Menu } from 'lucide-react';

interface PartnerLayoutProps {
  children: React.ReactNode;
}

const PartnerLayout: React.FC<PartnerLayoutProps> = ({ children }) => {
  const params = useParams();
  const pathname = usePathname();
  const partnerId = params.id as string;
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isBranchManagementModalOpen, setIsBranchManagementModalOpen] = useState(false);

  // Mobil navigation için aktif sayfa kontrolü
  const getActiveTab = () => {
    if (pathname.includes('/active-orders') || pathname.includes('/past-orders') || pathname.includes('/cancelled-orders') || pathname.includes('/refund-orders')) {
      return 'orders';
    }
    if (pathname.includes('/urun') || pathname.includes('/categories') || pathname.includes('/options') || pathname.includes('/tags') || pathname.includes('/filters')) {
      return 'menu';
    }
    if (pathname.includes('/stats')) {
      return 'stats';
    }
    return 'menu'; // Default
  };

  const activeTab = getActiveTab();

  return (
    <>
      <Layout 
        sidebarContent={<PartnerSidebar onBranchManagementModalOpen={() => setIsBranchManagementModalOpen(true)} />} 
        showSidebar={true}
        headerProps={{
          title: "Yummine",
          subtitle: "Partner Paneli",
          onMenuClick: () => setIsMobileDrawerOpen(true)
        }}
      >
        {children}
      </Layout>

      {/* Mobile Drawer - Slide up from bottom */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-hidden rounded-t-2xl shadow-xl border border-gray-700 bg-gray-800 flex flex-col">
            {/* Sabit Header */}
            <div className="shrink-0 p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Partner Menüsü</h3>
                <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 rounded hover:bg-gray-700 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Kaydırılabilir İçerik */}
            <div className="flex-1 overflow-y-auto">
              <PartnerSidebar onClose={() => setIsMobileDrawerOpen(false)} onBranchManagementModalOpen={() => setIsBranchManagementModalOpen(true)} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation - Only visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700 bg-gray-800 lg:hidden">
        <div className="flex items-center justify-around py-2">
          <a
            href={`/partner/${partnerId}/active-orders`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              activeTab === 'orders'
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Package className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Siparişler</span>
          </a>

          <a
            href={`/partner/${partnerId}/urun`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              activeTab === 'menu'
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Store className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Ürün</span>
          </a>

          <a
            href={`/partner/${partnerId}/stats`}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
              activeTab === 'stats'
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">İstatistik</span>
          </a>

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

      {/* Branch Management Modal */}
      <BranchManagementModal
        isOpen={isBranchManagementModalOpen}
        onClose={() => setIsBranchManagementModalOpen(false)}
        partnerId={partnerId}
      />

    </>
  );
};

export default PartnerLayout;