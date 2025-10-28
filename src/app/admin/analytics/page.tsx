'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

export default function AdminAnalyticsPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    topProducts: [] as { name: string; sales: number }[],
    monthlyRevenue: [] as { month: string; revenue: number }[],
  });

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchAnalytics();
  }, [user, role, router]);

  const fetchAnalytics = async () => {
    // Fetch all data and calculate metrics
    const [usersSnap, storesSnap, ordersSnap, productsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'stores')),
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'products')),
    ]);

    const users = usersSnap.docs.length;
    const stores = storesSnap.docs.length;
    const orders = ordersSnap.docs.map(doc => doc.data());
    const products = productsSnap.docs.map(doc => doc.data());

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Mock top products (would need actual sales data)
    const topProducts = products.slice(0, 5).map(p => ({ name: p.name, sales: Math.floor(Math.random() * 100) }));

    // Mock monthly revenue
    const monthlyRevenue = [
      { month: 'Oca', revenue: 12000 },
      { month: 'Şub', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Nis', revenue: 22000 },
      { month: 'May', revenue: 25000 },
      { month: 'Haz', revenue: 28000 },
    ];

    setMetrics({
      totalUsers: users,
      totalStores: stores,
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue,
      topProducts,
      monthlyRevenue,
    });

    setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performans & Analitik</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kullanıcı</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalUsers}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Mağaza</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalStores}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Sipariş</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalOrders}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{metrics.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aylık Gelir</h3>
            <div className="space-y-2">
              {metrics.monthlyRevenue.map((item) => (
                <div key={item.month} className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₺{item.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">En Çok Satan Ürünler</h3>
            <div className="space-y-2">
              {metrics.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{product.name}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{product.sales} satış</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ek Metrikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Sipariş Değeri</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₺{metrics.avgOrderValue.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Mağaza Oranı</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">%85</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Müşteri Memnuniyeti</h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">4.2/5</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}