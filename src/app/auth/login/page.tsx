'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaMotorcycle } from 'react-icons/fa';
import { BsShop } from 'react-icons/bs';
import { Mail, Lock, X, EyeClosed, Eye } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

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

  // Sadece type=customer ile erişime izin ver
  if (type !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <link rel="stylesheet" href="/403-error.css" />
        <div className="message">You are not authorized.</div>
        <div className="message2">You tried to access a page you did not have prior authorization for.</div>
        <div className="container">
          <div className="neon">403</div>
          <div className="door-frame">
            <div className="door">
              <div className="rectangle"></div>
              <div className="handle"></div>
              <div className="window">
                <div className="eye"></div>
                <div className="eye eye2"></div>
                <div className="leaf"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Müşteri girişi için yeni tasarım
  return (
    <div className="min-h-screen flex items-stretch bg-gray-100 dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
      {/* Sol: SVG ve tanıtım */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gray-900" suppressHydrationWarning>
        <img src="/graphic3.svg" alt="Müşteri Giriş Görseli" className="w-3/4 max-w-lg mx-auto" />
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Yummine Müşteri Girişi</h2>
          <p className="text-gray-300 mb-6">Hesabınıza giriş yaparak siparişlerinizi takip edin ve daha fazlasını keşfedin.</p>
        </div>
      </div>

      {/* Sağ: Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 bg-white text-gray-900 transition-colors duration-300">
        <div className="max-w-lg w-full mx-auto">
          {/* Mobil için logo */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="text-2xl font-bold text-blue-600">Yummine</div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hesabınıza Giriş Yapın</h1>
            <p className="text-gray-600">Tasarım ve web endüstrisinin en güçlü aracına erişin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E-posta Adresi"
                required
              />
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şifre"
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

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
              <Link href="/auth/forgot-password?type=customer" className="ml-4 text-blue-600 hover:text-blue-800 text-sm">
                Şifremi Unuttum?
              </Link>
            </div>

            <div className="other-links social-with-title">
              <div className="text-center mb-4">
                <span className="text-gray-500">Veya şununla giriş yapın</span>
              </div>
              <div className="flex justify-center">
                <a href="#" className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-sm">
                  <FcGoogle className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div className="text-center">
              <span className="text-gray-500">Yeni hesap mı? </span>
              <Link href="/auth/register?type=customer" className="text-blue-600 hover:text-blue-800">
                Yeni hesap oluşturun
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