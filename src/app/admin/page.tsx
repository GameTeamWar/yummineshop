'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

interface User {
  id: string;
  email: string;
  role: number;
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  banned?: boolean;
  deleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  permissions?: {
    canViewUsers: boolean;
    canManageUsers: boolean;
    canViewStores: boolean;
    canManageStores: boolean;
    canViewProducts: boolean;
    canManageProducts: boolean;
    canViewOrders: boolean;
    canManageOrders: boolean;
    canViewFinance: boolean;
    canViewAnalytics: boolean;
    canSendNotifications: boolean;
    canManageCouriers: boolean;
  };
}

interface Store {
  id: string;
  name: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
}

interface Order {
  id: string;
  userId: string;
  storeId: string;
  total: number;
  status: string;
  createdAt: Date;
}

interface Courier {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  isActive: boolean;
  isOnline: boolean;
  workingHours?: {
    start: string;
    end: string;
  };
  banned?: boolean;
  createdAt: Date;
  lastActive?: Date;
}

export default function AdminPanel() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreOrdersModalOpen, setIsStoreOrdersModalOpen] = useState(false);
  const [storeOrders, setStoreOrders] = useState<Order[]>([]);
  const [isCreateSubUserModalOpen, setIsCreateSubUserModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    loadUsers();
    fetchStores();
    fetchOrders();
    fetchCouriers();
  }, [user, role, router]);

  const loadUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersData = usersSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as User))
      .filter(user => !user.deleted); // Silinmiş kullanıcıları filtrele
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

  const fetchCouriers = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 3));
    const couriersSnapshot = await getDocs(q);
    const couriersData = couriersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Courier));
    setCouriers(couriersData);
  };

  const updateUserRole = async (userId: string, newRole: number) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    loadUsers();
  };

  const banUser = async (userId: string, banned: boolean) => {
    await updateDoc(doc(db, 'users', userId), { banned });
    loadUsers();
  };

  const updateCourierStatus = async (courierId: string, isActive: boolean) => {
    await updateDoc(doc(db, 'users', courierId), { isActive });
    fetchCouriers();
  };

  const updateCourierOnlineStatus = async (courierId: string, isOnline: boolean) => {
    await updateDoc(doc(db, 'users', courierId), { isOnline, lastActive: new Date() });
    fetchCouriers();
  };

  const updateCourierWorkingHours = async (courierId: string, workingHours: { start: string; end: string }) => {
    await updateDoc(doc(db, 'users', courierId), { workingHours });
    fetchCouriers();
  };

  const openPermissionsModal = (user: User) => {
    setSelectedUserForPermissions(user);
    setIsPermissionsModalOpen(true);
  };

  const updateUserPermissions = async (userId: string, permissions: User['permissions']) => {
    try {
      // Firestore'da kullanıcının izinlerini güncelle
      await updateDoc(doc(db, 'users', userId), {
        permissions: permissions,
        updatedAt: new Date(),
      });

      // Kullanıcı listesini yeniden yükle
      await loadUsers();
      setIsPermissionsModalOpen(false);
      setSelectedUserForPermissions(null);
      alert('İzinler başarıyla güncellendi!');
    } catch (error: any) {
      console.error('İzin güncelleme hatası:', error);
      alert(`İzinler güncellenemedi: ${error.message}`);
    }
  };

  const createSubUser = async (userData: {
    email: string;
    password: string;
    displayName: string;
    permissions: User['permissions'];
  }) => {
    try {
      // Firebase Auth ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;

      // Firestore'a kullanıcı bilgilerini kaydet
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: 5, // Alt kullanıcı rolü
        permissions: userData.permissions,
        createdAt: new Date(),
        isActive: true,
      });

      // Kullanıcı listesini yeniden yükle
      await loadUsers();
      setIsCreateSubUserModalOpen(false);
      alert('Alt kullanıcı başarıyla oluşturuldu!');
    } catch (error: any) {
      console.error('Alt kullanıcı oluşturma hatası:', error);
      alert(`Alt kullanıcı oluşturulamadı: ${error.message}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?\n\nNot: Kullanıcı Firebase Authentication\'dan silinmeyecek, sadece sistemden kaldırılacak.')) {
      try {
        // Kullanıcıyı soft delete yap - banned olarak işaretle ve görünürlüğü kaldır
        await updateDoc(doc(db, 'users', userId), {
          banned: true,
          deleted: true,
          deletedAt: new Date(),
        });

        // Alternatif olarak tamamen silmek isterseniz (Auth'dan silmez):
        // await deleteDoc(doc(db, 'users', userId));

        loadUsers();
        alert('Kullanıcı sistemden kaldırıldı. Aynı email ile tekrar kayıt olunabilir.');
      } catch (error: any) {
        console.error('Kullanıcı silme hatası:', error);
        alert(`Kullanıcı silinemedi: ${error.message}`);
      }
    }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', userId), data);
    loadUsers();
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const updateStoreStatus = async (storeId: string, status: Store['status']) => {
    await updateDoc(doc(db, 'stores', storeId), { status });
    fetchStores();
  };

  const viewStoreOrders = (store: Store) => {
    setSelectedStore(store);
    const ordersForStore = orders.filter(o => o.storeId === store.id);
    setStoreOrders(ordersForStore);
    setIsStoreOrdersModalOpen(true);
  };

  const sendNotification = async (recipient: string, title: string, message: string) => {
    let targetUsers: User[] = [];
    if (recipient === 'all') {
      targetUsers = users;
    } else if (recipient === 'stores') {
      targetUsers = users.filter(u => u.role === 1);
    } else if (recipient === 'customers') {
      targetUsers = users.filter(u => u.role === 2);
    } else if (recipient === 'couriers') {
      targetUsers = users.filter(u => u.role === 3);
    }
    // For specific, would need user selection, but for now skip

    for (const user of targetUsers) {
      await addDoc(collection(db, 'notifications'), {
        userId: user.id,
        title,
        message,
        read: false,
        createdAt: new Date(),
      });
    }
    alert('Bildirimler gönderildi');
  };

  if (!user || role !== 0) {
    return <div>Erişim reddedildi.</div>;
  }

  const stats = {
    totalUsers: users.length,
    totalStores: stores.length,
    totalOrders: orders.length,
    activeStores: stores.filter(s => s.status === 'approved').length,
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
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sistemdeki tüm kullanıcıları görüntüleyin ve rollerini yönetin</p>
            </div>
            <button
              onClick={() => setIsCreateSubUserModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Alt Kullanıcı Oluştur
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    E-posta Adresi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Kullanıcı Rolü
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    İzinler
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Durum
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.displayName || 'Belirtilmemiş'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.role === 5 ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">
                            {Object.values(user.permissions || {}).filter(Boolean).length} izin
                          </span>
                          <button
                            onClick={() => openPermissionsModal(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                          >
                            Düzenle
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Tam Erişim</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.banned ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {user.banned ? 'Yasaklı' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-xs"
                      >
                        <option value={0}>Admin</option>
                        <option value={1}>Mağaza</option>
                        <option value={2}>Müşteri</option>
                        <option value={3}>Kurye</option>
                        <option value={5}>Alt Kullanıcı</option>
                      </select>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => banUser(user.id, !user.banned)}
                        className={`hover:text-red-900 dark:hover:text-red-300 ${user.banned ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {user.banned ? 'Yasağı Kaldır' : 'Yasakla'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stores Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kayıtlı Mağazalar ({stores.length})</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Tüm mağazaları görüntüleyin ve durumlarını yönetin</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Mağaza Adı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Sahibi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Adres
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {store.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {store.email || 'Belirtilmemiş'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {store.phone || 'Belirtilmemiş'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {store.address || 'Belirtilmemiş'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        store.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        store.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        store.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {store.status === 'approved' ? 'Onaylandı' : store.status === 'pending' ? 'Bekliyor' : store.status === 'rejected' ? 'Reddedildi' : 'Yasaklı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {store.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStoreStatus(store.id, 'approved')}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => updateStoreStatus(store.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      {store.status === 'approved' && (
                        <button
                          onClick={() => updateStoreStatus(store.id, 'banned')}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Yasakla
                        </button>
                      )}
                      <button
                        onClick={() => viewStoreOrders(store)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Siparişleri Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Couriers Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kurye Yönetimi</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Kuryeleri görüntüleyin ve durumlarını yönetin</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Çalışma Saatleri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Sistem Durumu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Aktiflik
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {couriers.map((courier) => {
                  const currentHour = new Date().getHours();
                  const currentMinute = new Date().getMinutes();
                  const currentTime = currentHour * 60 + currentMinute;

                  const isWithinWorkingHours = courier.workingHours ? (() => {
                    const [startHour, startMinute] = courier.workingHours!.start.split(':').map(Number);
                    const [endHour, endMinute] = courier.workingHours!.end.split(':').map(Number);
                    const startTime = startHour * 60 + startMinute;
                    const endTime = endHour * 60 + endMinute;
                    return currentTime >= startTime && currentTime <= endTime;
                  })() : true;

                  const shouldBeActive = courier.isActive && !courier.banned && isWithinWorkingHours;

                  return (
                    <tr key={courier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {courier.displayName || 'Belirtilmemiş'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {courier.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {courier.phoneNumber || 'Belirtilmemiş'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {courier.workingHours ? `${courier.workingHours.start} - ${courier.workingHours.end}` : 'Belirtilmemiş'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          courier.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {courier.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            shouldBeActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {shouldBeActive ? 'Aktif' : 'Pasif'}
                          </span>
                          {!isWithinWorkingHours && courier.workingHours && (
                            <div className="text-xs text-orange-600 dark:text-orange-400">
                              Çalışma saatleri dışında
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => updateCourierOnlineStatus(courier.id, !courier.isOnline)}
                          className={`px-2 py-1 rounded text-xs ${
                            courier.isOnline ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {courier.isOnline ? 'Çevrimdışı Yap' : 'Çevrimiçi Yap'}
                        </button>
                        <button
                          onClick={() => updateCourierStatus(courier.id, !courier.isActive)}
                          className={`px-2 py-1 rounded text-xs ${
                            courier.isActive ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {courier.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                        <button
                          onClick={() => {
                            const startTime = prompt('Çalışma başlangıç saati (HH:MM):', courier.workingHours?.start || '09:00');
                            const endTime = prompt('Çalışma bitiş saati (HH:MM):', courier.workingHours?.end || '18:00');
                            if (startTime && endTime) {
                              updateCourierWorkingHours(courier.id, { start: startTime, end: endTime });
                            }
                          }}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                        >
                          Saat Ayarla
                        </button>
                        {courier.banned && (
                          <button
                            onClick={() => banUser(courier.id, false)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                          >
                            Engeli Kaldır
                          </button>
                        )}
                        {!courier.banned && (
                          <button
                            onClick={() => banUser(courier.id, true)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                          >
                            Engelle
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Bildirim Gönder</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const recipient = formData.get('recipient') as string;
            const title = formData.get('title') as string;
            const message = formData.get('message') as string;
            sendNotification(recipient, title, message);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alıcı</label>
                <select name="recipient" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="all">Tüm Kullanıcılar</option>
                  <option value="stores">Mağaza Sahipleri</option>
                  <option value="customers">Müşteriler</option>
                  <option value="couriers">Kuryeler</option>
                  <option value="specific">Belirli Kullanıcı</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Başlık</label>
                <input
                  type="text"
                  name="title"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Bildirim başlığı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mesaj</label>
                <textarea
                  name="message"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Bildirim mesajı"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Kullanıcı Düzenle</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              updateUser(selectedUser.id, {
                displayName: formData.get('displayName') as string,
                phoneNumber: formData.get('phoneNumber') as string,
                address: formData.get('address') as string,
                bio: formData.get('bio') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
                  <input
                    type="text"
                    name="displayName"
                    defaultValue={selectedUser.displayName || ''}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    defaultValue={selectedUser.phoneNumber || ''}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={selectedUser.address || ''}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea
                    name="bio"
                    defaultValue={selectedUser.bio || ''}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Store Modal */}
      {isCreateStoreModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mağaza Oluştur</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Create store logic
              alert('Mağaza oluşturuldu');
              setIsCreateStoreModalOpen(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mağaza Adı</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şifre</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateStoreModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sub User Modal */}
      {isCreateSubUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Alt Kullanıcı Oluştur</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createSubUser({
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                displayName: formData.get('displayName') as string,
                permissions: {
                  canViewUsers: formData.get('canViewUsers') === 'on',
                  canManageUsers: formData.get('canManageUsers') === 'on',
                  canViewStores: formData.get('canViewStores') === 'on',
                  canManageStores: formData.get('canManageStores') === 'on',
                  canViewProducts: formData.get('canViewProducts') === 'on',
                  canManageProducts: formData.get('canManageProducts') === 'on',
                  canViewOrders: formData.get('canViewOrders') === 'on',
                  canManageOrders: formData.get('canManageOrders') === 'on',
                  canViewFinance: formData.get('canViewFinance') === 'on',
                  canViewAnalytics: formData.get('canViewAnalytics') === 'on',
                  canSendNotifications: formData.get('canSendNotifications') === 'on',
                  canManageCouriers: formData.get('canManageCouriers') === 'on',
                },
              });
            }}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
                    <input
                      type="text"
                      name="displayName"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                    <input
                      type="email"
                      name="email"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şifre</label>
                  <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Sayfa İzinleri</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="canViewUsers" className="mr-2" />
                        <span className="text-sm">Kullanıcıları Görüntüle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canManageUsers" className="mr-2" />
                        <span className="text-sm">Kullanıcıları Yönet</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canViewStores" className="mr-2" />
                        <span className="text-sm">Mağazaları Görüntüle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canManageStores" className="mr-2" />
                        <span className="text-sm">Mağazaları Yönet</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canViewProducts" className="mr-2" />
                        <span className="text-sm">Ürünleri Görüntüle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canManageProducts" className="mr-2" />
                        <span className="text-sm">Ürünleri Yönet</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="canViewOrders" className="mr-2" />
                        <span className="text-sm">Siparişleri Görüntüle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canManageOrders" className="mr-2" />
                        <span className="text-sm">Siparişleri Yönet</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canViewFinance" className="mr-2" />
                        <span className="text-sm">Finansı Görüntüle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canViewAnalytics" className="mr-2" />
                        <span className="text-sm">Analitiği Görüntüle</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canSendNotifications" className="mr-2" />
                        <span className="text-sm">Bildirim Gönder</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="canManageCouriers" className="mr-2" />
                        <span className="text-sm">Kuryeleri Yönet</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateSubUserModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Alt Kullanıcı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {isPermissionsModalOpen && selectedUserForPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              İzinleri Düzenle - {selectedUserForPermissions.displayName || selectedUserForPermissions.email}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              updateUserPermissions(selectedUserForPermissions.id, {
                canViewUsers: formData.get('canViewUsers') === 'on',
                canManageUsers: formData.get('canManageUsers') === 'on',
                canViewStores: formData.get('canViewStores') === 'on',
                canManageStores: formData.get('canManageStores') === 'on',
                canViewProducts: formData.get('canViewProducts') === 'on',
                canManageProducts: formData.get('canManageProducts') === 'on',
                canViewOrders: formData.get('canViewOrders') === 'on',
                canManageOrders: formData.get('canManageOrders') === 'on',
                canViewFinance: formData.get('canViewFinance') === 'on',
                canViewAnalytics: formData.get('canViewAnalytics') === 'on',
                canSendNotifications: formData.get('canSendNotifications') === 'on',
                canManageCouriers: formData.get('canManageCouriers') === 'on',
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Kullanıcı Yönetimi</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canViewUsers"
                        defaultChecked={selectedUserForPermissions.permissions?.canViewUsers}
                        className="mr-2"
                      />
                      <span className="text-sm">Kullanıcıları Görüntüle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canManageUsers"
                        defaultChecked={selectedUserForPermissions.permissions?.canManageUsers}
                        className="mr-2"
                      />
                      <span className="text-sm">Kullanıcıları Yönet</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Mağaza Yönetimi</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canViewStores"
                        defaultChecked={selectedUserForPermissions.permissions?.canViewStores}
                        className="mr-2"
                      />
                      <span className="text-sm">Mağazaları Görüntüle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canManageStores"
                        defaultChecked={selectedUserForPermissions.permissions?.canManageStores}
                        className="mr-2"
                      />
                      <span className="text-sm">Mağazaları Yönet</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Ürün Yönetimi</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canViewProducts"
                        defaultChecked={selectedUserForPermissions.permissions?.canViewProducts}
                        className="mr-2"
                      />
                      <span className="text-sm">Ürünleri Görüntüle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canManageProducts"
                        defaultChecked={selectedUserForPermissions.permissions?.canManageProducts}
                        className="mr-2"
                      />
                      <span className="text-sm">Ürünleri Yönet</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Sipariş Yönetimi</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canViewOrders"
                        defaultChecked={selectedUserForPermissions.permissions?.canViewOrders}
                        className="mr-2"
                      />
                      <span className="text-sm">Siparişleri Görüntüle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canManageOrders"
                        defaultChecked={selectedUserForPermissions.permissions?.canManageOrders}
                        className="mr-2"
                      />
                      <span className="text-sm">Siparişleri Yönet</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Finans & Analitik</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canViewFinance"
                        defaultChecked={selectedUserForPermissions.permissions?.canViewFinance}
                        className="mr-2"
                      />
                      <span className="text-sm">Finansı Görüntüle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canViewAnalytics"
                        defaultChecked={selectedUserForPermissions.permissions?.canViewAnalytics}
                        className="mr-2"
                      />
                      <span className="text-sm">Analitiği Görüntüle</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Diğer İzinler</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canSendNotifications"
                        defaultChecked={selectedUserForPermissions.permissions?.canSendNotifications}
                        className="mr-2"
                      />
                      <span className="text-sm">Bildirim Gönder</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="canManageCouriers"
                        defaultChecked={selectedUserForPermissions.permissions?.canManageCouriers}
                        className="mr-2"
                      />
                      <span className="text-sm">Kuryeleri Yönet</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsPermissionsModalOpen(false);
                    setSelectedUserForPermissions(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  İzinleri Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Orders Modal */}
      {isStoreOrdersModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{selectedStore.name} - Siparişler</h3>
            <div className="space-y-4">
              {storeOrders.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Bu mağaza için sipariş bulunamadı.</p>
              ) : (
                storeOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Sipariş #{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Müşteri: {order.userId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toplam: ₺{order.total}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Durum: {order.status}</p>
                      </div>
                      <div className="space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          Düzenle
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                          İptal Et
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsStoreOrdersModalOpen(false)}
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