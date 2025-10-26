'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Folder-level layout (`src/app/partner/[id]/layout.tsx`) already renders the partner sidebar.
// Avoid wrapping the page with the component `PartnerLayout` to prevent duplicate sidebars.

export default function PartnerPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cariId = params.id as string;
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Müşteri kullanıcıları ana sayfaya yönlendir
    if (user && role === 2) {
      router.push('/');
    }

    // Cari ID ile mağaza verilerini çek
    const fetchStoreData = async () => {
      if (cariId && role === 1) {
        try {
          const storeDoc = await getDoc(doc(db, 'branch_permissions', cariId));
          if (storeDoc.exists()) {
            setStoreData(storeDoc.data());
          }
        } catch (error) {
          console.error('Mağaza verisi çekme hatası:', error);
        }
      }
      setLoading(false);
    };

    fetchStoreData();
  }, [user, role, router, cariId]);

  // Giriş yapmış partner kullanıcıları için dashboard benzeri sayfa
  if (user && (role === 1 || role === 3)) {
    return (
      <div className="space-y-8">
          {/* Page Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white dark:text-gray-100">
              {role === 1 ? 'Mağaza Paneli' : 'Kurye Paneli'}
            </h1>
            <p className="mt-2 text-gray-300 dark:text-gray-400">
              {role === 1
                ? 'Mağaza işlemlerinizi yönetin ve takip edin'
                : 'Kurye işlemlerinizi yönetin ve teslimatları takip edin'
              }
            </p>
          </div>
          <div className="bg-gray-800 dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-700 dark:border-gray-600">
            <p className="text-gray-300 dark:text-gray-300 mb-4">
              {role === 1
                ? 'Mağaza panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.'
                : 'Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.'
              }
            </p>

            {role === 1 && storeData && (
              <div className="mb-6 p-4 bg-gray-700 dark:bg-gray-700 rounded-lg border border-gray-600 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-white dark:text-white mb-2">Mağaza Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">Mağaza Adı:</span>
                    <span className="ml-2 text-white dark:text-white">{storeData.storeName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">Şirket Türü:</span>
                    <span className="ml-2 text-white dark:text-white">{storeData.corporateType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">
                      {storeData.corporateType === "PRIVATE" ? "TC Kimlik Numarası:" : "VKN/TCKN:"}
                    </span>
                    <span className="ml-2 text-white dark:text-white">{storeData.taxId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">Toplam Şube:</span>
                    <span className="ml-2 text-white dark:text-white">{storeData.totalBranches}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">Onaylanan Şubeler:</span>
                    <span className="ml-2 text-white dark:text-white">{storeData.approvedBranches?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">Bekleyen İzin Talepleri:</span>
                    <span className="ml-2 text-white dark:text-white">{storeData.permissionRequests?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href={`/partner/${cariId}/dashboard`} className="block group">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📊 Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Genel istatistiklerinizi ve performans metriklerinizi görüntüleyin</p>
                </div>
              </Link>

              {role === 1 && (
                <Link href={`/partner/${cariId}/shop`} className="block group">
                  <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-sm hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🏪 Mağaza Yönetimi</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Ürünlerinizi, menünüzü ve mağaza ayarlarınızı yönetin</p>
                  </div>
                </Link>
              )}

              <Link href={`/partner/${cariId}/kuryemaaskısmı`} className="block group">
                <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-500 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🏍️ Kurye Yönetimi</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Kurye işlemlerinizi takip edin ve teslimatları yönetin</p>
                </div>
              </Link>
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