'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'coupon' | 'promotion';
  discountPercent?: number;
  discountAmount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageCount: number;
}

export default function AdminCampaignsPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchCampaigns();
  }, [user, role, router]);

  const fetchCampaigns = async () => {
    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
    const campaignsData = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Campaign));
    setCampaigns(campaignsData);
    setLoading(false);
  };

  const toggleCampaignStatus = async (campaignId: string, isActive: boolean) => {
    await updateDoc(doc(db, 'campaigns', campaignId), { isActive });
    fetchCampaigns();
  };

  const deleteCampaign = async (campaignId: string) => {
    if (confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) {
      await deleteDoc(doc(db, 'campaigns', campaignId));
      fetchCampaigns();
    }
  };

  const openEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedCampaign(null);
    setIsCreateModalOpen(true);
  };

  const saveCampaign = async (campaignData: Omit<Campaign, 'id' | 'usageCount'>) => {
    if (selectedCampaign) {
      // Update existing campaign
      await updateDoc(doc(db, 'campaigns', selectedCampaign.id), campaignData);
    } else {
      // Create new campaign
      await addDoc(collection(db, 'campaigns'), {
        ...campaignData,
        usageCount: 0,
      });
    }
    fetchCampaigns();
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedCampaign(null);
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kampanya & Kupon Yönetimi</h1>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Yeni Kampanya
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kampanya Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İndirim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Başlangıç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Bitiş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kullanım
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
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {campaign.type === 'discount' ? 'İndirim' : campaign.type === 'coupon' ? 'Kupon' : 'Promosyon'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {campaign.discountPercent ? `%${campaign.discountPercent}` : campaign.discountAmount ? `₺${campaign.discountAmount}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {campaign.usageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {campaign.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id, !campaign.isActive)}
                        className={`px-3 py-1 rounded text-sm ${
                          campaign.isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {campaign.isActive ? 'Durdur' : 'Başlat'}
                      </button>
                      <button
                        onClick={() => openEditModal(campaign)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
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
      </div>

      {/* Create/Edit Campaign Modal */}
      {(isEditModalOpen || isCreateModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {isEditModalOpen ? 'Kampanya Düzenle' : 'Yeni Kampanya Oluştur'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              saveCampaign({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as 'discount' | 'coupon' | 'promotion',
                discountPercent: formData.get('discountPercent') ? Number(formData.get('discountPercent')) : undefined,
                discountAmount: formData.get('discountAmount') ? Number(formData.get('discountAmount')) : undefined,
                startDate: new Date(formData.get('startDate') as string),
                endDate: new Date(formData.get('endDate') as string),
                isActive: formData.get('isActive') === 'on',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kampanya Adı</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedCampaign?.name || ''}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
                  <textarea
                    name="description"
                    defaultValue={selectedCampaign?.description || ''}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tür</label>
                    <select
                      name="type"
                      defaultValue={selectedCampaign?.type || 'discount'}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="discount">İndirim</option>
                      <option value="coupon">Kupon</option>
                      <option value="promotion">Promosyon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">İndirim Yüzdesi (%)</label>
                    <input
                      type="number"
                      name="discountPercent"
                      min="0"
                      max="100"
                      defaultValue={selectedCampaign?.discountPercent || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">İndirim Tutarı (₺)</label>
                    <input
                      type="number"
                      name="discountAmount"
                      min="0"
                      step="0.01"
                      defaultValue={selectedCampaign?.discountAmount || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aktif</label>
                    <div className="mt-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={selectedCampaign?.isActive ?? true}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Başlangıç Tarihi</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      defaultValue={selectedCampaign?.startDate ? new Date(selectedCampaign.startDate).toISOString().slice(0, 16) : ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bitiş Tarihi</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      defaultValue={selectedCampaign?.endDate ? new Date(selectedCampaign.endDate).toISOString().slice(0, 16) : ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsCreateModalOpen(false);
                    setSelectedCampaign(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditModalOpen ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}