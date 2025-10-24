import React from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield, ShoppingCart, Users } from 'lucide-react';

// Extend window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

type HeroSectionProps = {
  darkMode: boolean;
  heroMode: string;
  setHeroMode: (mode: string) => void;
  onHowItWorksClick: () => void;
  router: any;
};

const HeroSection = ({ darkMode, heroMode, setHeroMode, onHowItWorksClick, router }: HeroSectionProps) => {
  return (
    <div className={`relative overflow-hidden transition-all duration-500 ${heroMode === 'shopping' ? (darkMode ? 'bg-linear-to-br from-blue-900 via-purple-900 to-indigo-900' : 'bg-linear-to-br from-blue-50 via-purple-50 to-indigo-50') : (darkMode ? 'bg-linear-to-br from-green-900 via-teal-900 to-cyan-900' : 'bg-linear-to-br from-green-50 via-teal-50 to-cyan-50')} border-b ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-blue-500"></div>
        <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-purple-500"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full bg-green-500"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 rounded-full bg-orange-500"></div>
      </div>

      <div className="relative w-full mx-auto px-4 py-12 sm:py-16 lg:py-20">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className={`relative p-1 rounded-2xl transition-all duration-300 ${darkMode ? 'bg-neutral-800/50 backdrop-blur-sm border border-neutral-700' : 'bg-white/50 backdrop-blur-sm border border-neutral-200 shadow-lg'}`}>
            <div className="flex relative">
              <button
                onClick={() => setHeroMode('shopping')}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${heroMode === 'shopping' ? (darkMode ? 'text-white' : 'text-neutral-950') : (darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950')}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline">Alışveriş</span>
                {heroMode === 'shopping' && (
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-neutral-950/10 border border-neutral-950/20'}`}></div>
                )}
              </button>
              <button
                onClick={() => setHeroMode('documents')}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${heroMode === 'documents' ? (darkMode ? 'text-white' : 'text-neutral-950') : (darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950')}`}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Belge ve Evrak</span>
                {heroMode === 'documents' && (
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${darkMode ? 'bg-white/10 border border-white/20' : 'bg-neutral-950/10 border border-neutral-950/20'}`}></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Shopping Mode Content */}
        <div className={`transition-all duration-500 ${heroMode === 'shopping' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'}`}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 transition-colors duration-300 ${darkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                Yummine ile Tanışın
              </div>

              <h1 className={`text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                Şehrin Tüm
                <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  İhtiyaçları
                </span>
                Kapınızda
              </h1>

              <p className={`text-lg sm:text-xl mb-8 leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Binlerce mağaza, aynı gün teslimat, güvenilir kuryeler.
                Yummine ile ihtiyaçlarınızı dakikalar içinde kapınızda bulun.
              </p>

              <div className={`flex flex-col sm:flex-row gap-4 mb-8`}>
                <button onClick={() => router.push('/auth/register?type=customer')} className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  Hemen Başla
                </button>
                <button onClick={onHowItWorksClick} className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700' : 'bg-white text-neutral-950 hover:bg-neutral-50 border border-neutral-200 shadow-lg'}`}>
                  <Play className="w-5 h-5" />
                  Nasıl Çalışır?
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>450+</div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Bağlı Mağaza</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>25-45</div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Dakika Teslimat</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>4.8</div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Müşteri Puanı</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm border border-neutral-700' : 'bg-white/90 backdrop-blur-sm border border-neutral-200'}`}>
                <h3 className={`text-xl sm:text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  Neden Yummine?
                </h3>

                <div className="space-y-4">
                  {[
                    { icon: Truck, title: 'Hızlı Teslimat', desc: '25-45 dakika içinde kapınızda' },
                    { icon: Shield, title: 'Güvenli Ödeme', desc: 'SSL korumalı güvenli alışveriş' },
                    { icon: Star, title: 'Kaliteli Hizmet', desc: '4.8/5 ortalama müşteri puanı' },
                    { icon: Clock, title: '7/24 Destek', desc: 'Her zaman yanınızdayız' }
                  ].map((feature, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-neutral-700/50 hover:bg-neutral-700' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <feature.icon className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{feature.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <button onClick={() => router.push('/auth/register?type=customer')} className="w-full py-3 bg-linear-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                    Ücretsiz Kaydol
                  </button>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Documents Mode Content */}
        <div className={`transition-all duration-500 ${heroMode === 'documents' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'}`}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 transition-colors duration-300 ${darkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Evrak Taşıma Hizmeti
              </div>

              <h1 className={`text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                Evraklarınız
                <span className="block bg-linear-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Güvenli Ellerde
                </span>
              </h1>

              <p className={`text-lg sm:text-xl mb-8 leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                Önemli belgeleriniz, sözleşmeleriniz, resmi evraklarınız için profesyonel taşıma hizmeti.
                Güvenli ve profesyonel kuryelerimizle evraklarınız güvende.
              </p>

              <div className={`flex flex-col sm:flex-row gap-4 mb-8`}>
                <button onClick={() => router.push('/auth/register?type=customer')} className="px-8 py-4 bg-linear-to-r from-green-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                  <FileText className="w-5 h-5" />
                  Evrak Taşı
                </button>
                <button onClick={onHowItWorksClick} className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700' : 'bg-white text-neutral-950 hover:bg-neutral-50 border border-neutral-200 shadow-lg'}`}>
                  <Play className="w-5 h-5" />
                  Nasıl Çalışır?
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>24/7</div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Hizmet</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Güvenli</div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Taşıma</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>4.9</div>
                  <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Güvenilirlik</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm border border-neutral-700' : 'bg-white/90 backdrop-blur-sm border border-neutral-200'}`}>
                <h3 className={`text-xl sm:text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
                  Evrak Taşıma Avantajları
                </h3>

                <div className="space-y-4">
                  {[
                    { icon: Shield, title: 'Güvenli Taşıma', desc: 'Evraklarınız güvenli ellerde' },
                    { icon: Truck, title: 'Hızlı Teslimat', desc: 'Aynı gün teslimat garantisi' },
                    { icon: Clock, title: '7/24 Hizmet', desc: 'Her zaman hizmetinizde' },
                    { icon: Star, title: 'Profesyonel', desc: 'Uzman kuryelerimizle' }
                  ].map((feature, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-neutral-700/50 hover:bg-neutral-700' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                        <feature.icon className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{feature.title}</h4>
                        <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <button onClick={() => router.push('/auth/register?type=customer')} className="w-full py-3 bg-linear-to-r from-teal-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                    Evrak Taşıma Başlat
                  </button>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;