'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'orders' | 'stats'>('users');

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

  const updateStoreStatus = async (storeId: string, status: 'active' | 'inactive') => {
    await updateDoc(doc(db, 'stores', storeId), { status });
    fetchStores();
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
            <button
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Ana Sayfa
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Kullanıcılar
              </button>
              <button
                onClick={() => setActiveTab('stores')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'stores'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Mağazalar
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Siparişler
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                İstatistikler
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Kullanıcı Yönetimi</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          E-posta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role === 0 ? 'Admin' : user.role === 1 ? 'Mağaza' : user.role === 2 ? 'Müşteri' : user.role === 3 ? 'Kurye' : 'Alt Kullanıcı'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, Number(e.target.value))}
                              className="border rounded px-2 py-1"
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
            )}

            {activeTab === 'stores' && (
              <div>
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
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Sipariş Yönetimi</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sipariş ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toplam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.id.slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₺{order.total}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}