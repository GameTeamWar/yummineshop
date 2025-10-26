'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

interface Store {
  id: string;
  name: string;
  ownerId: string;
  status: 'active' | 'inactive';
}

export default function AdminStoresPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchStores();
  }, [user, role, router]);

  const fetchStores = async () => {
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    const storesData = storesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Store));
    setStores(storesData);
    setLoading(false);
  };

  const updateStoreStatus = async (storeId: string, status: 'active' | 'inactive') => {
    await updateDoc(doc(db, 'stores', storeId), { status });
    fetchStores();
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
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Mağaza Yönetimi</h2>
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
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {store.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {store.status === 'active' ? 'Aktif' : 'Pasif'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => updateStoreStatus(store.id, store.status === 'active' ? 'inactive' : 'active')}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            store.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {store.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}