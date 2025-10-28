'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, Building2, FileText, Upload, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Store } from '@/types';

interface ProfileFormData {
  // User Profile
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;

  // Store Information
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  businessType: string;
  description: string;

  // Location
  latitude: number;
  longitude: number;
  locationName: string;
}

interface DocumentFile {
  name: string;
  url: string;
  type: string;
}

export default function ProfilePage() {
  const params = useParams();
  const partnerId = params.id as string;
  const { user, getAuthHeaders } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'store' | 'documents'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ProfileFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    storeName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    businessType: '',
    description: '',
    latitude: 0,
    longitude: 0,
    locationName: '',
  });

  // Validation states
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [storeErrors, setStoreErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch store data
        const headers = await getAuthHeaders();
        const storeResponse = await fetch(`/api/stores/${partnerId}`, {
          headers,
        });
        if (storeResponse.ok) {
          const store = await storeResponse.json();
          setStoreData(store);

          // Populate form with store data
          setFormData(prev => ({
            ...prev,
            storeName: store.storeName || '',
            ownerName: store.ownerName || '',
            phone: store.phone || '',
            email: store.email || '',
            address: store.address || '',
            taxNumber: store.taxNumber || '',
            businessType: store.businessType || '',
            description: store.description || '',
            latitude: store.latitude || 0,
            longitude: store.longitude || 0,
            locationName: store.locationName || '',
          }));
        }

        // Fetch documents
        const docsResponse = await fetch(`/api/stores/${partnerId}/documents`, {
          headers,
        });
        if (docsResponse.ok) {
          const docs = await docsResponse.json();
          setDocuments(docs);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchProfileData();
    }
  }, [partnerId, getAuthHeaders]);

  const validatePasswordForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.currentPassword) {
      errors.push('Mevcut şifre gereklidir');
    }

    if (!formData.newPassword) {
      errors.push('Yeni şifre gereklidir');
    } else if (formData.newPassword.length < 6) {
      errors.push('Yeni şifre en az 6 karakter olmalıdır');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.push('Yeni şifreler eşleşmiyor');
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const validateStoreForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.storeName.trim()) {
      errors.push('Mağaza adı gereklidir');
    }

    if (!formData.ownerName.trim()) {
      errors.push('Sahip adı gereklidir');
    }

    if (!formData.phone.trim()) {
      errors.push('Telefon numarası gereklidir');
    }

    if (!formData.email.trim()) {
      errors.push('E-posta adresi gereklidir');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }

    if (!formData.address.trim()) {
      errors.push('Adres gereklidir');
    }

    setStoreErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Şifre başarıyla değiştirildi');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setPasswordErrors([]);
      } else {
        const error = await response.json();
        setPasswordErrors([error.message || 'Şifre değiştirilirken hata oluştu']);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors(['Şifre değiştirilirken hata oluştu']);
    } finally {
      setSaving(false);
    }
  };

  const handleStoreUpdate = async () => {
    if (!validateStoreForm()) return;

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/stores/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          storeName: formData.storeName,
          ownerName: formData.ownerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          taxNumber: formData.taxNumber,
          businessType: formData.businessType,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          locationName: formData.locationName,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Mağaza bilgileri başarıyla güncellendi');
        setStoreErrors([]);
      } else {
        const error = await response.json();
        setStoreErrors([error.message || 'Mağaza bilgileri güncellenirken hata oluştu']);
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setStoreErrors(['Mağaza bilgileri güncellenirken hata oluştu']);
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', docType);

      const response = await fetch(`/api/stores/${partnerId}/upload-document`, {
        method: 'POST',
        headers: {
          ...headers,
        },
        body: formDataUpload,
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage('Evrak başarıyla yüklendi');

        // Update documents list
        setDocuments(prev => prev.filter(doc => doc.type !== docType).concat(result.document));
      } else {
        const error = await response.json();
        alert(error.message || 'Evrak yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Evrak yüklenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const clearSuccessMessage = () => {
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="border-b border-gray-700 pb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Profil Yönetimi</h1>
          <p className="mt-2 text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Profil Yönetimi</h1>
        <p className="mt-2 text-gray-400">
          Profil bilgilerinizi, mağaza detaylarınızı ve evraklarınızı yönetin
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
          <span className="text-green-400">{successMessage}</span>
          <button
            onClick={clearSuccessMessage}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Kullanıcı Profili
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'store'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          Mağaza Bilgileri
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Evraklar
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Şifre Değiştirme
          </h2>

          {/* Password Errors */}
          {passwordErrors.length > 0 && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-400 font-medium">Hata</span>
              </div>
              <ul className="text-red-300 text-sm space-y-1">
                {passwordErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mevcut şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Yeni şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Yeni Şifre Tekrar
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handlePasswordChange}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Mağaza Bilgileri
          </h2>

          {/* Store Errors */}
          {storeErrors.length > 0 && (
            <div className="mb-6 bg-red-900/50 border border-red-500 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-400 font-medium">Hata</span>
              </div>
              <ul className="text-red-300 text-sm space-y-1">
                {storeErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mağaza Adı *
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sahip Adı *
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+90 555 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                E-posta *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Adres *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Vergi Numarası
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                İşletme Türü
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seçiniz</option>
                <option value="restaurant">Restoran</option>
                <option value="cafe">Kafe</option>
                <option value="fast-food">Fast Food</option>
                <option value="bakery">Fırın</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mağazanız hakkında kısa bir açıklama"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleStoreUpdate}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
            </button>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Evrak Yönetimi
          </h2>

          <div className="space-y-6">
            {/* Identity Document */}
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">Kimlik Belgesi</h3>
                  <p className="text-gray-400 text-sm">TC Kimlik veya Pasaport fotokopisi</p>
                </div>
                {documents.find(doc => doc.type === 'identity') && (
                  <a
                    href={documents.find(doc => doc.type === 'identity')?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Görüntüle
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'identity')}
                  className="hidden"
                  id="identity-upload"
                />
                <label
                  htmlFor="identity-upload"
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? 'Yükleniyor...' : 'Yeni Yükle'}
                </label>
              </div>
            </div>

            {/* Business License */}
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">İşletme Ruhsatı</h3>
                  <p className="text-gray-400 text-sm">İşletme açma ruhsatı</p>
                </div>
                {documents.find(doc => doc.type === 'business-license') && (
                  <a
                    href={documents.find(doc => doc.type === 'business-license')?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Görüntüle
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'business-license')}
                  className="hidden"
                  id="business-license-upload"
                />
                <label
                  htmlFor="business-license-upload"
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? 'Yükleniyor...' : 'Yeni Yükle'}
                </label>
              </div>
            </div>

            {/* Tax Certificate */}
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">Vergi Levhası</h3>
                  <p className="text-gray-400 text-sm">Vergi levhası fotokopisi</p>
                </div>
                {documents.find(doc => doc.type === 'tax-certificate') && (
                  <a
                    href={documents.find(doc => doc.type === 'tax-certificate')?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Görüntüle
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'tax-certificate')}
                  className="hidden"
                  id="tax-certificate-upload"
                />
                <label
                  htmlFor="tax-certificate-upload"
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? 'Yükleniyor...' : 'Yeni Yükle'}
                </label>
              </div>
            </div>

            {/* Food Safety Certificate */}
            <div className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">Gıda Güvenliği Sertifikası</h3>
                  <p className="text-gray-400 text-sm">Gıda güvenliği belgesi</p>
                </div>
                {documents.find(doc => doc.type === 'food-safety') && (
                  <a
                    href={documents.find(doc => doc.type === 'food-safety')?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Görüntüle
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocumentUpload(e, 'food-safety')}
                  className="hidden"
                  id="food-safety-upload"
                />
                <label
                  htmlFor="food-safety-upload"
                  className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? 'Yükleniyor...' : 'Yeni Yükle'}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}