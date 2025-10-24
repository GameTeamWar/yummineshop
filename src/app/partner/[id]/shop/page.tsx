'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PartnerShop() {
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

    // Sadece mağaza sahipleri erişebilir
    if (role !== 1) {
      navigate.push(`/partner/${partnerId}/dashboard`);
      return;
    }

    setLoading(false);
  }, [user, role, navigate, partnerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl"></div>
      </div>
    );
  }

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
              <Link
                href={`/partner/${partnerId}/kuryemaaskısmı`}
                className="text-blue-400 hover:text-blue-300"
              >
                Kurye
              </Link>
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
            <h1 className="text-3xl font-bold text-white mb-2">Mağaza Yönetimi</h1>
            <p className="text-gray-400">Ürünlerinizi, menünüzü ve siparişlerinizi yönetin • ID: {partnerId}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 hover:border-green-500 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🍽️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Menü Yönetimi</h3>
                    <p className="text-sm text-gray-400">Ürünlerinizi ekleyin ve düzenleyin</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                    Menüyü Yönet
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📦</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Siparişler</h3>
                    <p className="text-sm text-gray-400">Gelen siparişleri yönetin</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                    Siparişleri Görüntüle
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700 hover:border-purple-500 transition-colors duration-200">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">Raporlar</h3>
                    <p className="text-sm text-gray-400">Satış raporlarınızı inceleyin</p>
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

          {/* Store Information */}
          <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-white mb-4">Mağaza Bilgileri</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Mağaza Adı</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                    Mağaza Adı
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Kategori</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                    Restoran
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Adres</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                    İstanbul, Türkiye
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Telefon</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white">
                    +90 555 555 55 55
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200">
                  Bilgileri Düzenle
                </button>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8 bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-white mb-4">Son Siparişler</h3>
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm">Henüz sipariş bulunmuyor</div>
                <div className="mt-2 text-gray-500 text-xs">İlk siparişinizi bekliyoruz!</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}