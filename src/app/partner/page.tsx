'use client';'use client';'use client';'use client';



import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';import Link from 'next/link';

import { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

export default function PartnerPage() {

  const { user, role } = useAuth();import { useRouter } from 'next/navigation';import Link from 'next/link';import Link from 'next/link';

  const router = useRouter();

import { useEffect } from 'react';

  useEffect(() => {

    if (user && role === 2) {import { useAuth } from '@/context/AuthContext';import { useAuth } from '@/context/AuthContext';

      router.push('/');

    }export default function PartnerPage() {

  }, [user, role, router]);

  const { user, role } = useAuth();import { useRouter } from 'next/navigation';import { useRouter } from 'next/navigation';

  if (user && (role === 1 || role === 3)) {

    const partnerId = user.uid.slice(-6);  const router = useRouter();



    if (role === 1) {import { useEffect } from 'react';import { useEffect } from 'react';

      router.push(`/partner/${partnerId}`);

      return null;  useEffect(() => {

    }

    // Müşteri kullanıcıları ana sayfaya yönlendir

    return (

      <div className="min-h-screen bg-gray-900 text-white">    if (user && role === 2) {

        <header className="bg-gray-800 shadow">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">      router.push('/');export default function PartnerPage() {export default function PartnerPage() {

            <div className="flex justify-between items-center py-6">

              <div className="flex items-center">    }

                <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>

              </div>  }, [user, role, router]);  const { user, role } = useAuth();  const { user, role } = useAuth();

              <div className="flex items-center space-x-4">

                <span className="text-sm text-gray-300">Hoş geldiniz, {user.email}</span>

                <Link href={`/partner/${partnerId}/dashboard`} className="text-green-400 hover:text-green-300">Dashboard</Link>

                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>  // Giriş yapmış partner kullanıcıları için dashboard benzeri sayfa  const router = useRouter();  const router = useRouter();

                <button onClick={() => window.location.href = '/auth/login'} className="text-gray-300 hover:text-white">Çıkış</button>

              </div>  if (user && (role === 1 || role === 3)) {

            </div>

          </div>    // Partner ID'sini al (şimdilik user.uid'nin son 6 hanesi)

        </header>

    const partnerId = user.uid.slice(-6);

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

          <div className="px-4 py-6 sm:px-0">  useEffect(() => {  useEffect(() => {

            <h2 className="text-3xl font-extrabold text-white mb-6">

              Kurye Paneli    // Kuryeler için genel partner sayfası, mağazalar için cari ID ile yönlendirme

            </h2>

            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">    if (role === 1) {    // Müşteri kullanıcıları ana sayfaya yönlendir    // Müşteri kullanıcıları ana sayfaya yönlendir

              <p className="text-gray-300 mb-4">

                Kurye panelinize hoş geldiniz.      // Mağaza sahipleri için cari ID'yi bulup yönlendir

              </p>

            </div>      // Şimdilik user.uid'den türet, gerçek uygulamada veritabanından çekilmeli    if (user && role === 2) {    if (user && role === 2) {

          </div>

        </main>      router.push(`/partner/${partnerId}`);

      </div>

    );      return null;      router.push('/');      router.push('/');

  }

    }

  return (

    <div className="min-h-screen bg-gray-900 text-white">    }    }

      <header className="bg-gray-800 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">    return (

          <div className="flex justify-between items-center py-6">

            <div className="flex items-center">      <div className="min-h-screen bg-gray-900 text-white">  }, [user, role, router]);  }, [user, role, router]);

              <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>

            </div>        <header className="bg-gray-800 shadow">

            <div className="flex space-x-4">

              <Link          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                href="/auth/login?type=partner"

                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"            <div className="flex justify-between items-center py-6">

              >

                Giriş Yap              <div className="flex items-center">  // Giriş yapmış partner kullanıcıları için dashboard benzeri sayfa  // Giriş yapmış partner kullanıcıları için dashboard benzeri sayfa

              </Link>

              <Link                <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>

                href="/auth/register?type=partner"

                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"              </div>  if (user && (role === 1 || role === 3)) {  if (user && (role === 1 || role === 3)) {

              >

                Kayıt Ol              <div className="flex items-center space-x-4">

              </Link>

            </div>                <span className="text-sm text-gray-300">Hoş geldiniz, {user.email}</span>    // Partner ID'sini al (şimdilik user.uid'nin son 6 hanesi)    // Partner ID'sini al (şimdilik user.uid'nin son 6 hanesi)

          </div>

        </div>                <Link href={`/partner/${partnerId}/dashboard`} className="text-green-400 hover:text-green-300">Dashboard</Link>

      </header>

                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>    const partnerId = user.uid.slice(-6);    const partnerId = user.uid.slice(-6);

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center">                <button onClick={() => window.location.href = '/auth/login'} className="text-gray-300 hover:text-white">Çıkış</button>

          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">

            Yummine Partner Programı'na Katılın              </div>

          </h2>

          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">            </div>

            Mağaza sahibi veya kurye olarak Yummine ailesine katılın.

          </p>          </div>    // Kuryeler için genel partner sayfası, mağazalar için cari ID ile yönlendirme    // Kuryeler için genel partner sayfası, mağazalar için cari ID ile yönlendirme

        </div>

      </main>        </header>

    </div>

  );    if (role === 1) {    if (role === 1) {

}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

          <div className="px-4 py-6 sm:px-0">      // Mağaza sahipleri için cari ID'yi bulup yönlendir      // Mağaza sahipleri için cari ID'yi bulup yönlendir

            <h2 className="text-3xl font-extrabold text-white mb-6">

              Kurye Paneli      // Şimdilik user.uid'den türet, gerçek uygulamada veritabanından çekilmeli      // Şimdilik user.uid'den türet, gerçek uygulamada veritabanından çekilmeli

            </h2>

            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">      router.push(`/partner/${partnerId}`);      router.push(`/partner/${partnerId}`);

              <p className="text-gray-300 mb-4">

                Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.      return null;      return null;

              </p>

    }    }

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link href={`/partner/${partnerId}/dashboard`} className="block">

                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">

                    <h3 className="text-lg font-semibold text-white mb-2">📊 Dashboard</h3>    return (    return (

                    <p className="text-gray-300 text-sm">Genel istatistiklerinizi görüntüleyin</p>

                  </div>      <div className="min-h-screen bg-gray-900 text-white">      <div className="min-h-screen bg-gray-900 text-white">

                </Link>

        <header className="bg-gray-800 shadow">        <header className="bg-gray-800 shadow">

                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="block">

                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <h3 className="text-lg font-semibold text-white mb-2">🏍️ Kurye Yönetimi</h3>

                    <p className="text-gray-300 text-sm">Kurye işlemlerinizi takip edin</p>            <div className="flex justify-between items-center py-6">            <div className="flex justify-between items-center py-6">

                  </div>

                </Link>              <div className="flex items-center">              <div className="flex items-center">

              </div>

            </div>                <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>                <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>

          </div>

        </main>              </div>              </div>

      </div>

    );              <div className="flex items-center space-x-4">              <div className="flex items-center space-x-4">

  }

                <span className="text-sm text-gray-300">Hoş geldiniz, {user.email}</span>                <span className="text-sm text-gray-300">Hoş geldiniz, {user.email}</span>

  // Giriş yapmamış kullanıcılar için tanıtım sayfası

  return (                <Link href={`/partner/${partnerId}/dashboard`} className="text-green-400 hover:text-green-300">Dashboard</Link>                <Link href={`/partner/${partnerId}/dashboard`} className="text-green-400 hover:text-green-300">Dashboard</Link>

    <div className="min-h-screen bg-gray-900 text-white">

      <header className="bg-gray-800 shadow-sm">                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center py-6">                <button onClick={() => window.location.href = '/auth/login'} className="text-gray-300 hover:text-white">Çıkış</button>                <button onClick={() => window.location.href = '/auth/login'} className="text-gray-300 hover:text-white">Çıkış</button>

            <div className="flex items-center">

              <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>              </div>              </div>

            </div>

            <div className="flex space-x-4">            </div>            </div>

              <Link

                href="/auth/login?type=partner"          </div>          </div>

                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"

              >        </header>        </header>

                Giriş Yap

              </Link>

              <Link

                href="/auth/register?type=partner"        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"

              >          <div className="px-4 py-6 sm:px-0">          <div className="px-4 py-6 sm:px-0">

                Kayıt Ol

              </Link>            <h2 className="text-3xl font-extrabold text-white mb-6">            <h2 className="text-3xl font-extrabold text-white mb-6">

            </div>

          </div>              Kurye Paneli              Kurye Paneli

        </div>

      </header>            </h2>            </h2>



      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">

        <div className="text-center">

          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">              <p className="text-gray-300 mb-4">              <p className="text-gray-300 mb-4">

            Yummine Partner Programı'na Katılın

          </h2>                Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.                Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.

          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">

            Mağaza sahibi veya kurye olarak Yummine ailesine katılın.              </p>              </p>

            Binlerce müşteriyle buluşun ve gelirinizi artırın.

          </p>

          <div className="mt-8 flex justify-center space-x-4">

            <Link              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              href="/auth/register?type=partner"

              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"                <Link href={`/partner/${partnerId}/dashboard`} className="block">                <Link href={`/partner/${partnerId}/dashboard`} className="block">

            >

              Hemen Başla                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">

            </Link>

            <Link                    <h3 className="text-lg font-semibold text-white mb-2">📊 Dashboard</h3>                    <h3 className="text-lg font-semibold text-white mb-2">📊 Dashboard</h3>

              href="/auth/login?type=partner"

              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"                    <p className="text-gray-300 text-sm">Genel istatistiklerinizi görüntüleyin</p>                    <p className="text-gray-300 text-sm">Genel istatistiklerinizi görüntüleyin</p>

            >

              Giriş Yap                  </div>                  </div>

            </Link>

          </div>                </Link>                </Link>

        </div>



        <div className="mt-20">

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="block">                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="block">

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">

              <div className="text-3xl mb-4">🏪</div>                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">

              <h3 className="text-xl font-semibold text-white mb-2">Mağaza Sahibi</h3>

              <p className="text-gray-300">                    <h3 className="text-lg font-semibold text-white mb-2">🏍️ Kurye Yönetimi</h3>                    <h3 className="text-lg font-semibold text-white mb-2">🏍️ Kurye Yönetimi</h3>

                Ürünlerinizi binlerce müşteriye ulaştırın. Kolay yönetim paneli ile satışlarınızı takip edin.

              </p>                    <p className="text-gray-300 text-sm">Kurye işlemlerinizi takip edin</p>                    <p className="text-gray-300 text-sm">Kurye işlemlerinizi takip edin</p>

            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">                  </div>                  </div>

              <div className="text-3xl mb-4">🏍️</div>

              <h3 className="text-xl font-semibold text-white mb-2">Kurye</h3>                </Link>                </Link>

              <p className="text-gray-300">

                Esnek çalışma saatleri ile teslimat yaparak gelir elde edin. Kendi zamanınızı yönetin.              </div>              </div>

              </p>

            </div>            </div>            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">

              <div className="text-3xl mb-4">📈</div>          </div>          </div>

              <h3 className="text-xl font-semibold text-white mb-2">Büyüme</h3>

              <p className="text-gray-300">        </main>        </main>

                Sürekli büyüyen müşteri tabanımızla işinizi geliştirin ve gelirinizi artırın.

              </p>      </div>      </div>

            </div>

          </div>    );    );

        </div>

      </main>  }  }

    </div>

  );

}
  // Giriş yapmamış kullanıcılar için tanıtım sayfası  // Giriş yapmamış kullanıcılar için tanıtım sayfası

  return (  return (

    <div className="min-h-screen bg-gray-900 text-white">    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header */}      {/* Header */}

      <header className="bg-gray-800 shadow-sm">      <header className="bg-gray-800 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center py-6">          <div className="flex justify-between items-center py-6">

            <div className="flex items-center">            <div className="flex items-center">

              <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>              <h1 className="text-2xl font-bold text-white">Yummine Partner</h1>

            </div>            </div>

            <div className="flex space-x-4">            <div className="flex space-x-4">

              <Link              <Link

                href="/auth/login?type=partner"                href="/auth/login?type=partner"

                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"

              >              >

                Giriş Yap                Giriş Yap

              </Link>              </Link>

              <Link              <Link

                href="/auth/register?type=partner"                href="/auth/register?type=partner"

                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"

              >              >

                Kayıt Ol                Kayıt Ol

              </Link>              </Link>

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </header>      </header>



      {/* Hero Section */}      {/* Hero Section */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="text-center">        <div className="text-center">

          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">

            Yummine Partner Programı'na Katılın            Yummine Partner Programı'na Katılın

          </h2>          </h2>

          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">

            Mağaza sahibi veya kurye olarak Yummine ailesine katılın.            Mağaza sahibi veya kurye olarak Yummine ailesine katılın.

            Binlerce müşteriyle buluşun ve gelirinizi artırın.            Binlerce müşteriyle buluşun ve gelirinizi artırın.

          </p>          </p>

          <div className="mt-8 flex justify-center space-x-4">          <div className="mt-8 flex justify-center space-x-4">

            <Link            <Link

              href="/auth/register?type=partner"              href="/auth/register?type=partner"

              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"

            >            >

              Hemen Başla              Hemen Başla

            </Link>            </Link>

            <Link            <Link

              href="/auth/login?type=partner"              href="/auth/login?type=partner"

              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"

            >            >

              Giriş Yap              Giriş Yap

            </Link>            </Link>

          </div>          </div>

        </div>        </div>



        {/* Features */}        {/* Features */}

        <div className="mt-20">        <div className="mt-20">

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">

              <div className="text-3xl mb-4">🏪</div>              <div className="text-3xl mb-4">🏪</div>

              <h3 className="text-xl font-semibold text-white mb-2">Mağaza Sahibi</h3>              <h3 className="text-xl font-semibold text-white mb-2">Mağaza Sahibi</h3>

              <p className="text-gray-300">              <p className="text-gray-300">

                Ürünlerinizi binlerce müşteriye ulaştırın. Kolay yönetim paneli ile satışlarınızı takip edin.                Ürünlerinizi binlerce müşteriye ulaştırın. Kolay yönetim paneli ile satışlarınızı takip edin.

              </p>              </p>

            </div>            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">

              <div className="text-3xl mb-4">🏍️</div>              <div className="text-3xl mb-4">🏍️</div>

              <h3 className="text-xl font-semibold text-white mb-2">Kurye</h3>              <h3 className="text-xl font-semibold text-white mb-2">Kurye</h3>

              <p className="text-gray-300">              <p className="text-gray-300">

                Esnek çalışma saatleri ile teslimat yaparak gelir elde edin. Kendi zamanınızı yönetin.                Esnek çalışma saatleri ile teslimat yaparak gelir elde edin. Kendi zamanınızı yönetin.

              </p>              </p>

            </div>            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">

              <div className="text-3xl mb-4">📈</div>              <div className="text-3xl mb-4">📈</div>

              <h3 className="text-xl font-semibold text-white mb-2">Büyüme</h3>              <h3 className="text-xl font-semibold text-white mb-2">Büyüme</h3>

              <p className="text-gray-300">              <p className="text-gray-300">

                Sürekli büyüyen müşteri tabanımızla işinizi geliştirin ve gelirinizi artırın.                Sürekli büyüyen müşteri tabanımızla işinizi geliştirin ve gelirinizi artırın.

              </p>              </p>

            </div>            </div>

          </div>          </div>

        </div>        </div>

      </main>      </main>

    </div>    </div>

  );  );

}}
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