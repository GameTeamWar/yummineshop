'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Save, Store, Phone, Mail, MapPin } from 'lucide-react';
import { StoreSettings } from '@/types';

export default function SettingsPage() {
  const params = useParams();
  const partnerId = params.id as string;

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/store-settings?partnerId=${partnerId}`);
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchSettings();
    }
  }, [partnerId]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/store-settings/${settings.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Ayarlar kaydedildi!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const updateWorkingHours = (day: keyof StoreSettings['workingHours'], field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="border-b border-gray-700 pb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Ayarlar</h1>
          <p className="mt-2 text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-8">
        <div className="border-b border-gray-700 pb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Ayarlar</h1>
          <p className="mt-2 text-gray-400">Ayarlar yüklenemedi</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Mağaza Ayarları
            </h1>
            <p className="mt-2 text-gray-400">
              Mağaza bilgilerini ve çalışma saatlerini yönetin
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Store Status */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Store className="h-5 w-5 mr-2" />
          Mağaza Durumu
        </h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.isOpen}
              onChange={(e) => setSettings({ ...settings, isOpen: e.target.checked })}
              className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-300">Mağaza açık</span>
          </label>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            settings.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {settings.isOpen ? 'Açık' : 'Kapalı'}
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Çalışma Saatleri
        </h2>
        <div className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-4 p-3 bg-gray-750 rounded-lg">
              <div className="w-24 text-gray-300">{label}</div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.workingHours[key].isOpen}
                  onChange={(e) => updateWorkingHours(key, 'isOpen', e.target.checked)}
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-400">Açık</span>
              </label>
              <input
                type="time"
                value={settings.workingHours[key].open}
                onChange={(e) => updateWorkingHours(key, 'open', e.target.value)}
                disabled={!settings.workingHours[key].isOpen}
                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white disabled:opacity-50"
              />
              <span className="text-gray-400">-</span>
              <input
                type="time"
                value={settings.workingHours[key].close}
                onChange={(e) => updateWorkingHours(key, 'close', e.target.value)}
                disabled={!settings.workingHours[key].isOpen}
                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          İletişim Bilgileri
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mağaza Adı
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
              <Phone className="h-4 w-4 mr-1" />
              Telefon
            </label>
            <input
              type="tel"
              value={settings.contactInfo.phone || ''}
              onChange={(e) => updateContactInfo('phone', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+90 555 123 4567"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
              <Mail className="h-4 w-4 mr-1" />
              E-posta
            </label>
            <input
              type="email"
              value={settings.contactInfo.email || ''}
              onChange={(e) => updateContactInfo('email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="info@magaza.com"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              Adres
            </label>
            <textarea
              value={settings.contactInfo.address || ''}
              onChange={(e) => updateContactInfo('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mağaza adresi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}