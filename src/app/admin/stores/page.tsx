'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/admin/panels/layout';
import { Store, SiteCategory } from '@/types';
import { toast } from 'react-toastify';
import StoreLocationMap from '@/components/admin/StoreLocationMap';

interface StoreApprovalModalProps {
  store: Store;
  onClose: () => void;
  onApprove: (storeId: string, categoryId: string) => void;
  onRequestCorrection: (storeId: string, fields: string[], description: string) => void;
  categories: SiteCategory[];
}

export default function AdminStoresPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [categories, setCategories] = useState<SiteCategory[]>([]);

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchStores();
    fetchCategories();
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

  const fetchCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SiteCategory));
    setCategories(categoriesData);
  };

  const handleApproveStore = async (storeId: string, categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        toast.error('Kategori bulunamadı');
        return;
      }

      await updateDoc(doc(db, 'stores', storeId), {
        status: 'approved',
        isActive: true,
        categoryId: categoryId,
        categoryName: category.name,
        approvedBy: user?.uid,
        approvedAt: new Date(),
      });

      // Kategorideki mağaza sayısını güncelle
      await updateDoc(doc(db, 'categories', categoryId), {
        storeCount: category.storeCount + 1,
      });

      toast.success('Mağaza başarıyla onaylandı ve yayınlandı');
      fetchStores();
      fetchCategories();
    } catch (error) {
      console.error('Mağaza onaylama hatası:', error);
      toast.error('Mağaza onaylanırken hata oluştu');
    }
  };

  const handleRequestCorrection = async (storeId: string, fields: string[], description: string) => {
    try {
      const correctionRequest = {
        id: Date.now().toString(),
        requestedBy: user?.uid,
        requestedAt: new Date(),
        fields: fields,
        description: description,
        status: 'pending',
        corrections: [],
      };

      const storeRef = doc(db, 'stores', storeId);
      const storeDoc = await getDoc(storeRef);
      const currentData = storeDoc.data();

      const existingRequests = currentData?.correctionRequests || [];
      await updateDoc(storeRef, {
        status: 'needs_correction',
        correctionRequests: [...existingRequests, correctionRequest],
      });

      toast.success('Düzeltme talebi başarıyla gönderildi');
      fetchStores();
    } catch (error) {
      console.error('Düzeltme talebi gönderme hatası:', error);
      toast.error('Düzeltme talebi gönderilirken hata oluştu');
    }
  };

  const openApprovalModal = (store: Store) => {
    setSelectedStore(store);
    setIsApprovalModalOpen(true);
  };

  const updateStoreStatus = async (storeId: string, status: Store['status']) => {
    await updateDoc(doc(db, 'stores', storeId), { status });
    fetchStores();
  };

  const openEditModal = (store: Store) => {
    setSelectedStore(store);
    setIsEditModalOpen(true);
  };

  const updateStore = async (storeId: string, data: Partial<Store>) => {
    await updateDoc(doc(db, 'stores', storeId), data);
    fetchStores();
    setIsEditModalOpen(false);
    setSelectedStore(null);
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
                        {store.status === 'approved' ? 'Onaylandı' :
                         store.status === 'pending' ? 'Bekliyor' :
                         store.status === 'rejected' ? 'Reddedildi' :
                         store.status === 'needs_correction' ? 'Düzeltme Bekliyor' :
                         store.status === 'banned' ? 'Yasaklı' : 'Bilinmiyor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {store.status === 'pending' && (
                          <button
                            onClick={() => openApprovalModal(store)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            İncele ve Onayla
                          </button>
                        )}
                        {store.status === 'needs_correction' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Düzeltme Talep Edildi
                          </span>
                        )}
                        {store.status === 'approved' && (
                          <button
                            onClick={() => updateStoreStatus(store.id, 'banned')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          >
                            Yasakla
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(store)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                        >
                          Düzenle
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

      {/* Edit Store Modal */}
      {isEditModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mağaza Düzenle</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              updateStore(selectedStore.id, {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
                description: formData.get('description') as string,
                taxId: formData.get('taxId') as string,
                companyName: formData.get('companyName') as string,
                corporateType: formData.get('corporateType') as 'PRIVATE' | 'LIMITED' | 'INCORPORATED',
                iban: formData.get('iban') as string,
                storeType: formData.get('storeType') as 'esnaf' | 'avm' | 'marka',
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mağaza Adı</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedStore.name || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedStore.email || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={selectedStore.phone || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vergi/TC Kimlik No</label>
                    <input
                      type="text"
                      name="taxId"
                      defaultValue={selectedStore.taxId || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şirket Adı</label>
                    <input
                      type="text"
                      name="companyName"
                      defaultValue={selectedStore.companyName || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şirket Türü</label>
                    <select
                      name="corporateType"
                      defaultValue={selectedStore.corporateType || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="PRIVATE">Şahıs</option>
                      <option value="LIMITED">Limited</option>
                      <option value="INCORPORATED">Anonim</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IBAN</label>
                    <input
                      type="text"
                      name="iban"
                      defaultValue={selectedStore.iban || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mağaza Türü</label>
                    <select
                      name="storeType"
                      defaultValue={selectedStore.storeType || ''}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="esnaf">Esnaf</option>
                      <option value="avm">AVM</option>
                      <option value="marka">Marka</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={selectedStore.address || ''}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
                  <textarea
                    name="description"
                    defaultValue={selectedStore.description || ''}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Belgeler</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedStore.documents?.idCard && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kimlik</label>
                        <a href={selectedStore.documents.idCard} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Görüntüle</a>
                      </div>
                    )}
                    {selectedStore.documents?.driversLicense && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ehliyet</label>
                        <a href={selectedStore.documents.driversLicense} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Görüntüle</a>
                      </div>
                    )}
                    {selectedStore.documents?.taxCertificate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vergi Levhası</label>
                        <a href={selectedStore.documents.taxCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Görüntüle</a>
                      </div>
                    )}
                  </div>
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

      {/* Store Approval Modal */}
      {isApprovalModalOpen && selectedStore && (
        <StoreApprovalModal
          store={selectedStore}
          onClose={() => setIsApprovalModalOpen(false)}
          onApprove={handleApproveStore}
          onRequestCorrection={handleRequestCorrection}
          categories={categories}
        />
      )}
    </AdminLayout>
  );
}

function StoreApprovalModal({ store, onClose, onApprove, onRequestCorrection, categories }: StoreApprovalModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [correctionDescription, setCorrectionDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Kategori ismini title case'e çeviren fonksiyon
  const toTitleCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // React Icon render fonksiyonu
  const renderIcon = (iconName: string, color?: string) => {
    if (!iconName) return null;

    // Popüler React Icons kütüphanelerini import et
    const iconLibraries = {
      // FontAwesome
      FaShoppingBag: () => import('react-icons/fa').then(m => m.FaShoppingBag),
      FaUtensils: () => import('react-icons/fa').then(m => m.FaUtensils),
      FaTshirt: () => import('react-icons/fa').then(m => m.FaTshirt),
      FaLaptop: () => import('react-icons/fa').then(m => m.FaLaptop),
      FaHome: () => import('react-icons/fa').then(m => m.FaHome),
      FaBook: () => import('react-icons/fa').then(m => m.FaBook),
      FaGamepad: () => import('react-icons/fa').then(m => m.FaGamepad),
      FaBaby: () => import('react-icons/fa').then(m => m.FaBaby),
      FaPalette: () => import('react-icons/fa').then(m => m.FaPalette),
      FaCouch: () => import('react-icons/fa').then(m => m.FaCouch),
      FaShoppingCart: () => import('react-icons/fa').then(m => m.FaShoppingCart),
      FaStore: () => import('react-icons/fa').then(m => m.FaStore),
      FaTools: () => import('react-icons/fa').then(m => m.FaTools),
      FaCar: () => import('react-icons/fa').then(m => m.FaCar),
      FaHeartbeat: () => import('react-icons/fa').then(m => m.FaHeartbeat),
      FaGem: () => import('react-icons/fa').then(m => m.FaGem),
      FaClock: () => import('react-icons/fa').then(m => m.FaClock),
      FaGlasses: () => import('react-icons/fa').then(m => m.FaGlasses),

      // Material Design
      MdShoppingBag: () => import('react-icons/md').then(m => m.MdShoppingBag),
      MdRestaurant: () => import('react-icons/md').then(m => m.MdRestaurant),
      MdCheckroom: () => import('react-icons/md').then(m => m.MdCheckroom),
      MdComputer: () => import('react-icons/md').then(m => m.MdComputer),
      MdHome: () => import('react-icons/md').then(m => m.MdHome),
      MdMenuBook: () => import('react-icons/md').then(m => m.MdMenuBook),
      MdSportsEsports: () => import('react-icons/md').then(m => m.MdSportsEsports),
      MdChildCare: () => import('react-icons/md').then(m => m.MdChildCare),
      MdPalette: () => import('react-icons/md').then(m => m.MdPalette),
      MdChair: () => import('react-icons/md').then(m => m.MdChair),
      MdShoppingCart: () => import('react-icons/md').then(m => m.MdShoppingCart),
      MdStore: () => import('react-icons/md').then(m => m.MdStore),
      MdBuild: () => import('react-icons/md').then(m => m.MdBuild),
      MdDirectionsCar: () => import('react-icons/md').then(m => m.MdDirectionsCar),
      MdFavorite: () => import('react-icons/md').then(m => m.MdFavorite),
      MdDiamond: () => import('react-icons/md').then(m => m.MdDiamond),
      MdSchedule: () => import('react-icons/md').then(m => m.MdSchedule),
      MdVisibility: () => import('react-icons/md').then(m => m.MdVisibility),

      // Ant Design Icons
      AiOutlineFormatPainter: () => import('react-icons/ai').then(m => m.AiOutlineFormatPainter),
      AiOutlineShopping: () => import('react-icons/ai').then(m => m.AiOutlineShopping),
      AiOutlineHome: () => import('react-icons/ai').then(m => m.AiOutlineHome),
      AiOutlineBook: () => import('react-icons/ai').then(m => m.AiOutlineBook),
      AiOutlineCar: () => import('react-icons/ai').then(m => m.AiOutlineCar),
      AiOutlineHeart: () => import('react-icons/ai').then(m => m.AiOutlineHeart),
      AiOutlineStar: () => import('react-icons/ai').then(m => m.AiOutlineStar),
      AiOutlineGift: () => import('react-icons/ai').then(m => m.AiOutlineGift),
      AiOutlineTool: () => import('react-icons/ai').then(m => m.AiOutlineTool),
      AiOutlineCoffee: () => import('react-icons/ai').then(m => m.AiOutlineCoffee),
    };

    const iconLoader = iconLibraries[iconName as keyof typeof iconLibraries];
    if (iconLoader) {
      return <DynamicIcon loader={iconLoader} color={color} />;
    }

    return null;
  };

  // Dinamik ikon bileşeni
  const DynamicIcon: React.FC<{ loader: () => Promise<any>, color?: string }> = ({ loader, color }) => {
    const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
      loader().then(Icon => {
        setIconComponent(() => Icon);
      }).catch(() => {
        setIconComponent(null);
      });
    }, [loader]);

    if (!IconComponent) return null;
    return <IconComponent className="text-lg" style={color ? { color } : undefined} />;
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleApprove = () => {
    if (!selectedCategory) {
      toast.error('Lütfen bir kategori seçin');
      return;
    }
    onApprove(store.id, selectedCategory);
    onClose();
  };

  const handleRequestCorrection = () => {
    if (selectedFields.length === 0) {
      toast.error('Lütfen en az bir alan seçin');
      return;
    }
    if (!correctionDescription.trim()) {
      toast.error('Lütfen düzeltme açıklaması girin');
      return;
    }
    onRequestCorrection(store.id, selectedFields, correctionDescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {store.logo && (
                <img
                  src={store.logo}
                  alt="Mağaza Logosu"
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{store.name}</h2>
                <p className="text-blue-100">{store.storeType} • {store.status}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
          {/* Left Column - CV Style Info */}
          <div className="lg:w-2/3 p-6 overflow-y-auto">
            {/* Kişisel Bilgiler */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Kişisel Bilgiler
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Ad Soyad</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {store.ownerName || 'Belirtilmemiş'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">E-posta</label>
                    <p className="text-gray-900 dark:text-white">{store.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Telefon</label>
                    <p className="text-gray-900 dark:text-white">{store.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">IBAN</label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">
                      {store.iban || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Şirket Bilgileri */}
            {(store.companyName || store.taxId || store.corporateType) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Şirket Bilgileri
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {store.companyName && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şirket Adı</label>
                        <p className="text-gray-900 dark:text-white font-medium">{store.companyName}</p>
                      </div>
                    )}
                    {store.corporateType && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şirket Türü</label>
                        <p className="text-gray-900 dark:text-white">
                          {store.corporateType === 'PRIVATE' ? 'Şahıs' :
                           store.corporateType === 'LIMITED' ? 'Limited' :
                           store.corporateType === 'INCORPORATED' ? 'Anonim' : store.corporateType}
                        </p>
                      </div>
                    )}
                    {store.taxId && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {store.corporateType === 'PRIVATE' ? 'TC Kimlik No' : 'Vergi/TC Kimlik No'}
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono">{store.taxId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mağaza Bilgileri */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                </svg>
                Mağaza Bilgileri
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Mağaza Adı</label>
                    <p className="text-gray-900 dark:text-white font-medium">{store.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Mağaza Türü</label>
                    <p className="text-gray-900 dark:text-white">{store.storeType}</p>
                  </div>
                  {store.branchCount && store.branchCount > 1 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Şube Sayısı</label>
                      <p className="text-gray-900 dark:text-white">{store.branchCount}</p>
                    </div>
                  )}
                  {store.branchReferenceCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Cari ID</label>
                      <p className="text-gray-900 dark:text-white font-mono">{store.branchReferenceCode}</p>
                    </div>
                  )}
                </div>
                {store.categories && store.categories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Ürün Kategorileri</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {store.categories.map((categoryId: string) => {
                        // Burada kategori adını bulmak için basit bir çözüm
                        // Gerçek uygulamada categories koleksiyonundan çekmek gerekebilir
                        const categoryNames: {[key: string]: string} = {
                          'elektronik': 'Elektronik',
                          'ayakkabi-canta': 'Ayakkabı & Çanta',
                          'bahce-yapi-market-hirdavat-otomatik': 'Bahçe & Yapı Market & Hırdavat & Otomotiv',
                          'kitap-kirtasiye-oyuncak-anne-cocuk': 'Kitap & Kırtasiye & Oyuncak & Anne ve Çocuk Ürünleri',
                          'tekstil': 'Tekstil',
                          'kozmetik': 'Kozmetik',
                          'mobilya': 'Mobilya',
                          'supermarket-petshop-saglik': 'Süpermarket & Petshop & Sağlık',
                          'ev-tekstil-dekorasyon-mutfak': 'Ev Tekstil & Dekorasyon & Mutfak',
                          'aksesuar-saat-gozluk': 'Aksesuar & Saat & Gözlük'
                        };
                        const categoryName = categoryNames[categoryId] || categoryId;
                        const isCourierCompatible = !['bahce-yapi-market-hirdavat-otomatik', 'mobilya'].includes(categoryId);
                        
                        return (
                          <span
                            key={categoryId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {toTitleCase(categoryName)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Adres Bilgileri
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white mb-4">{store.address}</p>
                {store.location && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {store.location.province && <span>{store.location.province}, </span>}
                    {store.location.district && <span>{store.location.district}, </span>}
                    {store.location.neighborhood && <span>{store.location.neighborhood}</span>}
                  </div>
                )}

                {/* Harita */}
                {store.location?.latitude && store.location?.longitude && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mağaza Konumu
                    </h4>
                    <StoreLocationMap
                      latitude={store.location.latitude}
                      longitude={store.location.longitude}
                      storeName={store.name}
                      height="250px"
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Enlem: {store.location.latitude.toFixed(6)}, Boylam: {store.location.longitude.toFixed(6)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {store.authorizedPersons && store.authorizedPersons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Yetkili Kişiler
                </h3>
                <div className="space-y-3">
                  {store.authorizedPersons.map((person, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {person.firstName} {person.lastName}
                        </h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {person.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>📧 {person.email}</p>
                        <p>📱 {person.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Belgeler */}
            {store.documents && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Belgeler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {store.documents.idCard && (
                    <a
                      href={store.documents.idCard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Kimlik</p>
                    </a>
                  )}
                  {store.documents.driversLicense && (
                    <a
                      href={store.documents.driversLicense}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Ehliyet</p>
                    </a>
                  )}
                  {store.documents.taxCertificate && (
                    <a
                      href={store.documents.taxCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Vergi Levhası</p>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="lg:w-1/3 bg-gray-50 dark:bg-gray-700 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">İşlemler</h3>

            {/* Site Kategorisi Seçimi */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Kategori *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon && renderIcon(category.icon, category.color)} {category.name} ({category.storeCount} mağaza)
                  </option>
                ))}
              </select>
            </div>

            {/* Düzeltme Talebi */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Düzeltme Talep Edilecek Alanlar
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                {[
                  { key: 'name', label: 'Mağaza Adı' },
                  { key: 'email', label: 'E-posta' },
                  { key: 'phone', label: 'Telefon' },
                  { key: 'taxId', label: 'Vergi/TC Kimlik No' },
                  { key: 'companyName', label: 'Şirket Adı' },
                  { key: 'corporateType', label: 'Şirket Türü' },
                  { key: 'iban', label: 'IBAN' },
                  { key: 'storeType', label: 'Mağaza Türü' },
                  { key: 'address', label: 'Adres' },
                  { key: 'description', label: 'Açıklama' },
                  { key: 'documents', label: 'Belgeler' },
                  { key: 'authorizedPersons', label: 'Yetkili Kişiler' },
                ].map(field => (
                  <label key={field.key} className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleFieldToggle(field.key)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedFields.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Düzeltme Açıklaması *
                </label>
                <textarea
                  value={correctionDescription}
                  onChange={(e) => setCorrectionDescription(e.target.value)}
                  placeholder="Düzeltme talebinizin nedenini açıklayın..."
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={!selectedCategory}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Onayla ve Yayınla
              </button>

              {selectedFields.length > 0 && (
                <button
                  onClick={handleRequestCorrection}
                  className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Düzeltme Talep Et
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}