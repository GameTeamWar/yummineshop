'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Mağaza Yönetimi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mağaza Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {store.status === 'active' ? 'Aktif' : 'Pasif'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => updateStoreStatus(store.id, store.status === 'active' ? 'inactive' : 'active')}
                        className={`px-3 py-1 rounded text-sm ${
                          store.status === 'active'
                            ? 'bg-red-600 text-white'
                            : 'bg-green-600 text-white'
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
  );
}