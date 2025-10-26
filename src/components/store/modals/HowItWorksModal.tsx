import React from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield, ShoppingCart, Users } from 'lucide-react';

interface HowItWorksModalProps {
  darkMode: boolean;
  showHowItWorksModal: boolean;
  setShowHowItWorksModal: (show: boolean) => void;
  router: any;
}

export default function HowItWorksModal({ darkMode, showHowItWorksModal, setShowHowItWorksModal, router }: HowItWorksModalProps) {
  if (!showHowItWorksModal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowHowItWorksModal(false)}></div>
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Yummine Nasıl Çalışır?</h2>
          <button onClick={() => setShowHowItWorksModal(false)} className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Shopping Section */}
          <div>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <ShoppingBag className="w-6 h-6" />
              Alışveriş Nasıl Yapılır?
            </h3>
            <div className="space-y-4">
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-blue-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>1</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Kayıt Olun</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Ücretsiz hesap oluşturun ve platformumuza katılın.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-blue-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>2</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Adres Ekleyin</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Teslimat adresinizi belirleyin ve konumunuzu kaydedin.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-blue-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>3</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Ürün Seçin</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>450+ mağazadan istediğiniz ürünleri seçin ve sepete ekleyin.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-blue-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>4</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Sipariş Verin</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Ödeme yapın ve siparişinizi onaylayın.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-blue-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>5</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Teslim Alın</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>25-45 dakika içinde kapınızda! Güvenilir kuryelerimizle.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <h3 className={`text-xl font-semibold mb-4 flex items-center gap-3 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              <FileText className="w-6 h-6" />
              Evrak Taşıma Nasıl Yapılır?
            </h3>
            <div className="space-y-4">
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-green-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>1</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Kayıt Olun</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Ücretsiz hesap oluşturun ve evrak taşıma hizmetine erişin.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-green-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>2</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Evrak Bilgilerini Girin</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Taşınacak evrak türünü, miktarını ve önem derecesini belirtin.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-green-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>3</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Adresleri Belirleyin</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Alış ve teslimat adreslerini girin.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-green-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>4</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Kurye Atayın</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Uygun kuryeyi seçin ve ödemenizi tamamlayın.</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 p-4 rounded-lg ${darkMode ? 'bg-neutral-700/50' : 'bg-green-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>5</div>
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Güvenli Teslimat</h4>
                  <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Profesyonel kuryelerimiz evraklarınızı güvenli bir şekilde taşır.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Neden Yummine?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Truck, title: 'Hızlı Teslimat', desc: '25-45 dakika içinde kapınızda' },
                { icon: Shield, title: 'Güvenli Ödeme', desc: 'SSL korumalı güvenli alışveriş' },
                { icon: Star, title: 'Kaliteli Hizmet', desc: '4.8/5 ortalama müşteri puanı' },
                { icon: Clock, title: '7/24 Destek', desc: 'Her zaman yanınızdayız' },
                { icon: MapPin, title: 'Geniş Kapsama', desc: 'Şehrin her noktasına hizmet' },
                { icon: Users, title: 'Uzman Kuryeler', desc: 'Deneyimli ve güvenilir ekip' }
              ].map((feature, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
                  <feature.icon className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{feature.title}</h4>
                    <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`text-center pt-4 sm:pt-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
            <p className={`mb-4 text-sm sm:text-base ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Hazır mısınız? Hemen başlayın!</p>
            <button 
              onClick={() => { setShowHowItWorksModal(false); router.push('/auth/register?type=customer'); }}
              className="px-6 sm:px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              Ücretsiz Kayıt Ol
            </button>
          </div>
        </div>
      </div>
    </>
  );
}