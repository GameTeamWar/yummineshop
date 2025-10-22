'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PartnerCourier() {
  const { user, role } = useAuth();
  const router = useParams();
  const navigate = useRouter();
  const [loading, setLoading] = useState(true);

  const partnerId = router.id as string;

  useEffect(() => {
    if (!user) {
      navigate.push('/auth/login?type=partner');
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  const isStore = role === 1;
  const isCourier = role === 3;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/partner/${partnerId}`} className="text-2xl font-bold text-white hover:text-gray-300">
                Yummine Partner
              </Link>
              <span className="ml-4 text-sm text-gray-400">ID: {partnerId}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">{user?.email}</span>
              <Link
                href={`/partner/${partnerId}/dashboard`}
                className="text-green-400 hover:text-green-300"
              >
                Dashboard
              </Link>
              {isStore && (
                <Link
                  href={`/partner/${partnerId}/shop`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Mağaza
                </Link>
              )}
              <button
                onClick={() => navigate.push('/auth/login')}
                className="text-gray-300 hover:text-white"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isCourier ? 'Kurye Paneli' : 'Kurye Yönetimi'}
            </h1>
            <p className="text-gray-400">
              {isCourier
                ? 'Teslimatlarınızı ve kazançlarınızı yönetin'
                : 'Kuryelerinizi ve teslimatları takip edin'
              } • ID: {partnerId}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🏍️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">
                      {isCourier ? 'Aktif Teslimatlar' : 'Kurye Atama'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isCourier ? 'Mevcut teslimatlarınızı görün' : 'Siparişlere kurye atayın'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                    {isCourier ? 'Teslimatları Görüntüle' : 'Kurye Ata'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 hover:border-green-500 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📍</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Konum Takibi</h3>
                    <p className="text-sm text-gray-400">
                      {isCourier ? 'Konumunuzu paylaşın' : 'Kuryelerin konumunu takip edin'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                    Konum Takibi
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 hover:border-purple-500 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Kazanç Raporu</h3>
                    <p className="text-sm text-gray-400">
                      {isCourier ? 'Kazançlarınızı görün' : 'Kurye performansını inceleyin'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors duration-200">
                    Raporları Görüntüle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Courier Information */}
          <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-white mb-4">
                {isCourier ? 'Kurye Bilgileri' : 'Kurye Yönetimi'}
              </h3>

              {isCourier ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Ad Soyad</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                      Kurye Adı Soyadı
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Araç Tipi</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                      Motosiklet
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Çalışma Bölgesi</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                      İstanbul
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Durum</label>
                    <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-green-400">
                      Aktif
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm mb-4">Kurye yönetimi yakında aktif olacak</div>
                  <div className="text-gray-500 text-xs">Şu anda manuel kurye atama sistemi kullanılıyor</div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery History */}
          <div className="mt-8 bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-white mb-4">
                {isCourier ? 'Teslimat Geçmişi' : 'Kurye Performansı'}
              </h3>
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">
                  {isCourier ? 'Henüz teslimat bulunmuyor' : 'Kurye performansı yakında görüntülenecek'}
                </div>
                <div className="mt-2 text-gray-500 text-xs">
                  {isCourier ? 'İlk teslimatınızı bekliyoruz!' : 'Performans verileri yakında eklenecek'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}