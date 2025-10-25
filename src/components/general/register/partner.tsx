'use client';

import { useState, useEffect } from 'react';
import { Store, Bike, ArrowRight, Sparkles, TrendingUp, Zap, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroLandingPage() {
  const router = useRouter();
  const [hoveredSide, setHoveredSide] = useState<'store' | 'courier' | null>(null);
  const [activeUsers, setActiveUsers] = useState(2847);
  useEffect(() => {
    // Aktif kullanıcı sayısını simüle et (gerçek sistemde Firebase'den çekilebilir)
    const updateActiveUsers = () => {
      // Rastgele sayı üret (gerçek uygulamada API'den gelecek)
      const baseUsers = 2800;
      const variation = Math.floor(Math.random() * 200) - 100; // -100 ile +100 arası
      setActiveUsers(baseUsers + variation);
    };

    updateActiveUsers();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(updateActiveUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 overflow-hidden">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Yummine</span>
            </div>
          </div>
        </header>

        {/* Hero Section - Split Screen */}
        <div className="relative min-h-screen flex">
          {/* Store Side - Left */}
          <div 
            className={`relative w-1/2 flex items-center justify-center transition-all duration-700 ${
              hoveredSide === 'store' ? 'w-[55%]' : hoveredSide === 'courier' ? 'w-[45%]' : 'w-1/2'
            }`}
            onMouseEnter={() => setHoveredSide('store')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-500 to-purple-600">
              {/* Animated Shapes */}
              <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-8 max-w-xl">
              <div className={`transform transition-all duration-700 ${
                hoveredSide === 'store' ? 'scale-110' : 'scale-100'
              }`}>
                <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl">
                  <Store className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Mağaza
                  <br />
                  <span className="text-blue-100">Girişi</span>
                </h1>

                <p className="text-xl text-blue-50 mb-4 leading-relaxed">
                  İşletmenizi dijital dünyaya taşıyın
                </p>

                <div className="flex flex-col space-y-3 mb-8">
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <TrendingUp className="w-5 h-5" />
                    <span>Satışlarınızı %300 artırın</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Sparkles className="w-5 h-5" />
                    <span>%0 Komisyon, Sabit Ücret Garantisi</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Zap className="w-5 h-5" />
                    <span>5 Dakikada Kurulum, Gelişmiş Panel Yönetimi</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => router.push('/auth/login?type=partner')}
                    className="group bg-white hover:bg-blue-50 text-blue-600 font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => router.push('/auth/register?type=partner')}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <span>Kayıt Ol</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center space-x-6 text-white/80 text-sm">
                  <div>
                    <div className="text-2xl font-bold">2,500+</div>
                    <div>Mağaza</div>
                  </div>
                  <div className="w-px h-12 bg-white/30"></div>
                  <div>
                    <div className="text-2xl font-bold">50K+</div>
                    <div>Sipariş</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 bg-linear-to-br from-white to-gray-100 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/50">
            <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              &
            </div>
          </div>

          {/* Courier Side - Right */}
          <div 
            className={`relative w-1/2 flex items-center justify-center transition-all duration-700 ${
              hoveredSide === 'courier' ? 'w-[55%]' : hoveredSide === 'store' ? 'w-[45%]' : 'w-1/2'
            }`}
            onMouseEnter={() => setHoveredSide('courier')}
            onMouseLeave={() => setHoveredSide(null)}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-purple-500 to-pink-600">
              {/* Animated Shapes */}
              <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-300/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-8 max-w-xl">
              <div className={`transform transition-all duration-700 ${
                hoveredSide === 'courier' ? 'scale-110' : 'scale-100'
              }`}>
                <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl">
                  <Bike className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Kurye
                  <br />
                  <span className="text-purple-100">Girişi</span>
                </h1>

                <p className="text-xl text-purple-50 mb-4 leading-relaxed">
                  Esnek çalışma ile özgürce kazan
                </p>

                <div className="flex flex-col space-y-3 mb-8">
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Shield className="w-5 h-5" />
                    <span>Esnaf Kurye Modeli</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Zap className="w-5 h-5" />
                    <span>Haftalık Ödeme Garantisi</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Sparkles className="w-5 h-5" />
                    <span>Sabit Ücret Sistemi</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => router.push('/auth/login?type=courier')}
                    className="group bg-white hover:bg-purple-50 text-purple-600 font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center"
                  >
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={() => router.push('/auth/register?type=courier')}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <span>Kayıt Ol</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center space-x-6 text-white/80 text-sm">
                  <div>
                    <div className="text-2xl font-bold">5,000+</div>
                    <div>Kurye</div>
                  </div>
                  <div className="w-px h-12 bg-white/30"></div>
                  <div>
                    <div className="text-2xl font-bold">₺15K</div>
                    <div>Ort. Gelir</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl border border-gray-200">
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-semibold">{activeUsers.toLocaleString('tr-TR')}</span>
              <span>aktif kullanıcı şu anda online</span>
            </p>
          </div>
        </div>
      </div>
  );
}