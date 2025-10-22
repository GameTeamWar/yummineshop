'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>
                {storeData && <span className="ml-4 text-sm text-gray-300">Cari ID: {cariId}</span>}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Hoş geldiniz, {user.email}</span>
                <Link href={`/partner/${cariId}/dashboard`} className="text-green-400 hover:text-green-300">Dashboard</Link>
                {role === 1 && <Link href={`/partner/${cariId}/shop`} className="text-blue-400 hover:text-blue-300">Mağaza</Link>}
                <Link href={`/partner/${cariId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>
                <button onClick={() => window.location.href = '/auth/login'} className="text-gray-300 hover:text-white">Çıkış</button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-extrabold text-white mb-6">
              {role === 1 ? 'Mağaza Paneli' : 'Kurye Paneli'}
            </h2>
            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                {role === 1
                  ? 'Mağaza panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.'
                  : 'Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.'
                }
              </p>

              {role === 1 && storeData && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Mağaza Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Mağaza Adı:</span>
                      <span className="ml-2 text-white">{storeData.storeName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Şirket Türü:</span>
                      <span className="ml-2 text-white">{storeData.corporateType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        {storeData.corporateType === "PRIVATE" ? "TC Kimlik Numarası:" : "VKN/TCKN:"}
                      </span>
                      <span className="ml-2 text-white">{storeData.taxId}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Toplam Şube:</span>
                      <span className="ml-2 text-white">{storeData.totalBranches}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Onaylanan Şubeler:</span>
                      <span className="ml-2 text-white">{storeData.approvedBranches?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bekleyen İzin Talepleri:</span>
                      <span className="ml-2 text-white">{storeData.permissionRequests?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href={`/partner/${cariId}/dashboard`} className="block">
                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">📊 Dashboard</h3>
                    <p className="text-gray-300 text-sm">Genel istatistiklerinizi görüntüleyin</p>
                  </div>
                </Link>

                {role === 1 && (
                  <Link href={`/partner/${cariId}/shop`} className="block">
                    <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">
                      <h3 className="text-lg font-semibold text-white mb-2">🏪 Mağaza Yönetimi</h3>
                      <p className="text-gray-300 text-sm">Ürünlerinizi ve mağaza ayarlarınızı yönetin</p>
                    </div>
                  </Link>
                )}

                <Link href={`/partner/${cariId}/kuryemaaskısmı`} className="block">
                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">🏍️ Kurye Yönetimi</h3>
                    <p className="text-gray-300 text-sm">Kurye işlemlerinizi takip edin</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar için giriş sayfasına yönlendirme
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Partner Girişi Gerekli</h1>
        <p className="text-gray-300 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekir.</p>
        <Link href="/auth/login?type=partner" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}