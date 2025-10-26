'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  role: number;
}

interface Store {
  id: string;
  status: 'active' | 'inactive';
}

interface Order {
  id: string;
}

export default function AdminStatsPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    activeStores: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchStats();
  }, [user, role, router]);

  const fetchStats = async () => {
    const [usersSnapshot, storesSnapshot, ordersSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'stores')),
      getDocs(collection(db, 'orders')),
    ]);

    const users = usersSnapshot.docs.map(doc => doc.data() as User);
    const stores = storesSnapshot.docs.map(doc => doc.data() as Store);
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

    setStats({
      totalUsers: users.length,
      totalStores: stores.length,
      totalOrders: orders.length,
      activeStores: stores.filter(s => s.status === 'active').length,
    });
    setLoading(false);
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
          <h2 className="text-lg font-medium text-gray-900 mb-6">İstatistikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-indigo-900">Toplam Kullanıcı</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Toplam Mağaza</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalStores}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Aktif Mağaza</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.activeStores}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900">Toplam Sipariş</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}