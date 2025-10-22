'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaMotorcycle } from 'react-icons/fa';
import { BsShop } from 'react-icons/bs';
import { Mail, Lock, X, EyeClosed, Eye } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'customer', 'store', or 'courier'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      if (type === 'customer') {
        router.push('/');
      } else if (type === 'store') {
        router.push('/partner');
      } else if (type === 'courier') {
        router.push('/partner');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Giriş Türü Seçin
            </h2>
            <div className="mt-8 space-y-4">
              <a
                href="/auth/login?type=customer"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Müşteri Girişi
              </a>
              <a
                href="/auth/login?type=store"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Mağaza Girişi
              </a>
              <a
                href="/auth/login?type=courier"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                Kurye Girişi
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCustomer = type === 'customer';
  const isStore = type === 'store';
  const isCourier = type === 'courier';

  if (isCustomer) {
    // Müşteri girişi için eski basit tasarım
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Müşteri Girişi
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              Yummine hesabınıza giriş yapın
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">E-posta</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="E-posta adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Şifre</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeClosed className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
            <div className="text-center space-y-2">
              <a
                href="/auth/register?type=customer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 block"
              >
                Hesabınız yok mu? Kayıt olun
              </a>
              <a
                href="/auth/forgot-password?type=customer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 block"
              >
                Şifremi unuttum
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Store girişi için yeni tasarım
  if (isStore) {
    return (
      <div className="min-h-screen flex items-stretch bg-gray-100 dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
        {/* Sol: SVG ve tanıtım */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gray-900" suppressHydrationWarning>
          <img src="/graphic2.svg" alt="Mağaza Giriş Görseli" className="w-3/4 max-w-lg mx-auto" />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Yummine Mağaza Girişi</h2>
            <p className="text-gray-300 mb-6">Mağaza panelinize erişmek için giriş yapın</p>
            
            <nav className="relative mb-10 group w-full h-40 flex items-center justify-center">
              <a
                href="/auth/register?type=partner"
                className="relative w-16 h-16 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-110 z-50 hover:bg-[#2563eb]"
              >
                <svg
                  className="w-8 h-8 transition-transform duration-500 ease-in-out group-hover:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </a>

              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-40 transition-all duration-500"
              >
                <a
                  href="/auth/register?type=partner"
                  className="absolute transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-[75px] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] delay-50"
                >
                  <div
                    className="w-12 h-12 bg-green-500 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gray-100"
                  >
                    <BsShop className="w-5 h-5 text-gray-700 hover:text-[#3b82f6] transition-colors duration-300" />
                  </div>
                  <span
                    className="text-xs font-bold text-gray-400 text-center mt-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"
                    >Mağaza Kayıt</span
                  >
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 bg-white text-gray-900 transition-colors duration-300">
          <div className="max-w-lg w-full mx-auto">
            {/* Mobil için sabit icon */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="group relative">
                <BsShop className="w-12 h-12 text-green-500" />
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-100 px-3 rounded-lg border py-2 text-sm font-bold shadow-md border-green-400 bg-green-500 text-white">
                  MAĞAZA
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mağaza Girişi</h1>
              <p className="text-gray-600">Mağaza hesabınıza giriş yaparak panelinize erişin.</p>
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
                    className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Şifrenizi girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeClosed className="h-5 w-5" />
                    )}
                  </button>
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
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                  Şifremi unuttum
                </Link>
              </div>

              <div className="text-center">
                <span className="text-gray-500">Hesabınız yok mu? </span>
                <Link href="/auth/register?type=partner" className="text-blue-600 hover:text-blue-800">
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

  // Courier girişi için tasarım
  if (isCourier) {
    return (
      <div className="min-h-screen flex items-stretch bg-gray-100 dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
        {/* Sol: SVG ve tanıtım */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gray-900" suppressHydrationWarning>
          <img src="/graphic1.svg" alt="Kurye Giriş Görseli" className="w-3/4 max-w-lg mx-auto" />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Yummine Kurye Girişi</h2>
            <p className="text-gray-300 mb-6">Kurye panelinize erişmek için giriş yapın</p>
            
            <nav className="relative mb-10 group w-full h-40 flex items-center justify-center">
              <a
                href="/auth/register?type=partner"
                className="relative w-16 h-16 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-110 z-50 hover:bg-[#2563eb]"
              >
                <svg
                  className="w-8 h-8 transition-transform duration-500 ease-in-out group-hover:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </a>

              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-40 transition-all duration-500"
              >
                <a
                  href="/auth/register?type=partner"
                  className="absolute transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-[75px] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] delay-100"
                >
                  <div
                    className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:bg-gray-100"
                  >
                    <FaMotorcycle className="w-5 h-5 text-gray-400 hover:text-[#3b82f6] transition-colors duration-300" />
                  </div>
                  <span
                    className="text-xs font-bold text-gray-400 text-center mt-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300"
                    >Kurye Kayıt</span
                  >
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 bg-white text-gray-900 transition-colors duration-300">
          <div className="max-w-lg w-full mx-auto">
            {/* Mobil için sabit icon */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="group relative">
                <FaMotorcycle className="w-12 h-12 text-blue-500" />
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-100 px-3 rounded-lg border py-2 text-sm font-bold shadow-md border-blue-400 bg-blue-500 text-white">
                  KURYE
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kurye Girişi</h1>
              <p className="text-gray-600">Kurye hesabınıza giriş yaparak panelinize erişin.</p>
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
                    className="w-full pl-10 pr-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Şifrenizi girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeClosed className="h-5 w-5" />
                    )}
                  </button>
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
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                  Şifremi unuttum
                </Link>
              </div>

              <div className="text-center">
                <span className="text-gray-500">Hesabınız yok mu? </span>
                <Link href="/auth/register?type=partner" className="text-blue-600 hover:text-blue-800">
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
}