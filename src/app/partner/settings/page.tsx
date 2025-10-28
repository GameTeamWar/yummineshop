'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

interface StoreSettings {
  id: string;
  partnerId: string;
  storeName: string;
  isOpen: boolean;
  workingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function StoreSettingsPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    if (!user || role !== 1) {
      router.push('/');
      return;
    }

    loadStoreSettings();
  }, [user, role, router]);

  const loadStoreSettings = async () => {
    try {
      setLoading(true);

      // Kullanıcının mağaza ayarlarını al
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      const userData = userDoc.data();

      if (!userData?.storeId) {
        toast.error('Mağaza bulunamadı. Lütfen destek ile iletişime geçin.');
        router.push('/');
        return;
      }

      // Mağaza ayarlarını al
      const settingsDoc = await getDoc(doc(db, 'storeSettings', userData.storeId));

      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data();
        setSettings({
          id: settingsDoc.id,
          ...settingsData,
          createdAt: settingsData.createdAt?.toDate(),
          updatedAt: settingsData.updatedAt?.toDate(),
        } as StoreSettings);
      } else {
        // Varsayılan ayarlar oluştur
        const defaultSettings: Omit<StoreSettings, 'id' | 'createdAt' | 'updatedAt'> = {
          partnerId: user!.uid,
          storeName: userData.storeName || 'Mağaza Adı',
          isOpen: true,
          workingHours: {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '18:00', isOpen: true },
            sunday: { open: '09:00', close: '18:00', isOpen: false },
          },
          contactInfo: {
            phone: userData.phone || '',
            email: userData.email || '',
            address: userData.address || '',
          },
        };

        // API ile varsayılan ayarları kaydet
        const response = await fetch('/api/store-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultSettings)
        });

        if (response.ok) {
          const result = await response.json();
          setSettings({
            ...result,
            createdAt: new Date(result.createdAt),
            updatedAt: new Date(result.updatedAt),
          });
        }
      }
    } catch (error) {
      console.error('Mağaza ayarları yüklenirken hata:', error);
      toast.error('Mağaza ayarları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/store-settings/${settings.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: settings.storeName,
          isOpen: settings.isOpen,
          workingHours: settings.workingHours,
          contactInfo: settings.contactInfo,
        })
      });

      if (response.ok) {
        toast.success('Mağaza ayarları başarıyla kaydedildi');
        loadStoreSettings(); // Yeniden yükle
      } else {
        throw new Error('Ayarlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHour = (day: keyof StoreSettings['workingHours'], field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        [day]: {
          ...settings.workingHours[day],
          [field]: value,
        },
      },
    });
  };

  const updateContactInfo = (field: keyof StoreSettings['contactInfo'], value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      contactInfo: {
        ...settings.contactInfo,
        [field]: value,
      },
    });
  };

  if (!user || role !== 1) {
    return <div>Erişim reddedildi.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mağaza Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400">Mağaza ayarlarına erişmek için önce mağaza oluşturmanız gerekir.</p>
        </div>
      </div>
    );
  }

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mağaza Ayarları</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Mağazanızın çalışma saatleri ve iletişim bilgilerini yönetin</p>
        </div>

        {/* Genel Ayarlar */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Genel Ayarlar</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mağaza Adı
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOpen"
                checked={settings.isOpen}
                onChange={(e) => setSettings({ ...settings, isOpen: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Mağaza Açık
              </label>
            </div>
          </div>
        </div>

        {/* Çalışma Saatleri */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Çalışma Saatleri</h2>

          <div className="space-y-4">
            {days.map((day) => (
              <div key={day.key} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="w-32">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{day.label}</span>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.workingHours[day.key].isOpen}
                    onChange={(e) => updateWorkingHour(day.key, 'isOpen', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Açık</label>
                </div>

                {settings.workingHours[day.key].isOpen && (
                  <>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Açılış:</label>
                      <input
                        type="time"
                        value={settings.workingHours[day.key].open}
                        onChange={(e) => updateWorkingHour(day.key, 'open', e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Kapanış:</label>
                      <input
                        type="time"
                        value={settings.workingHours[day.key].close}
                        onChange={(e) => updateWorkingHour(day.key, 'close', e.target.value)}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">İletişim Bilgileri</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={settings.contactInfo.phone || ''}
                onChange={(e) => updateContactInfo('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+90 555 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={settings.contactInfo.email || ''}
                onChange={(e) => updateContactInfo('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="info@magaza.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adres
              </label>
              <textarea
                value={settings.contactInfo.address || ''}
                onChange={(e) => updateContactInfo('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mağaza adresi"
              />
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}