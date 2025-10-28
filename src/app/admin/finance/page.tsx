'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

interface Payment {
  id: string;
  storeId: string;
  amount: number;
  type: 'commission' | 'payout' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export default function AdminFinancePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommissions: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
  });

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchPayments();
    calculateStats();
  }, [user, role, router]);

  const fetchPayments = async () => {
    const paymentsSnapshot = await getDocs(collection(db, 'payments'));
    const paymentsData = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Payment));
    setPayments(paymentsData);
    setLoading(false);
  };

  const calculateStats = async () => {
    // Calculate stats from payments and orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalCommissions = totalRevenue * 0.1; // 10% commission
    const pendingPayouts = payments.filter(p => p.status === 'pending' && p.type === 'payout').reduce((sum, p) => sum + p.amount, 0);
    const completedPayouts = payments.filter(p => p.status === 'completed' && p.type === 'payout').reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalRevenue,
      totalCommissions,
      pendingPayouts,
      completedPayouts,
    });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Komisyon</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{stats.totalCommissions.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Ödemeler</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{stats.pendingPayouts.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamamlanan Ödemeler</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{stats.completedPayouts.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ödeme Geçmişi</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Tüm finansal işlemleri görüntüleyin</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlem ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mağaza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.storeId.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.type === 'commission' ? 'Komisyon' : payment.type === 'payout' ? 'Ödeme' : 'İade'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ₺{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {payment.status === 'completed' ? 'Tamamlandı' : payment.status === 'pending' ? 'Bekliyor' : 'Başarısız'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}