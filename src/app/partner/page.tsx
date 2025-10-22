'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PartnerPage() {
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Müşteri kullanıcıları ana sayfaya yönlendir
    if (user && role === 2) {
      router.push('/');
    }
  }, [user, role, router]);

  // Giriş yapmış partner kullanıcıları için dashboard benzeri sayfa
  if (user && (role === 1 || role === 3)) {
    // Partner ID'sini al (şimdilik user.uid'nin son 6 hanesi)
    const partnerId = user.uid.slice(-6);

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Hoş geldiniz, {user.email}</span>
                <Link href={`/partner/${partnerId}/dashboard`} className="text-green-400 hover:text-green-300">Dashboard</Link>
                {role === 1 && <Link href={`/partner/${partnerId}/shop`} className="text-blue-400 hover:text-blue-300">Mağaza</Link>}
                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>
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
                  : 'Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan teslimatlarınızı yönetebilirsiniz.'
                }
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  href={`/partner/${partnerId}/dashboard`}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors duration-200"
                >
                  📊 Dashboard
                </Link>
                {role === 1 && (
                  <Link
                    href={`/partner/${partnerId}/shop`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors duration-200"
                  >
                    🏪 Mağaza Yönetimi
                  </Link>
                )}
                <Link
                  href={`/partner/${partnerId}/kuryemaaskısmı`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors duration-200"
                >
                  🏍️ Kurye Bölümü
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar için tanıtım sayfası
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth/login?type=partner"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register?type=partner"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Yummine Partner Programı'na Katılın
          </h2>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            Mağaza sahibi veya kurye olarak Yummine ailesine katılın.
            Binlerce müşteriyle buluşun ve gelirinizi artırın.
          </p>
        </div>

        {/* Hizmet Türü Seçimi */}
        <div className="mt-12 flex justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Hizmet Türü Seçin</h3>
            <div className="flex items-center justify-center space-x-6">
              <Link
                href="/auth/register?type=partner&service=store"
                className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border-2 border-transparent hover:border-green-500"
              >
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-white font-medium">🏪 Mağaza</span>
              </Link>
              <Link
                href="/auth/register?type=partner&service=courier"
                className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border-2 border-transparent hover:border-blue-500"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white font-medium">🏍️ Kurye</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Partner Types */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Store Partner */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Mağaza Ortağı</h3>
            <p className="text-gray-600 mb-6">
              Restoranınız, kafeniz veya marketiniz ile Yummine platformunda yer alın.
              Daha fazla müşteri edinin ve satışlarınızı artırın.
            </p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>✓ Geniş müşteri kitlesi</li>
              <li>✓ Kolay sipariş yönetimi</li>
              <li>✓ Gerçek zamanlı raporlar</li>
              <li>✓ 7/24 destek</li>
            </ul>
            <Link
              href="/auth/register?type=partner"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md text-center font-medium hover:bg-green-700 inline-block"
            >
              Mağaza Olarak Kayıt Ol
            </Link>
          </div>

          {/* Courier Partner */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Kurye Ortağı</h3>
            <p className="text-gray-600 mb-6">
              Kurye olarak çalışın, kendi zamanınızı belirleyin.
              Esnek çalışma saatleri ve rekabetçi kazanç fırsatları.
            </p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>✓ Esnek çalışma saatleri</li>
              <li>✓ Yüksek kazanç potansiyeli</li>
              <li>✓ Kendi bölgenizde çalışma</li>
              <li>✓ Kolay navigasyon uygulaması</li>
            </ul>
            <Link
              href="/auth/register?type=partner"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md text-center font-medium hover:bg-blue-700 inline-block"
            >
              Kurye Olarak Kayıt Ol
            </Link>
          </div>
        </div>

        {/* Why Choose Yummine */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Neden Yummine Partner'i Olmalısınız?
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Daha Fazla Kazanç</h4>
              <p className="text-gray-600">Mevcut müşterilerinizin ötesinde binlerce yeni müşteriyle tanışın.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Kolay Yönetim</h4>
              <p className="text-gray-600">Modern panelimizle siparişlerinizi kolayca yönetin.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">7/24 Destek</h4>
              <p className="text-gray-600">Her zaman yanınızdayız. Sorularınız için bize ulaşın.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Hazır mısınız? Hemen başlayın!
          </h3>
          <p className="text-gray-600 mb-8">
            Kayıt olmak sadece birkaç dakika sürer.
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/register?type=partner"
              className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-700 inline-block"
            >
              Ücretsiz Kayıt Ol
            </Link>
            <Link
              href="/auth/login?type=partner"
              className="bg-white text-green-600 px-8 py-3 rounded-md text-lg font-medium border border-green-600 hover:bg-green-50 inline-block"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Yummine. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}