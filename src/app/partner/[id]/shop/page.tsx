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
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">Son Siparişler</h3>
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">Henüz sipariş bulunmuyor</div>
            <div className="mt-2 text-gray-500 text-xs">İlk siparişinizi bekliyoruz!</div>
          </div>
        </div>
      </div>
    </div>
  );
}