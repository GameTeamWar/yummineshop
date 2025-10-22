'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'customer' or 'partner'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement password reset logic with Firebase
      setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      setError('');
    } catch (err: any) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setMessage('');
    }
  };

  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Şifre Sıfırlama Türü Seçin
            </h2>
            <div className="mt-8 space-y-4">
              <a
                href="/auth/forgot-password?type=customer"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Müşteri Şifre Sıfırlama
              </a>
              <a
                href="/auth/forgot-password?type=partner"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Partner Şifre Sıfırlama
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCustomer = type === 'customer';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Şifre Sıfırlama
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {isCustomer ? 'Müşteri' : 'Partner'} hesabınızın şifresini sıfırlayın
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isCustomer
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              Şifre Sıfırlama Bağlantısı Gönder
            </button>
          </div>
          <div className="text-center">
            <a
              href={isCustomer ? "/auth/login?type=customer" : "/auth/login?type=partner"}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              Giriş sayfasına dön
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}