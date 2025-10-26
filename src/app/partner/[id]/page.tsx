'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
// Folder-level layout (`src/app/partner/[id]/layout.tsx`) already renders the partner sidebar.
// Avoid wrapping the page with the component `PartnerLayout` to prevent duplicate sidebars.

export default function PartnerPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cariId = params.id as string;

  useEffect(() => {
    // Müşteri kullanıcıları ana sayfaya yönlendir
    if (user && role === 2) {
      router.push('/');
    }
  }, [user, role, router]);

  // Giriş yapmış partner kullanıcıları için aktif siparişler sayfası
  if (user && (role === 1 || role === 3)) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Aktif Siparişler</h1>
          <p className="text-gray-400">Şu anda hazırlanan ve teslim edilen siparişlerinizi takip edin</p>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Hazırlanıyor</p>
                <p className="text-2xl font-bold text-yellow-400">12</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Yolda</p>
                <p className="text-2xl font-bold text-blue-400">8</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🚚</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Teslim Edildi</p>
                <p className="text-2xl font-bold text-green-400">24</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Toplam Bugün</p>
                <p className="text-2xl font-bold text-purple-400">44</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sipariş Listesi */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Aktif Siparişler</h2>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {/* Örnek Sipariş 1 */}
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-400">⏳</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">#12345</p>
                    <p className="text-sm text-gray-400">Ahmet Yılmaz • 15 dk önce</p>
                    <p className="text-sm text-gray-500">2x Pizza, 1x Kola</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-400">₺85</p>
                  <p className="text-sm text-gray-400">Hazırlanıyor</p>
                  <button className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    Hazırlandı
                  </button>
                </div>
              </div>

              {/* Örnek Sipariş 2 */}
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400">🚚</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">#12346</p>
                    <p className="text-sm text-gray-400">Ayşe Demir • 8 dk önce</p>
                    <p className="text-sm text-gray-500">1x Burger Menü, 1x Patates</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-400">₺65</p>
                  <p className="text-sm text-gray-400">Yolda</p>
                  <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    Teslim Edildi
                  </button>
                </div>
              </div>

              {/* Örnek Sipariş 3 */}
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">#12347</p>
                    <p className="text-sm text-gray-400">Mehmet Kaya • 2 dk önce</p>
                    <p className="text-sm text-gray-500">3x Lahmacun, 2x Ayran</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">₺120</p>
                  <p className="text-sm text-gray-400">Teslim Edildi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar için giriş sayfasına yönlendirme
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white dark:text-white mb-4">Partner Girişi Gerekli</h1>
        <p className="text-gray-300 dark:text-gray-300 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekir.</p>
        <Link href="/auth/login?type=partner" className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white dark:text-white px-6 py-3 rounded-lg">
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}