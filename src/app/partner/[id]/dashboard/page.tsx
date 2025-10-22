'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PartnerData {
  storeName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address: any;
  branchReferenceCode?: string;
  corporateType?: string;
  tcNo?: string;
  iban?: string;
  createdAt: Date;
}

export default function PartnerDashboard() {
  const { user, role } = useAuth();
  const router = useParams();
  const navigate = useRouter();
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const partnerId = router.id as string;

  useEffect(() => {
    if (!user) {
      navigate.push('/auth/login?type=partner');
      return;
    }

    // Partner verilerini Firestore'dan al
    const fetchPartnerData = async () => {
      try {
        // Şimdilik tüm kullanıcılar users koleksiyonunda, partnerId ile eşleştirme yapılacak
        // Partner ID sistemi henüz tam implemente edildiği için user.uid'yi kullanıyoruz
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPartnerData(data as PartnerData);
        } else {
          setError('Partner bilgileri bulunamadı.');
        }
      } catch (err) {
        console.error('Partner verisi alınırken hata:', err);
        setError('Veri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link href="/partner" className="text-blue-400 hover:text-blue-300">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  if (!partnerData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Partner bilgileri bulunamadı.</div>
          <Link href="/partner" className="text-blue-400 hover:text-blue-300">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const isStore = role === 1;

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
                href={`/partner/${partnerId}/shop`}
                className="text-green-400 hover:text-green-300"
              >
                Mağaza
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
            <h1 className="text-3xl font-bold text-white mb-2">
              {isStore ? partnerData.storeName : `${partnerData.firstName} ${partnerData.lastName}`}
            </h1>
            <p className="text-gray-400">
              {isStore ? 'Mağaza Dashboard' : 'Kurye Dashboard'} • ID: {partnerId}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">₺</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Toplam Kazanç
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        0 ₺
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        {isStore ? 'Sipariş Sayısı' : 'Teslimat Sayısı'}
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⭐</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Puan
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        0.0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">
                        Bu Ay
                      </dt>
                      <dd className="text-lg font-medium text-white">
                        0 ₺
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Information */}
          <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-white mb-4">
                {isStore ? 'Mağaza Bilgileri' : 'Kurye Bilgileri'}
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-400">Email</dt>
                  <dd className="mt-1 text-sm text-white">{partnerData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-400">Telefon</dt>
                  <dd className="mt-1 text-sm text-white">{partnerData.phone}</dd>
                </div>
                {isStore && partnerData.branchReferenceCode && (
                  <div>
                    <dt className="text-sm font-medium text-gray-400">Şube Referans Kodu</dt>
                    <dd className="mt-1 text-sm text-white font-mono">{partnerData.branchReferenceCode}</dd>
                  </div>
                )}
                {partnerData.iban && (
                  <div>
                    <dt className="text-sm font-medium text-gray-400">IBAN</dt>
                    <dd className="mt-1 text-sm text-white font-mono">{partnerData.iban}</dd>
                  </div>
                )}
                {!isStore && partnerData.tcNo && (
                  <div>
                    <dt className="text-sm font-medium text-gray-400">TC Kimlik No</dt>
                    <dd className="mt-1 text-sm text-white font-mono">{partnerData.tcNo}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-400">Kayıt Tarihi</dt>
                  <dd className="mt-1 text-sm text-white">
                    {partnerData.createdAt instanceof Date
                      ? partnerData.createdAt.toLocaleDateString('tr-TR')
                      : 'Bilinmiyor'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}