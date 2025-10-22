'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaMotorcycle } from 'react-icons/fa';
import { BsShop } from 'react-icons/bs';
import { Mail, Lock, X } from 'lucide-react';

export default function PartnerPage() {
  const { user, role, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCourier, setIsCourier] = useState<boolean | null>(null);

  useEffect(() => {
    if (user && role === 2) {
      router.push('/');
    }
  }, [user, role, router]);

  if (user && (role === 1 || role === 3)) {
    const partnerId = user.uid.slice(-6);

    if (role === 1) {
      router.push(`/partner/${partnerId}`);
      return null;
    }

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
                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="text-purple-400 hover:text-purple-300">Kurye</Link>
                <button onClick={() => window.location.href = '/auth/login'} className="text-gray-300 hover:text-white">Çıkış</button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-extrabold text-white mb-6">
              Kurye Paneli
            </h2>
            <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                Kurye panelinize hoş geldiniz. Aşağıdaki bağlantılardan işlemlerinizi yönetebilirsiniz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href={`/partner/${partnerId}/dashboard`} className="block">
                  <div className="bg-gray-700 hover:bg-gray-600 p-6 rounded-lg border border-gray-600 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-2">📊 Dashboard</h3>
                    <p className="text-gray-300 text-sm">Genel istatistiklerinizi görüntüleyin</p>
                  </div>
                </Link>
                <Link href={`/partner/${partnerId}/kuryemaaskısmı`} className="block">
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      // Login başarılı olursa useEffect yönlendirecek
    } catch (err: any) {
      setError('Giriş bilgileri hatalı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-gray-100 dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
      {/* Sol: SVG ve tanıtım */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-white" suppressHydrationWarning>
        <img src="/graphic2.svg" alt="Partner Giriş Görseli" className="w-3/4 max-w-lg mx-auto" />
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Yummine Partner Girişi</h2>
          <p className="text-gray-600 mb-6">Panelinize erişmek için giriş yapın</p>
          <div className="group relative">
            <button
              type="button"
              onClick={() => setIsCourier(!isCourier)}
              className="ml-8 cursor-pointer"
            >
              {isCourier ? (
                <FaMotorcycle className="mr-12 w-12 h-12 hover:scale-125 duration-200 hover:text-blue-500" />
              ) : (
                <BsShop className="mr-12 w-12 h-12 hover:scale-125 duration-200 hover:text-green-500" />
              )}
            </button>
            <span className={`absolute -top-6 left-1/2 -translate-y-1/2 z-20 origin-left scale-0 px-3 rounded-lg border py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 ${
              isCourier
                ? 'border-blue-400 bg-blue-500 text-white'
                : 'border-green-400 bg-green-500 text-white'
            }`}>
              {isCourier ? 'Kurye' : 'Mağaza'}
            </span>
          </div>
        </div>
      </div>

      {/* Sağ: Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 bg-gray-900 dark:bg-gray-900 text-white transition-colors duration-300">
        <div className="max-w-lg w-full mx-auto">
          {/* Mobil için sabit icon */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="group relative">
              <button
                type="button"
                onClick={() => setIsCourier(!isCourier)}
                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                {isCourier ? (
                  <FaMotorcycle className="w-8 h-8 text-blue-500" />
                ) : (
                  <BsShop className="w-8 h-8 text-green-500" />
                )}
              </button>
              <span className={`absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 px-3 rounded-lg border py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 ${
                isCourier
                  ? 'border-blue-400 bg-blue-500 text-white'
                  : 'border-green-400 bg-green-500 text-white'
              }`}>
                {isCourier ? 'KURYE' : 'MAĞAZA'}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Partner Girişi</h1>
            <p className="text-gray-300">Hesabınıza giriş yaparak panelinize erişin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E-posta adresinizi girin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şifrenizi girin"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 rounded-lg p-3 flex items-center">
                <X className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
                Şifremi unuttum
              </Link>
            </div>

            <div className="text-center">
              <span className="text-gray-400">Hesabınız yok mu? </span>
              <Link href="/auth/register?type=partner" className="text-blue-400 hover:text-blue-300">
                Kayıt olun
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        body {
          background: #f3f4f6;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background: #111827;
          }
        }
      `}</style>
    </div>
  );
}