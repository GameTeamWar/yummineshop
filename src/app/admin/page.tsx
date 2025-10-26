'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

interface User {
  id: string;
  email: string;
  role: number;
  createdAt: Date;
}

interface Store {
  id: string;
  name: string;
  ownerId: string;
  status: 'active' | 'inactive';
}

interface Order {
  id: string;
  userId: string;
  storeId: string;
  total: number;
  status: string;
  createdAt: Date;
}

export default function AdminPanel() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchUsers();
    fetchStores();
    fetchOrders();
  }, [user, role, router]);

  const fetchUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersData = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    setUsers(usersData);
  };

  const fetchStores = async () => {
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    const storesData = storesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Store));
    setStores(storesData);
  };

  const fetchOrders = async () => {
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const ordersData = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Order));
    setOrders(ordersData);
  };

  const updateUserRole = async (userId: string, newRole: number) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    fetchUsers();
  };

  if (!user || role !== 0) {
    return <div>Erişim reddedildi.</div>;
  }

  const stats = {
    totalUsers: users.length,
    totalStores: stores.length,
    totalOrders: orders.length,
    activeStores: stores.filter(s => s.status === 'active').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Admin Paneli</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sistem yönetimi ve kullanıcı kontrolü</p>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-linear-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">Toplam Kullanıcı</h3>
                <p className="text-2xl lg:text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-indigo-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Toplam Mağaza</h3>
                <p className="text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalStores}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Aktif Mağaza</h3>
                <p className="text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.activeStores}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Toplam Sipariş</h3>
                <p className="text-2xl lg:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sistemdeki tüm kullanıcıları görüntüleyin ve rollerini yönetin</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    E-posta Adresi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Kullanıcı Rolü
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 0 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                        user.role === 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        user.role === 2 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        user.role === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role === 0 ? 'Admin' : user.role === 1 ? 'Mağaza' : user.role === 2 ? 'Müşteri' : user.role === 3 ? 'Kurye' : 'Alt Kullanıcı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      >
                        <option value={0}>Admin</option>
                        <option value={1}>Mağaza</option>
                        <option value={2}>Müşteri</option>
                        <option value={3}>Kurye</option>
                        <option value={5}>Alt Kullanıcı</option>
                      </select>
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