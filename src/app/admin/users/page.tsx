'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';
import { User } from '@/types';

export default function UsersManagement() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isCreateSubUserModalOpen, setIsCreateSubUserModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    loadUsers();
  }, [user, role, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as User))
        .filter(user => !user.deleted); // Silinmiş kullanıcıları filtrele
      setUsers(usersData);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: number) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      loadUsers();
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      alert('Rol güncellenirken hata oluştu');
    }
  };

  const banUser = async (userId: string, banned: boolean, banDuration?: number, banReason?: string, banNote?: string) => {
    try {
      const updateData: any = { banned };
      if (banned) {
        updateData.bannedAt = new Date();
        updateData.bannedBy = user?.uid;
        if (banDuration) updateData.banDuration = banDuration;
        if (banReason) updateData.banReason = banReason;
        if (banNote) updateData.banNote = banNote;
      } else {
        updateData.banDuration = null;
        updateData.banReason = null;
        updateData.banNote = null;
        updateData.bannedAt = null;
        updateData.bannedBy = null;
      }
      await updateDoc(doc(db, 'users', userId), updateData);
      loadUsers();
      setIsBanModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Kullanıcı yasaklama hatası:', error);
      alert('Kullanıcı yasaklanırken hata oluştu');
    }
  };

  const updateUserPermissions = async (userId: string, permissions: User['permissions']) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        permissions: permissions,
        updatedAt: new Date(),
      });
      loadUsers();
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
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const newUser = userCredential.user;

      await setDoc(doc(db, 'users', newUser.uid), {
        id: newUser.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: 5,
        permissions: userData.permissions,
        createdAt: new Date(),
        isActive: true,
      });

      loadUsers();
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
        await updateDoc(doc(db, 'users', userId), {
          banned: true,
          deleted: true,
          deletedAt: new Date(),
        });
        loadUsers();
        alert('Kullanıcı sistemden kaldırıldı.');
      } catch (error: any) {
        console.error('Kullanıcı silme hatası:', error);
        alert(`Kullanıcı silinemedi: ${error.message}`);
      }
    }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      loadUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      alert('Kullanıcı güncellenirken hata oluştu');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openBanModal = (user: User) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const openPermissionsModal = (user: User) => {
    setSelectedUserForPermissions(user);
    setIsPermissionsModalOpen(true);
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return 'Admin';
      case 1: return 'Mağaza';
      case 2: return 'Müşteri';
      case 3: return 'Kurye';
      case 5: return 'Alt Kullanıcı';
      default: return 'Bilinmiyor';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 5: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!user || role !== 0) {
    return <div>Erişim reddedildi.</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kullanıcı</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Kullanıcı</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => !u.banned).length}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Yasaklı Kullanıcı</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.banned).length}</p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Kullanıcı</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.role === 0).length}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={() => setIsCreateSubUserModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Alt Kullanıcı Oluştur
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Yasak Bilgileri
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Kullanıcılar yükleniyor...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.displayName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.displayName || 'İsimsiz'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, Number(e.target.value))}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getRoleColor(user.role)}`}
                        >
                          <option value={0}>Admin</option>
                          <option value={1}>Mağaza</option>
                          <option value={2}>Müşteri</option>
                          <option value={3}>Kurye</option>
                          <option value={5}>Alt Kullanıcı</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.banned ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {user.banned ? 'Yasaklı' : 'Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.banned ? (
                          <div className="space-y-1">
                            {user.banDuration && <div>Süre: {user.banDuration} gün</div>}
                            {user.banReason && <div>Sebep: {user.banReason}</div>}
                            {user.bannedAt && <div>Tarih: {new Date(user.bannedAt).toLocaleDateString('tr-TR')}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Düzenle
                        </button>
                        {user.role === 5 && (
                          <button
                            onClick={() => openPermissionsModal(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            İzinler
                          </button>
                        )}
                        <button
                          onClick={() => openBanModal(user)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
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

      {/* Ban User Modal */}
      {isBanModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {selectedUser.banned ? 'Yasağı Kaldır' : 'Kullanıcı Yasakla'}
            </h3>
            {!selectedUser.banned && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const banDuration = formData.get('banDuration') ? Number(formData.get('banDuration')) : undefined;
                const banReason = formData.get('banReason') as string;
                const banNote = formData.get('banNote') as string;
                banUser(selectedUser.id, true, banDuration, banReason, banNote);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yasaklama Süresi (gün)</label>
                    <input
                      type="number"
                      name="banDuration"
                      placeholder="Süresiz için boş bırakın"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yasaklama Sebebi</label>
                    <select
                      name="banReason"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Sebep seçin</option>
                      <option value="spam">Spam/Hizmet dışı kullanım</option>
                      <option value="fraud">Dolandırıcılık</option>
                      <option value="harassment">Taciz/Hakaret</option>
                      <option value="violation">Kurallara aykırı davranış</option>
                      <option value="security">Güvenlik ihlali</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Not</label>
                    <textarea
                      name="banNote"
                      placeholder="Detaylı açıklama..."
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsBanModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Yasakla
                  </button>
                </div>
              </form>
            )}
            {selectedUser.banned && (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Bu kullanıcının yasağını kaldırmak istediğinizden emin misiniz?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsBanModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => banUser(selectedUser.id, false)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Yasağı Kaldır
                  </button>
                </div>
              </div>
            )}
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
    </AdminLayout>
  );
}