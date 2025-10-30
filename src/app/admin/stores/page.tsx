'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, getDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';
import { Store, SiteCategory } from '@/types';
import { toast } from 'react-toastify';
import StoreLocationMap from '@/components/admin/StoreLocationMap';

// Mağaza durumu sabitleri
const STORE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BANNED: 'banned',
  NEEDS_CORRECTION: 'needs_correction'
} as const;

const STORE_STATUS_LABELS = {
  [STORE_STATUS.PENDING]: 'Bekliyor',
  [STORE_STATUS.APPROVED]: 'Onaylandı',
  [STORE_STATUS.REJECTED]: 'Reddedildi',
  [STORE_STATUS.BANNED]: 'Yasaklı',
  [STORE_STATUS.NEEDS_CORRECTION]: 'Düzeltme Bekliyor'
} as const;

const STORE_STATUS_COLORS = {
  [STORE_STATUS.PENDING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [STORE_STATUS.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [STORE_STATUS.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [STORE_STATUS.BANNED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  [STORE_STATUS.NEEDS_CORRECTION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
} as const;

// Aktiflik durumu için renkler
const ACTIVE_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
} as const;

interface StoreApprovalModalProps {
  store: Store;
  onClose: () => void;
  onApprove: (storeId: string, categoryId: string) => void;
  onRequestCorrection: (storeId: string, fields: string[], description: string) => void;
  onReject: (storeId: string) => void;
  onEdit: (store: Store) => void;
  categories: SiteCategory[];
}

export default function AdminStoresPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  const [storeFinance, setStoreFinance] = useState<any>({});
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'yeni' | 'aktif' | 'pasif' | 'iptal'>('yeni');

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchCategories();

    // Real-time updates için onSnapshot ekle
    const unsubscribe = onSnapshot(collection(db, 'stores'), (snapshot) => {
      const storesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Store));
      setStores(storesData);
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [user, role, router]);

  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SiteCategory));
    setCategories(categoriesData);
  };

  const handleApproveStore = async (storeId: string, categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        toast.error('Kategori bulunamadı');
        return;
      }

      await updateDoc(doc(db, 'stores', storeId), {
        status: 'approved',
        isActive: true,
        categoryId: categoryId,
        categoryName: category.name,
        approvedBy: user?.uid,
        approvedAt: new Date(),
      });

      // Kategorideki mağaza sayısını güncelle
      await updateDoc(doc(db, 'categories', categoryId), {
        storeCount: category.storeCount + 1,
      });

      toast.success('Mağaza başarıyla onaylandı ve yayınlandı');
      // onSnapshot sayesinde otomatik güncellenecek
    } catch (error) {
      console.error('Mağaza onaylama hatası:', error);
      toast.error('Mağaza onaylanırken hata oluştu');
    }
  };

  const handleRejectStore = async (storeId: string) => {
    try {
      await updateDoc(doc(db, 'stores', storeId), { status: 'rejected' });
      toast.success('Mağaza reddedildi');
      // onSnapshot sayesinde otomatik güncellenecek
    } catch (error) {
      console.error('Mağaza reddetme hatası:', error);
      toast.error('Mağaza reddedilirken hata oluştu');
    }
  };

  const handleRequestCorrection = async (storeId: string, fields: string[], description: string) => {
    try {
      const correctionRequest = {
        id: Date.now().toString(),
        requestedBy: user?.uid,
        requestedAt: new Date(),
        fields: fields,
        description: description,
        status: 'pending',
        corrections: [],
      };

      const storeRef = doc(db, 'stores', storeId);
      const storeDoc = await getDoc(storeRef);
      const currentData = storeDoc.data();

      const existingRequests = currentData?.correctionRequests || [];
      await updateDoc(storeRef, {
        status: 'needs_correction',
        correctionRequests: [...existingRequests, correctionRequest],
      });

      toast.success('Düzeltme talebi başarıyla gönderildi');
      // onSnapshot sayesinde otomatik güncellenecek
    } catch (error) {
      console.error('Düzeltme talebi gönderme hatası:', error);
      toast.error('Düzeltme talebi gönderilirken hata oluştu');
    }
  };

  const openApprovalModal = (store: Store) => {
    setSelectedStore(store);
    setIsApprovalModalOpen(true);
  };

  const updateStoreStatus = async (storeId: string, status: Store['status']) => {
    await updateDoc(doc(db, 'stores', storeId), { status });
    // onSnapshot sayesinde otomatik güncellenecek
  };

  const deleteStore = async (storeId: string) => {
    if (window.confirm('Bu mağazayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteDoc(doc(db, 'stores', storeId));
        toast.success('Mağaza başarıyla silindi');
        // onSnapshot sayesinde otomatik güncellenecek
      } catch (error) {
        console.error('Mağaza silme hatası:', error);
        toast.error('Mağaza silinirken hata oluştu');
      }
    }
  };

  const openSalesModal = async (store: Store) => {
    setSelectedStore(store);
    try {
      const ordersQuery = query(collection(db, 'orders'), where('storeId', '==', store.id));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStoreOrders(ordersData);
    } catch (error) {
      console.error('Siparişler getirilirken hata:', error);
      setStoreOrders([]);
    }
    setIsSalesModalOpen(true);
  };

  const openFinanceModal = async (store: Store) => {
    setSelectedStore(store);
    try {
      // Siparişlerden finans hesaplaması
      const ordersQuery = query(collection(db, 'orders'), where('storeId', '==', store.id));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => doc.data());
      
      const totalSales = ordersData.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const totalOrders = ordersData.length;
      const completedOrders = ordersData.filter((order: any) => order.status === 'delivered').length;
      
      setStoreFinance({
        totalSales,
        totalOrders,
        completedOrders,
        pendingOrders: totalOrders - completedOrders,
      });
    } catch (error) {
      console.error('Finans bilgileri getirilirken hata:', error);
      setStoreFinance({});
    }
    setIsFinanceModalOpen(true);
  };

  const openOwnerModal = (store: Store) => {
    setSelectedStore(store);
    setIsOwnerModalOpen(true);
  };

  const getFilteredStores = () => {
    switch (activeTab) {
      case 'yeni':
        return stores.filter(store => store.status === 'pending' || store.status === 'needs_correction');
      case 'aktif':
        return stores.filter(store => store.status === 'approved' && store.isActive === true);
      case 'pasif':
        return stores.filter(store => store.status === 'approved' && store.isActive === false);
      case 'iptal':
        return stores.filter(store => store.status === 'rejected' || store.status === 'banned');
      default:
        return stores;
    }
  };

  const getTabCount = (tab: 'yeni' | 'aktif' | 'pasif' | 'iptal') => {
    switch (tab) {
      case 'yeni':
        return stores.filter(store => store.status === 'pending' || store.status === 'needs_correction').length;
      case 'aktif':
        return stores.filter(store => store.status === 'approved' && store.isActive === true).length;
      case 'pasif':
        return stores.filter(store => store.status === 'approved' && store.isActive === false).length;
      case 'iptal':
        return stores.filter(store => store.status === 'rejected' || store.status === 'banned').length;
      default:
        return 0;
    }
  };

  if (!user || role !== 0) {
    return null;
  }

  if (loading) {
    return <div className="text-gray-900 dark:text-white">Yükleniyor...</div>;
  }

  const filteredStores = getFilteredStores();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Mağaza Yönetimi</h2>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('yeni')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'yeni'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Yeni ({getTabCount('yeni')})
                </button>
                <button
                  onClick={() => setActiveTab('aktif')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'aktif'
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Aktif ({getTabCount('aktif')})
                </button>
                <button
                  onClick={() => setActiveTab('pasif')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pasif'
                      ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Pasif ({getTabCount('pasif')})
                </button>
                <button
                  onClick={() => setActiveTab('iptal')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'iptal'
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  İptal Edilen ({getTabCount('iptal')})
                </button>
              </nav>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mağaza Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tür
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Oluşturulma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          {store.logo && (
                            <img
                              src={store.logo}
                              alt="Logo"
                              className="w-8 h-8 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{store.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{store.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            store.status === STORE_STATUS.APPROVED && store.isActive === true
                              ? ACTIVE_STATUS_COLORS.active
                              : store.status === STORE_STATUS.APPROVED && store.isActive === false
                              ? ACTIVE_STATUS_COLORS.inactive
                              : STORE_STATUS_COLORS[store.status as keyof typeof STORE_STATUS_COLORS] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {store.status === STORE_STATUS.APPROVED && store.isActive === true
                              ? 'Aktif'
                              : store.status === STORE_STATUS.APPROVED && store.isActive === false
                              ? 'Pasif'
                              : STORE_STATUS_LABELS[store.status as keyof typeof STORE_STATUS_LABELS] || 'Bilinmiyor'}
                          </span>
                          {store.categoryName && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {store.categoryName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          store.storeType === 'esnaf' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          store.storeType === 'avm' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          store.storeType === 'marka' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {store.storeType === 'esnaf' ? 'Esnaf' :
                           store.storeType === 'avm' ? 'AVM' :
                           store.storeType === 'marka' ? 'Marka' : 'Bilinmiyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="text-xs">
                          {store.createdAt && (
                            <div>
                              {store.createdAt instanceof Date ? store.createdAt.toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                            </div>
                          )}
                          {store.approvedAt && (
                            <div className="text-green-600 dark:text-green-400">
                              Onay: {store.approvedAt instanceof Date ? store.approvedAt.toLocaleDateString('tr-TR') : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {activeTab === 'yeni' && (
                          <>
                            {(store.status === 'pending' || store.status === 'needs_correction') && (
                              <button
                                onClick={() => openApprovalModal(store)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                              >
                                İncele ve Onayla
                              </button>
                            )}
                            {store.status === 'needs_correction' && (
                              <button
                                onClick={() => updateStoreStatus(store.id, 'pending')}
                                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
                              >
                                Geri İncelemeye Al
                              </button>
                            )}
                          </>
                        )}
                        {activeTab === 'aktif' && store.status === 'approved' && store.isActive === true && (
                          <>
                            <button
                              onClick={() => openApprovalModal(store)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              İncele
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'stores', store.id), { isActive: false });
                                  toast.success('Mağaza pasifleştirildi');
                                } catch (error) {
                                  console.error('Mağaza pasifleştirme hatası:', error);
                                  toast.error('Mağaza pasifleştirilirken hata oluştu');
                                }
                              }}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm ml-2"
                            >
                              Pasif Et
                            </button>
                            <button
                              onClick={() => updateStoreStatus(store.id, 'banned')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm ml-2"
                            >
                              İptal Et
                            </button>
                          </>
                        )}
                        {activeTab === 'pasif' && store.status === 'approved' && (
                          <>
                            <button
                              onClick={() => updateStoreStatus(store.id, 'banned')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                              İptal Et
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'stores', store.id), { isActive: true });
                                  toast.success('Mağaza aktifleştirildi');
                                } catch (error) {
                                  console.error('Mağaza aktifleştirme hatası:', error);
                                  toast.error('Mağaza aktifleştirilirken hata oluştu');
                                }
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm ml-2"
                            >
                              Aktif
                            </button>
                          </>
                        )}
                        {activeTab === 'iptal' && (store.status === 'rejected' || store.status === 'banned') && (
                          <button
                            onClick={() => updateStoreStatus(store.id, 'pending')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Geri İncelemeye Al
                          </button>
                        )}
                        <button
                          onClick={() => openSalesModal(store)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Satışlar
                        </button>
                        <button
                          onClick={() => openFinanceModal(store)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm ml-2"
                        >
                          Finans
                        </button>
                        <button
                          onClick={() => openOwnerModal(store)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm ml-2"
                        >
                          Sahip
                        </button>
                        <button
                          onClick={() => deleteStore(store.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm ml-2"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStores.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {activeTab === 'yeni' && 'Yeni mağaza başvurusu bulunmuyor.'}
                  {activeTab === 'aktif' && 'Aktif mağaza bulunmuyor.'}
                  {activeTab === 'pasif' && 'Pasif mağaza bulunmuyor.'}
                  {activeTab === 'iptal' && 'İptal edilen mağaza bulunmuyor.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Approval Modal */}
      {isApprovalModalOpen && selectedStore && (
        <StoreApprovalModal
          store={selectedStore}
          onClose={() => setIsApprovalModalOpen(false)}
          onApprove={handleApproveStore}
          onRequestCorrection={handleRequestCorrection}
          onReject={handleRejectStore}
          onEdit={() => {
            // Artık ayrı modal açmıyoruz, modal içinde düzenleme modunu aktif hale getiriyoruz
            // Bu fonksiyon artık kullanılmıyor ama interface için gerekli
          }}
          categories={categories}
        />
      )}

      {/* Sales Modal */}
      {isSalesModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStore.name} - Satış Geçmişi
              </h3>
              <button
                onClick={() => setIsSalesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sipariş ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {storeOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || 'Bilinmiyor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₺{order.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.status === 'pending' ? 'Bekliyor' :
                         order.status === 'confirmed' ? 'Onaylandı' :
                         order.status === 'preparing' ? 'Hazırlanıyor' :
                         order.status === 'ready' ? 'Hazır' :
                         order.status === 'delivered' ? 'Teslim Edildi' :
                         order.status === 'cancelled' ? 'İptal Edildi' : 'Bilinmiyor'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {storeOrders.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Henüz satış bulunmuyor.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Finance Modal */}
      {isFinanceModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStore.name} - Finans Bilgileri
              </h3>
              <button
                onClick={() => setIsFinanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Toplam Satış</h4>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ₺{storeFinance.totalSales?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Toplam Sipariş</h4>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {storeFinance.totalOrders || 0}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">Tamamlanan</h4>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {storeFinance.completedOrders || 0}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Bekleyen</h4>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {storeFinance.pendingOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Modal */}
      {isOwnerModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mağaza Sahibi Bilgileri
              </h3>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedStore.ownerName || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IBAN</label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {selectedStore.iban || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              {(selectedStore.companyName || selectedStore.taxId) && (
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Şirket Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedStore.companyName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şirket Adı</label>
                        <p className="text-gray-900 dark:text-white">{selectedStore.companyName}</p>
                      </div>
                    )}
                    {selectedStore.corporateType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şirket Türü</label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedStore.corporateType === 'PRIVATE' ? 'Şahıs' :
                           selectedStore.corporateType === 'LIMITED' ? 'Limited' :
                           selectedStore.corporateType === 'INCORPORATED' ? 'Anonim' : selectedStore.corporateType}
                        </p>
                      </div>
                    )}
                    {selectedStore.taxId && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedStore.corporateType === 'PRIVATE' ? 'TC Kimlik No' : 'Vergi/TC Kimlik No'}
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono">{selectedStore.taxId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StoreApprovalModal({ store, onClose, onApprove, onRequestCorrection, onReject, onEdit, categories }: StoreApprovalModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: store.name || '',
    email: store.email || '',
    phone: store.phone || '',
    address: store.address || '',
    description: store.description || '',
    taxId: store.taxId || '',
    companyName: store.companyName || '',
    corporateType: store.corporateType || 'PRIVATE',
    iban: store.iban || '',
    storeType: store.storeType || 'esnaf',
    categories: store.categories || [], // Kategoriler
    location: {
      latitude: store.location?.latitude || 0,
      longitude: store.location?.longitude || 0,
      province: store.location?.province || '',
      district: store.location?.district || '',
      neighborhood: store.location?.neighborhood || '',
    },
  });
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Kategori ismini title case'e çeviren fonksiyon
  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // React Icon render fonksiyonu
  const renderIcon = (iconName: string, color?: string) => {
    if (!iconName) return null;

    // Popüler React Icons kütüphanelerini import et
    const iconLibraries = {
      // FontAwesome
      FaShoppingBag: () => import('react-icons/fa').then(m => m.FaShoppingBag),
      FaUtensils: () => import('react-icons/fa').then(m => m.FaUtensils),
      FaTshirt: () => import('react-icons/fa').then(m => m.FaTshirt),
      FaLaptop: () => import('react-icons/fa').then(m => m.FaLaptop),
      FaHome: () => import('react-icons/fa').then(m => m.FaHome),
      FaBook: () => import('react-icons/fa').then(m => m.FaBook),
      FaGamepad: () => import('react-icons/fa').then(m => m.FaGamepad),
      FaBaby: () => import('react-icons/fa').then(m => m.FaBaby),
      FaPalette: () => import('react-icons/fa').then(m => m.FaPalette),
      FaCouch: () => import('react-icons/fa').then(m => m.FaCouch),
      FaShoppingCart: () => import('react-icons/fa').then(m => m.FaShoppingCart),
      FaStore: () => import('react-icons/fa').then(m => m.FaStore),
      FaTools: () => import('react-icons/fa').then(m => m.FaTools),
      FaCar: () => import('react-icons/fa').then(m => m.FaCar),
      FaHeartbeat: () => import('react-icons/fa').then(m => m.FaHeartbeat),
      FaGem: () => import('react-icons/fa').then(m => m.FaGem),
      FaClock: () => import('react-icons/fa').then(m => m.FaClock),
      FaGlasses: () => import('react-icons/fa').then(m => m.FaGlasses),

      // Material Design
      MdShoppingBag: () => import('react-icons/md').then(m => m.MdShoppingBag),
      MdRestaurant: () => import('react-icons/md').then(m => m.MdRestaurant),
      MdCheckroom: () => import('react-icons/md').then(m => m.MdCheckroom),
      MdComputer: () => import('react-icons/md').then(m => m.MdComputer),
      MdHome: () => import('react-icons/md').then(m => m.MdHome),
      MdMenuBook: () => import('react-icons/md').then(m => m.MdMenuBook),
      MdSportsEsports: () => import('react-icons/md').then(m => m.MdSportsEsports),
      MdChildCare: () => import('react-icons/md').then(m => m.MdChildCare),
      MdPalette: () => import('react-icons/md').then(m => m.MdPalette),
      MdChair: () => import('react-icons/md').then(m => m.MdChair),
      MdShoppingCart: () => import('react-icons/md').then(m => m.MdShoppingCart),
      MdStore: () => import('react-icons/md').then(m => m.MdStore),
      MdBuild: () => import('react-icons/md').then(m => m.MdBuild),
      MdDirectionsCar: () => import('react-icons/md').then(m => m.MdDirectionsCar),
      MdFavorite: () => import('react-icons/md').then(m => m.MdFavorite),
      MdDiamond: () => import('react-icons/md').then(m => m.MdDiamond),
      MdSchedule: () => import('react-icons/md').then(m => m.MdSchedule),
      MdVisibility: () => import('react-icons/md').then(m => m.MdVisibility),

      // Ant Design Icons
      AiOutlineFormatPainter: () => import('react-icons/ai').then(m => m.AiOutlineFormatPainter),
      AiOutlineShopping: () => import('react-icons/ai').then(m => m.AiOutlineShopping),
      AiOutlineHome: () => import('react-icons/ai').then(m => m.AiOutlineHome),
      AiOutlineBook: () => import('react-icons/ai').then(m => m.AiOutlineBook),
      AiOutlineCar: () => import('react-icons/ai').then(m => m.AiOutlineCar),
      AiOutlineHeart: () => import('react-icons/ai').then(m => m.AiOutlineHeart),
      AiOutlineStar: () => import('react-icons/ai').then(m => m.AiOutlineStar),
      AiOutlineGift: () => import('react-icons/ai').then(m => m.AiOutlineGift),
      AiOutlineTool: () => import('react-icons/ai').then(m => m.AiOutlineTool),
      AiOutlineCoffee: () => import('react-icons/ai').then(m => m.AiOutlineCoffee),
    };

    const iconLoader = iconLibraries[iconName as keyof typeof iconLibraries];
    if (iconLoader) {
      return <DynamicIcon loader={iconLoader} color={color} />;
    }

    return null;
  };

  // Dinamik ikon bileşeni
  const DynamicIcon: React.FC<{ loader: () => Promise<any>, color?: string }> = ({ loader, color }) => {
    const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
      loader().then(Icon => {
        setIconComponent(() => Icon);
      }).catch(() => {
        setIconComponent(null);
      });
    }, [loader]);

    if (!IconComponent) return null;
    return <IconComponent className="text-lg" style={color ? { color } : undefined} />;
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleApprove = () => {
    if (!selectedCategory) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }
    onApprove(store.id, selectedCategory);
    onClose();
  };

  const handleRequestCorrection = () => {
    if (selectedFields.length === 0) {
      toast.error('Lütfen en az bir alan seçin');
      return;
    }
    if (!correctionDescription.trim()) {
      toast.error('Lütfen düzeltme açıklaması girin');
      return;
    }
    onRequestCorrection(store.id, selectedFields, correctionDescription);
    onClose();
  };

  const handleEditMode = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateDoc(doc(db, 'stores', store.id), editFormData);
      toast.success('Mağaza bilgileri güncellendi');
      setIsEditMode(false);
      // onSnapshot sayesinde otomatik güncellenecek, sayfa yenilenmesine gerek yok
    } catch (error) {
      console.error('Mağaza güncellenirken hata:', error);
      toast.error('Mağaza güncellenirken hata oluştu');
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      name: store.name || '',
      email: store.email || '',
      phone: store.phone || '',
      address: store.address || '',
      description: store.description || '',
      taxId: store.taxId || '',
      companyName: store.companyName || '',
      corporateType: store.corporateType || 'PRIVATE',
      iban: store.iban || '',
      storeType: store.storeType || 'esnaf',
      categories: store.categories || [], // Kategoriler
      location: {
        latitude: store.location?.latitude || 0,
        longitude: store.location?.longitude || 0,
        province: store.location?.province || '',
        district: store.location?.district || '',
        neighborhood: store.location?.neighborhood || '',
      },
    });
    setIsEditMode(false);
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setEditFormData(prev => ({
      ...prev,
      location: { ...prev.location, latitude: lat, longitude: lng }
    }));

    // Reverse geocoding ile il, ilçe, mahalle bilgilerini al
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=tr`
      );
      const data = await response.json();

      if (data && data.address) {
        const address = data.address;
        const province = address.state || address.province || '';
        const district = address.county || address.district || address.town || address.city_district || '';
        const neighborhood = address.suburb || address.neighbourhood || address.village || address.hamlet || '';

        setEditFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            latitude: lat,
            longitude: lng,
            province: province,
            district: district,
            neighborhood: neighborhood
          }
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding hatası:', error);
      toast.error('Konum bilgilerini alırken hata oluştu');
      // Hata durumunda sadece koordinatları güncelle
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {store.logo && (
                <img
                  src={store.logo}
                  alt="Mağaza Logosu"
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{store.name}</h2>
                <p className="text-blue-100">{store.storeType} • {store.status}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
          {/* Left Column - CV Style Info */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            {/* Kişisel Bilgiler */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Kişisel Bilgiler
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                {isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Ad Soyad</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">E-posta</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Telefon</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">IBAN</label>
                      <input
                        type="text"
                        value={editFormData.iban}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, iban: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Ad Soyad</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {store.ownerName || 'Belirtilmemiş'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">E-posta</label>
                      <p className="text-gray-900 dark:text-white">{store.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Telefon</label>
                      <p className="text-gray-900 dark:text-white">{store.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">IBAN</label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {store.iban || 'Belirtilmemiş'}
                      </p>
                    </div>
                    {store.birthDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Doğum Tarihi</label>
                        <p className="text-gray-900 dark:text-white">
                          {store.birthDate instanceof Date ? store.birthDate.toLocaleDateString('tr-TR') : store.birthDate}
                        </p>
                      </div>
                    )}
                    {store.kepAddress && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">KEP Adresi</label>
                        <p className="text-gray-900 dark:text-white font-mono text-sm">{store.kepAddress}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Şirket Bilgileri */}
            {(store.companyName || store.taxId || store.corporateType) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Şirket Bilgileri
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  {isEditMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Şirket Adı</label>
                        <input
                          type="text"
                          value={editFormData.companyName}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Şirket Türü</label>
                        <select
                          value={editFormData.corporateType}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, corporateType: e.target.value as 'PRIVATE' | 'LIMITED' | 'INCORPORATED' }))}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="PRIVATE">Şahıs</option>
                          <option value="LIMITED">Limited</option>
                          <option value="INCORPORATED">Anonim</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                          Vergi/TC Kimlik No
                        </label>
                        <input
                          type="text"
                          value={editFormData.taxId}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, taxId: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {store.companyName && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şirket Adı</label>
                          <p className="text-gray-900 dark:text-white font-medium">{store.companyName}</p>
                        </div>
                      )}
                      {store.corporateType && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şirket Türü</label>
                          <p className="text-gray-900 dark:text-white">
                            {store.corporateType === 'PRIVATE' ? 'Şahıs' :
                             store.corporateType === 'LIMITED' ? 'Limited' :
                             store.corporateType === 'INCORPORATED' ? 'Anonim' : store.corporateType}
                          </p>
                        </div>
                      )}
                      {store.taxId && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {store.corporateType === 'PRIVATE' ? 'TC Kimlik No' : 'Vergi/TC Kimlik No'}
                          </label>
                          <p className="text-gray-900 dark:text-white font-mono">{store.taxId}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mağaza Bilgileri */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                </svg>
                Mağaza Bilgileri
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                {isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Mağaza Adı</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Mağaza Türü</label>
                      <select
                        value={editFormData.storeType}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, storeType: e.target.value as 'esnaf' | 'avm' | 'marka' }))}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="esnaf">Esnaf</option>
                        <option value="avm">AVM</option>
                        <option value="marka">Marka</option>
                      </select>
                    </div>
                    {store.branchCount && store.branchCount > 1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şube Sayısı</label>
                        <p className="text-gray-900 dark:text-white">{store.branchCount}</p>
                      </div>
                    )}
                    {store.branchReferenceCode && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Cari ID</label>
                        <p className="text-gray-900 dark:text-white font-mono">{store.branchReferenceCode}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Mağaza Adı</label>
                      <p className="text-gray-900 dark:text-white font-medium">{store.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Mağaza Türü</label>
                      <p className="text-gray-900 dark:text-white">{store.storeType}</p>
                    </div>
                    {store.branchCount && store.branchCount > 1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şube Sayısı</label>
                        <p className="text-gray-900 dark:text-white">{store.branchCount}</p>
                      </div>
                    )}
                    {store.branchReferenceCode && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Cari ID</label>
                        <p className="text-gray-900 dark:text-white font-mono">{store.branchReferenceCode}</p>
                      </div>
                    )}
                  </div>
                )}
                {store.categories && store.categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Ürün Kategorileri</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {store.categories.map((categoryId: string) => {
                        // Burada kategori adını bulmak için basit bir çözüm
                        // Gerçek uygulamada categories koleksiyonundan çekmek gerekebilir
                        const categoryNames: {[key: string]: string} = {
                          'elektronik': 'Elektronik',
                          'ayakkabi-canta': 'Ayakkabı & Çanta',
                          'bahce-yapi-market-hirdavat-otomatik': 'Bahçe & Yapı Market & Hırdavat & Otomotiv',
                          'kitap-kirtasiye-oyuncak-anne-cocuk': 'Kitap & Kırtasiye & Oyuncak & Anne ve Çocuk Ürünleri',
                          'tekstil': 'Tekstil',
                          'kozmetik': 'Kozmetik',
                          'mobilya': 'Mobilya',
                          'supermarket-petshop-saglik': 'Süpermarket & Petshop & Sağlık',
                          'ev-tekstil-dekorasyon-mutfak': 'Ev Tekstil & Dekorasyon & Mutfak',
                          'aksesuar-saat-gozluk': 'Aksesuar & Saat & Gözlük'
                        };
                        const categoryName = categoryNames[categoryId] || categoryId;
                        const isCourierCompatible = !['bahce-yapi-market-hirdavat-otomatik', 'mobilya'].includes(categoryId);
                        
                        return (
                          <span
                            key={categoryId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {toTitleCase(categoryName)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Adres Bilgileri
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Adres</label>
                      <textarea
                        value={editFormData.address}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    {/* Konum Bilgileri */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Konum Bilgileri</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Enlem (Latitude)</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={editFormData.location.latitude || ''}
                            onChange={(e) => setEditFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, latitude: parseFloat(e.target.value) || 0 }
                            }))}
                            onBlur={(e) => {
                              const lat = parseFloat(e.target.value);
                              const lng = editFormData.location.longitude;
                              if (!isNaN(lat) && !isNaN(lng)) {
                                handleLocationChange(lat, lng);
                              }
                            }}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                            placeholder="örn: 41.0082"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Boylam (Longitude)</label>
                          <input
                            type="number"
                            step="0.000001"
                            value={editFormData.location.longitude || ''}
                            onChange={(e) => setEditFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, longitude: parseFloat(e.target.value) || 0 }
                            }))}
                            onBlur={(e) => {
                              const lat = editFormData.location.latitude;
                              const lng = parseFloat(e.target.value);
                              if (!isNaN(lat) && !isNaN(lng)) {
                                handleLocationChange(lat, lng);
                              }
                            }}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                            placeholder="örn: 28.9784"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                            İl {isReverseGeocoding && <span className="text-xs text-blue-500">(Güncelleniyor...)</span>}
                          </label>
                          <input
                            type="text"
                            value={editFormData.location.province || ''}
                            onChange={(e) => setEditFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, province: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="örn: İstanbul"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                            İlçe {isReverseGeocoding && <span className="text-xs text-blue-500">(Güncelleniyor...)</span>}
                          </label>
                          <input
                            type="text"
                            value={editFormData.location.district || ''}
                            onChange={(e) => setEditFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, district: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="örn: Kadıköy"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                            Mahalle/Semt {isReverseGeocoding && <span className="text-xs text-blue-500">(Güncelleniyor...)</span>}
                          </label>
                          <input
                            type="text"
                            value={editFormData.location.neighborhood || ''}
                            onChange={(e) => setEditFormData(prev => ({
                              ...prev,
                              location: { ...prev.location, neighborhood: e.target.value }
                            }))}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="örn: Moda"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900 dark:text-white mb-4">{store.address}</p>
                    {store.location && (
                      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {store.location.province && <span>{store.location.province}, </span>}
                        {store.location.district && <span>{store.location.district}, </span>}
                        {store.location.neighborhood && <span>{store.location.neighborhood}</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Harita */}
                {store.location?.latitude && store.location?.longitude && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mağaza Konumu {isEditMode && '(Haritada tıklayarak konumu değiştirebilirsiniz)'}
                      {isReverseGeocoding && <span className="text-xs text-blue-500 ml-2">📍 Adres bilgileri güncelleniyor...</span>}
                    </h4>
                    <StoreLocationMap
                      latitude={isEditMode ? editFormData.location.latitude : store.location.latitude}
                      longitude={isEditMode ? editFormData.location.longitude : store.location.longitude}
                      storeName={store.name}
                      height="250px"
                      editable={isEditMode}
                      onLocationChange={handleLocationChange}
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Enlem: {(isEditMode ? editFormData.location.latitude : store.location.latitude).toFixed(6)}, 
                      Boylam: {(isEditMode ? editFormData.location.longitude : store.location.longitude).toFixed(6)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {store.authorizedPersons && store.authorizedPersons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Yetkili Kişiler
                </h3>
                <div className="space-y-3">
                  {store.authorizedPersons.map((person, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {person.firstName} {person.lastName}
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {person.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>📧 {person.email}</p>
                        <p>📱 {person.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Belgeler */}
            {store.documents && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Belgeler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {store.documents.idCard && (
                    <a
                      href={store.documents.idCard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Kimlik</p>
                    </a>
                  )}
                  {store.documents.driversLicense && (
                    <a
                      href={store.documents.driversLicense}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Ehliyet</p>
                    </a>
                  )}
                  {store.documents.taxCertificate && (
                    <a
                      href={store.documents.taxCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Vergi Levhası</p>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="lg:w-1/3 bg-gray-50 dark:bg-gray-700 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">İşlemler</h3>

            {/* Site Kategorisi Seçimi */}
            {isEditMode ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ürün Kategorileri (Çoklu Seçim)
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                  {categories
                    .filter(category => category.isActive !== false)
                    .filter(category => {
                      // Sadece ana kategorileri göster (alt kategorisi olmayanlar)
                      return !categories.some(cat => cat.childCategories?.includes(category.id));
                    })
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map((category) => {
                      const isSelected = editFormData.categories?.includes(category.id) || false;

                      return (
                        <label
                          key={category.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className={`relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className={`text-sm font-medium transition-colors duration-200 ${
                              isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.storeCount || 0} mağaza
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const categoryId = category.id;
                              setEditFormData(prev => {
                                const currentCategories = prev.categories || [];
                                if (e.target.checked) {
                                  return { ...prev, categories: [...currentCategories, categoryId] };
                                } else {
                                  return { ...prev, categories: currentCategories.filter(id => id !== categoryId) };
                                }
                              });
                            }}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Seçilen kategoriler: {editFormData.categories?.length || 0}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Kategori *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon && renderIcon(category.icon, category.color)} {category.name} ({category.storeCount} mağaza)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Düzeltme Talebi */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Düzeltme Talep Edilecek Alanlar
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                {[
                  { key: 'name', label: 'Mağaza Adı' },
                  { key: 'email', label: 'E-posta' },
                  { key: 'phone', label: 'Telefon' },
                  { key: 'taxId', label: 'Vergi/TC Kimlik No' },
                  { key: 'companyName', label: 'Şirket Adı' },
                  { key: 'corporateType', label: 'Şirket Türü' },
                  { key: 'iban', label: 'IBAN' },
                  { key: 'storeType', label: 'Mağaza Türü' },
                  { key: 'address', label: 'Adres' },
                  { key: 'location', label: 'Konum Bilgileri' },
                  { key: 'description', label: 'Açıklama' },
                  { key: 'documents', label: 'Belgeler' },
                  { key: 'authorizedPersons', label: 'Yetkili Kişiler' },
                ].map(field => (
                  <label key={field.key} className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleFieldToggle(field.key)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedFields.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Düzeltme Açıklaması *
                </label>
                <textarea
                  value={correctionDescription}
                  onChange={(e) => setCorrectionDescription(e.target.value)}
                  placeholder="Düzeltme talebinizin nedenini açıklayın..."
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={!selectedCategory}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Onayla ve Yayınla
                  </button>

                  <button
                    onClick={handleEditMode}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </button>

                  <button
                    onClick={handleRequestCorrection}
                    className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzeltme Talep Et
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bu mağazayı reddetmek istediğinizden emin misiniz?')) {
                        onReject(store.id);
                        onClose();
                      }
                    }}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reddet
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    İptal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}