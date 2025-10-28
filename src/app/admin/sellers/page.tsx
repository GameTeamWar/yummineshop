'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

interface Seller {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  banned?: boolean;
  createdAt: Date;
  storeName?: string;
  totalOrders?: number;
  rating?: number;
}

export default function AdminSellersPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchSellers();
  }, [user, role, router]);

  const fetchSellers = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 1));
    const sellersSnapshot = await getDocs(q);
    const sellersData = sellersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Seller));
    setSellers(sellersData);
    setLoading(false);
  };

  const banSeller = async (sellerId: string, banned: boolean) => {
    await updateDoc(doc(db, 'users', sellerId), { banned });
    fetchSellers();
  };

  const openSellerModal = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsSellerModalOpen(true);
  };

  if (!user || role !== 0) {
    return null;
  }

  if (loading) {
    return <div className="text-gray-900 dark:text-white">Yükleniyor...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Satıcı Yönetimi</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Mağaza sahiplerini görüntüleyin ve yönetin</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Satıcı Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mağaza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {seller.displayName || 'Belirtilmemiş'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {seller.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {seller.storeName || 'Mağaza Yok'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        seller.banned ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {seller.banned ? 'Yasaklı' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openSellerModal(seller)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Detaylar
                      </button>
                      <button
                        onClick={() => banSeller(seller.id, !seller.banned)}
                        className={`hover:text-red-900 dark:hover:text-red-300 ${seller.banned ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {seller.banned ? 'Yasağı Kaldır' : 'Yasakla'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Seller Details Modal */}
      {isSellerModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Satıcı Detayları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedSeller.displayName || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedSeller.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedSeller.phoneNumber || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Toplam Sipariş</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedSeller.totalOrders || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Değerlendirme</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedSeller.rating || 0}/5</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsSellerModalOpen(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}