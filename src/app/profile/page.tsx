'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword } from 'firebase/auth';
import { db, storage } from '@/lib/firebase';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, MapPin as MapPinIcon, Key, Upload, Camera } from 'lucide-react';
import DashboardLayout from '@/components/general/panels/DashboardLayout';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

// Harita bileşenini dinamik olarak import et (SSR sorununu önlemek için)
const AddressMap = dynamic(() => import('@/components/general/AddressMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">Harita yükleniyor...</div>
});

export default function ProfilePage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    address: {
      province: '',
      district: '',
      neighborhood: '',
      street: '',
      detailedAddress: '',
      latitude: null as number | null,
      longitude: null as number | null,
      fullAddress: ''
    },
    bio: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // İsim formatını düzenleme fonksiyonu
  const formatDisplayName = (name: string | undefined) => {
    if (!name) return '';

    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Adres verisini parse etme fonksiyonu
  const parseAddress = (address: any) => {
    if (!address) {
      return {
        province: '',
        district: '',
        neighborhood: '',
        street: '',
        detailedAddress: '',
        latitude: null as number | null,
        longitude: null as number | null,
        fullAddress: ''
      };
    }

    // Eğer adres zaten yeni formatta ise
    if (typeof address === 'object' && address.province !== undefined) {
      return {
        province: address.province || '',
        district: address.district || '',
        neighborhood: address.neighborhood || '',
        street: address.street || '',
        detailedAddress: address.detailedAddress || '',
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        fullAddress: address.fullAddress || ''
      };
    }

    // Eski formatı yeni formata dönüştür
    if (typeof address === 'object') {
      const detailedAddress = [
        address.buildingNo && `No: ${address.buildingNo}`,
        address.apartmentNo && `Daire: ${address.apartmentNo}`,
        address.postalCode && `PK: ${address.postalCode}`
      ].filter(Boolean).join(', ');

      return {
        province: address.city || address.province || '', // city'yi province olarak kullan
        district: address.district || '',
        neighborhood: address.neighborhood || '',
        street: address.street || '',
        detailedAddress: detailedAddress,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        fullAddress: address.fullAddress || ''
      };
    }

    // Eğer adres string ise
    return {
      province: '',
      district: '',
      neighborhood: '',
      street: '',
      detailedAddress: '',
      latitude: null,
      longitude: null,
      fullAddress: address
    };
  };

  // Reverse geocoding fonksiyonu - koordinatlardan adres bilgilerini alır
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=tr`
      );

      if (!response.ok) {
        throw new Error('Geocoding API hatası');
      }

      const data = await response.json();
      console.log('Geocoding sonucu:', data);

      if (data && data.address) {
        const address = data.address;

        // Nominatim'den gelen adres verilerini parse et
        const parsedAddress = {
          province: address.city || address.town || address.village || address.state || '',
          district: address.county || address.district || address.suburb || '',
          neighborhood: address.neighbourhood || address.suburb || address.hamlet || '',
          street: address.road || address.pedestrian || address.path || address.footway || '',
          detailedAddress: address.house_number ? `No: ${address.house_number}` : '',
          postalCode: address.postcode || '',
        };

        console.log('Parse edilmiş adres:', parsedAddress);

        return parsedAddress;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding hatası:', error);
      return null;
    }
  };

  // Konum alma fonksiyonu
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum özelliğini desteklemiyor.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    toast.info('Konumunuz bulunuyor...', {
      position: "top-right",
      autoClose: 2000,
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Konum bulundu:', latitude, longitude);

        // Önce koordinatları güncelle
        setFormData(prevFormData => ({
          ...prevFormData,
          address: {
            ...prevFormData.address,
            latitude,
            longitude
          }
        }));

        // Reverse geocoding ile adres bilgilerini al
        toast.info('Adres bilgileri alınıyor...', {
          position: "top-right",
          autoClose: 2000,
        });

        const addressInfo = await reverseGeocode(latitude, longitude);

        if (addressInfo) {
          setFormData(prevFormData => ({
            ...prevFormData,
            address: {
              ...prevFormData.address,
              latitude,
              longitude,
              ...addressInfo
            }
          }));

          toast.success('Konum ve adres bilgileriniz başarıyla dolduruldu!', {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.success(`Konumunuz bulundu! (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      },
      (error) => {
        console.error('Konum alma hatası:', error);
        let errorMessage = 'Konum alınamadı.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi mevcut değil. Lütfen GPS\'inizi kontrol edin.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.';
            break;
        }
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 dakika
      }
    );
  };

  // Profil resmi yükleme fonksiyonu
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resim dosyası 5MB\'dan büyük olamaz.');
      return;
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Firestore'da profil resmini güncelle
      await updateDoc(doc(db, 'users', user.uid), {
        profileImage: downloadURL,
        updatedAt: new Date()
      });

      setProfileImage(downloadURL);
      toast.success('Profil resmi başarıyla güncellendi!');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      toast.error('Profil resmi yüklenirken bir hata oluştu.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Şifre değiştirme fonksiyonu
  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      // Firebase Auth ile şifre değiştirme
      await updatePassword(user, passwordData.newPassword);

      // Password data sıfırla
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Şifreniz başarıyla güncellendi!');
      setActiveTab('profile');
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      let errorMessage = 'Şifre değiştirilirken bir hata oluştu.';

      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'Yeni şifre çok zayıf. Daha güçlü bir şifre seçin.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Güvenlik nedeniyle yeniden giriş yapmanız gerekiyor.';
          break;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Load user data from profile
    if (user) {
      setFormData({
        phone: user.profile?.phoneNumber || user.profile?.phone || user.phoneNumber || '',
        address: parseAddress(user.profile?.address),
        bio: user.profile?.bio || ''
      });
      setProfileImage(user.profile?.profileImage || null);
    }
  }, [user, router]);

  // Otomatik kaydetme fonksiyonu
  const autoSave = async (data: any) => {
    if (!user) return;

    try {
      // Adres objesini Firestore'a uygun formata dönüştür
      const addressData = data.address ? {
        ...data.address,
        fullAddress: [
          data.address.street,
          data.address.detailedAddress
        ].filter(Boolean).join(', ') + `, ${data.address.neighborhood}, ${data.address.district}, ${data.address.province}`
      } : data.address;

      const updateData: any = {};
      if (data.phone !== undefined) updateData.phoneNumber = data.phone;
      if (addressData) updateData.address = addressData;
      if (data.bio !== undefined) updateData.bio = data.bio;
      updateData.updatedAt = new Date();

      await updateDoc(doc(db, 'users', user.uid), updateData);

      toast.success('Bilgileriniz kaydedildi!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Bilgiler kaydedilirken bir hata oluştu.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Form data değişikliğinde state güncelle
  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Adres değişikliğinde state güncelle
  const handleAddressChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [field]: value }
    });
  };

  // Input'tan çıkıldığında kaydet
  const handleBlur = () => {
    autoSave(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const getRoleName = (role: number | null) => {
    switch (role) {
      case 0: return 'Admin';
      case 1: return 'Mağaza';
      case 2: return 'Müşteri';
      case 3: return 'Kurye';
      default: return 'Kullanıcı';
    }
  };

  const getRoleColor = (role: number | null) => {
    switch (role) {
      case 0: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 1: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 2: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Profil resminizi değiştirmek için fotoğrafın üzerine tıklayın
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ad Soyad
              </label>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900 dark:text-white">
                  {formatDisplayName(user.profile?.displayName || user.displayName) || 'Belirtilmemiş'}
                </span>
              </div>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Ad soyad değiştirilemez
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta
              </label>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900 dark:text-white">{user.email}</span>
              </div>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                E-posta değiştirilemez
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Telefon numaranızı girin"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hakkımda
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleFormChange('bio', e.target.value)}
                onBlur={handleBlur}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Kendiniz hakkında bilgi verin"
              />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            {/* Address Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  İl
                </label>
                <input
                  type="text"
                  value={formData.address.province}
                  onChange={(e) => handleAddressChange('province', e.target.value)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="İstanbul"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  İlçe
                </label>
                <input
                  type="text"
                  value={formData.address.district}
                  onChange={(e) => handleAddressChange('district', e.target.value)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Kadıköy"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Mahalle
                </label>
                <input
                  type="text"
                  value={formData.address.neighborhood}
                  onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Caferağa"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Sokak/Cadde
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Caferağa Sokak"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Açık Adres
                </label>
                <textarea
                  value={formData.address.detailedAddress}
                  onChange={(e) => handleAddressChange('detailedAddress', e.target.value)}
                  onBlur={handleBlur}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Bina no, daire no, kat bilgisi vb."
                />
              </div>
            </div>

            {/* Map Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Konum Seçimi
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Konumu Bul
                </button>
              </div>
              <AddressMap
                latitude={formData.address.latitude}
                longitude={formData.address.longitude}
                onLocationSelect={(lat, lng) => setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    latitude: lat,
                    longitude: lng
                  }
                })}
                height="h-80"
                isEditing={true}
              />
              {(formData.address.latitude && formData.address.longitude) && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Mevcut konum: {formData.address.latitude.toFixed(6)}, {formData.address.longitude.toFixed(6)}
                </div>
              )}

              {/* Full Address Display */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Tam Adres
                </label>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {[formData.address.street, formData.address.detailedAddress, formData.address.neighborhood, formData.address.district, formData.address.province].filter(Boolean).join(', ') || 'Adres bilgileri giriniz...'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Key className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Şifre Güncelleme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Güvenliğiniz için güçlü bir şifre seçin
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Profil Bilgileri" subtitle="Hesap bilgilerinizi yönetin ve kişiselleştirin">
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'address'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <MapPin className="w-5 h-5 mx-auto mb-2" />
                Adresim
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Key className="w-5 h-5 mx-auto mb-2" />
                Şifre Güncelleme
              </button>
            </nav>
          </div>

          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
