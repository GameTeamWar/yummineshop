'use client';

import React, { useState } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut } from 'lucide-react';

export default function Yummine() {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [showDocumentDelivery, setShowDocumentDelivery] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: 0,
    deliveryTime: 60,
    distance: 5,
    priceRange: 'all'
  });
  const [documentForm, setDocumentForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    distance: 0,
    packageType: 'standart',
    quantity: 1
  });

  const categories = [
    { id: 'all', name: 'Tümü', icon: '🛍️' },
    { id: 'textile', name: 'Tekstil', icon: '👕' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '💄' },
    { id: 'accessories', name: 'Aksesuar', icon: '⌚' },
    { id: 'decor', name: 'Dekorasyon', icon: '🏠' }
  ];

  const stores = [
    { id: 1, name: 'Stil Fashion', category: 'textile', distance: 0.8, delivery: 30, rating: 4.8, items: 145, badge: 'Popüler', price: 'orta' },
    { id: 2, name: 'Beauty Haven', category: 'cosmetics', distance: 1.2, delivery: 35, rating: 4.6, items: 89, badge: 'Hızlı', price: 'yuksek' },
    { id: 3, name: 'Aksesuar Dünyası', category: 'accessories', distance: 0.5, delivery: 25, rating: 4.9, items: 234, badge: 'En yakın', price: 'dusuk' },
    { id: 4, name: 'Modern Ev', category: 'decor', distance: 1.5, delivery: 40, rating: 4.7, items: 167, badge: 'Yeni', price: 'orta' },
    { id: 5, name: 'Trend Moda', category: 'textile', distance: 2.1, delivery: 45, rating: 4.5, items: 198, badge: 'İndirim', price: 'dusuk' },
    { id: 6, name: 'Güzellik Plus', category: 'cosmetics', distance: 0.9, delivery: 28, rating: 4.9, items: 156, badge: 'Popüler', price: 'orta' },
  ];

  const packageTypes = [
    { id: 'standart', name: 'Standart Paket', baseFee: 25, description: 'A4 kağıda kadar evraklar' },
    { id: 'medium', name: 'Orta Paket', baseFee: 35, description: 'Dosya ve klasörler' },
    { id: 'large', name: 'Büyük Paket', baseFee: 50, description: 'Belgeler ve demiryolu' }
  ];

  const filteredStores = stores.filter(store => {
    let match = true;
    if (selectedCategory !== 'all' && store.category !== selectedCategory) match = false;
    if (store.rating < filters.rating) match = false;
    if (store.delivery > filters.deliveryTime) match = false;
    if (store.distance > filters.distance) match = false;
    if (filters.priceRange !== 'all' && store.price !== filters.priceRange) match = false;
    return match;
  });

  const getCurrentPackage = () => packageTypes.find(p => p.id === documentForm.packageType) || packageTypes[0];

  const calculateDeliveryFee = () => {
    const basePackage = getCurrentPackage();
    const kmFee = documentForm.distance * 2;
    const total = (basePackage.baseFee + kmFee) * documentForm.quantity;
    return { basePackage: basePackage.baseFee * documentForm.quantity, kmFee: kmFee * documentForm.quantity, total };
  };

  const fees = calculateDeliveryFee();
  const estimatedTime = Math.ceil(documentForm.distance * 2 + 15);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-neutral-950'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-b shadow-lg`}>
        <div className="w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-white' : 'bg-neutral-950'}`}>
                <Truck className={`w-6 h-6 ${darkMode ? 'text-gray-900' : 'text-white'}`} />
              </div>
              <div className="hidden sm:block">
                <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Yummine</span>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>Kurye hizmeti</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'}`}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-300 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Kozyatağı, İstanbul</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'} border-b`}>
          <div className="w-full mx-auto px-4 py-4 space-y-2">
            <button className={`w-full text-left px-4 py-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-neutral-100'}`}>
              Profil
            </button>
            <button className={`w-full text-left px-4 py-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-neutral-100'}`}>
              Siparişlerim
            </button>
            <button className={`w-full text-left px-4 py-2 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-neutral-100'}`}>
              Favoriler
            </button>
            <button className={`w-full text-left px-4 py-2 rounded flex items-center gap-2 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-neutral-100'}`}>
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`sticky top-16 z-40 transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-b overflow-x-auto`}>
        <div className="w-full mx-auto px-4">
          <div className="flex gap-2 sm:gap-4">
            <button onClick={() => { setActiveTab('home'); setShowDocumentDelivery(false); }} className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 font-semibold border-b-2 transition-colors duration-300 whitespace-nowrap text-sm sm:text-base ${!showDocumentDelivery && activeTab === 'home' ? (darkMode ? 'border-white text-white' : 'border-neutral-950 text-neutral-950') : `border-transparent ${darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950'}`}`}>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Alışveriş</span>
            </button>
            <button onClick={() => { setShowDocumentDelivery(true); setActiveTab('documents'); }} className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 font-semibold border-b-2 transition-colors duration-300 whitespace-nowrap text-sm sm:text-base ${showDocumentDelivery ? (darkMode ? 'border-white text-white' : 'border-neutral-950 text-neutral-950') : `border-transparent ${darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950'}`}`}>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Evrak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {showDocumentDelivery ? (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-32">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Delivery Form */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Evrak Taşıma</h2>
              <div className={`rounded-2xl p-4 sm:p-6 mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                <h3 className="text-lg font-semibold mb-4">Teslimat Bilgileri</h3>

                {/* Pickup Location */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Alış Noktası</label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-600' : 'bg-white border-neutral-300'}`}>
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                    <input type="text" placeholder="Adres yazın..." value={documentForm.pickupLocation} onChange={(e) => setDocumentForm({...documentForm, pickupLocation: e.target.value})} className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${darkMode ? 'text-white placeholder-neutral-600' : 'text-neutral-950 placeholder-neutral-500'}`} />
                  </div>
                </div>

                {/* Dropoff Location */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Teslim Noktası</label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-600' : 'bg-white border-neutral-300'}`}>
                    <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                    <input type="text" placeholder="Adres yazın..." value={documentForm.dropoffLocation} onChange={(e) => setDocumentForm({...documentForm, dropoffLocation: e.target.value})} className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${darkMode ? 'text-white placeholder-neutral-600' : 'text-neutral-950 placeholder-neutral-500'}`} />
                  </div>
                </div>

                {/* Distance */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Mesafe (KM)</label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-600' : 'bg-white border-neutral-300'}`}>
                    <input type="number" min="0" step="0.1" value={documentForm.distance} onChange={(e) => setDocumentForm({...documentForm, distance: parseFloat(e.target.value) || 0})} className={`flex-1 bg-transparent outline-none text-sm sm:text-base ${darkMode ? 'text-white' : 'text-neutral-950'}`} />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>km</span>
                  </div>
                </div>

                {/* Package Type */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Paket Türü</label>
                  <div className="grid grid-cols-1 gap-2">
                    {packageTypes.map(pkg => (
                      <button key={pkg.id} onClick={() => setDocumentForm({...documentForm, packageType: pkg.id})} className={`p-3 rounded-lg text-left transition-all duration-300 border-2 text-sm sm:text-base ${documentForm.packageType === pkg.id ? (darkMode ? 'border-blue-500 bg-blue-500/10' : 'border-blue-600 bg-blue-50') : (darkMode ? 'border-neutral-700 bg-gray-900 hover:border-neutral-600' : 'border-neutral-200 bg-white hover:border-neutral-300')}`}>
                        <div className="font-semibold">{pkg.name}</div>
                        <div className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{pkg.description}</div>
                        <div className={`text-sm font-semibold mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>₺{pkg.baseFee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Paket Adedi</label>
                  <div className={`flex items-center gap-4 p-3 rounded-lg border transition-colors duration-300 w-fit ${darkMode ? 'bg-gray-900 border-neutral-600' : 'bg-neutral-50 border-neutral-300'}`}>
                    <button onClick={() => setDocumentForm({...documentForm, quantity: Math.max(1, documentForm.quantity - 1)})} className={`p-1 rounded transition-colors duration-300 ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{documentForm.quantity}</span>
                    <button onClick={() => setDocumentForm({...documentForm, quantity: documentForm.quantity + 1})} className={`p-1 rounded transition-colors duration-300 ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'}`}>
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className={`rounded-2xl overflow-hidden mb-6 h-64 sm:h-80 border-2 transition-colors duration-300 ${darkMode ? 'border-neutral-700 bg-gray-800' : 'border-neutral-200 bg-neutral-100'}`}>
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Navigation className="w-12 h-12 mb-3 opacity-50" />
                  <p className={`text-center text-sm sm:text-base ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Harita integrasyonu</p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className={`rounded-2xl p-4 sm:p-6 h-fit sticky top-32 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
              <h3 className="text-lg font-bold mb-6">Ücret Özeti</h3>
              <div className={`space-y-3 pb-4 border-b transition-colors duration-300 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{documentForm.quantity}x {getCurrentPackage()?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{documentForm.distance} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500 shrink-0" />
                  <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>~{estimatedTime} dakika</span>
                </div>
              </div>

              <div className="space-y-3 py-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className={`${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Paket:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>₺{fees.basePackage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>KM Ücreti:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>₺{fees.kmFee.toFixed(2)}</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg mb-6 transition-colors duration-300 ${darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Toplam:</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-500">₺{fees.total.toFixed(2)}</span>
                </div>
              </div>

              <button className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${darkMode ? 'bg-white text-gray-900 hover:bg-neutral-100' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>
                <Truck className="w-5 h-5" />
                Teslimat Oluştur
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className={`transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-b sticky top-14 z-40`}>
            <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
              <div className="relative">
                <Search className={`absolute left-3 top-3 w-5 h-5 ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
                <input type="text" placeholder="Mağaza ara..." className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base ${darkMode ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:bg-neutral-800' : 'bg-neutral-100 border-neutral-300 text-neutral-950 placeholder-neutral-500 focus:bg-white'}`} />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className={`transition-colors duration-300 ${darkMode ? 'bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border-neutral-800' : 'bg-linear-to-r from-neutral-100 via-neutral-50 to-neutral-100 border-neutral-200'} border-b`}>
            <div className="w-full mx-auto px-4 py-8 sm:py-12">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <h1 className={`text-2xl sm:text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Şehrin Tüm Mağazaları Cebinde</h1>
                  <p className={`text-sm sm:text-lg mb-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Tüm ihtiyaçlarını aynı gün içinde kapında bulur.</p>
                  <div className={`flex gap-4 text-xs sm:text-base ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>25-45 dk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Güvenli</span>
                    </div>
                  </div>
                </div>
                <div className={`rounded-2xl p-4 sm:p-8 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                  <div className="space-y-3">
                    {['450+ Bağlı Mağaza', 'Aynı Gün Teslim', 'Sigortalı Kurye', '7/24 Desteği'].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 text-sm sm:text-base ${darkMode ? 'text-neutral-100' : 'text-neutral-900'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-300 flex-shrink-0 ${darkMode ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-950'}`}>✓</div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="w-full mx-auto px-4 py-6 sm:py-8">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`p-2 sm:p-4 rounded-xl transition transform hover:scale-105 ${selectedCategory === cat.id ? (darkMode ? 'bg-white text-neutral-950' : 'bg-neutral-950 text-white') : (darkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')}`}>
                  <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{cat.icon}</div>
                  <p className="text-xs font-semibold">{cat.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="w-full mx-auto px-4 mb-6">
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base ${darkMode ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200'}`}>
              <Filter className="w-4 h-4" />
              Filtreler
            </button>
          </div>

          {showFilters && (
            <div className={`w-full mx-auto px-4 mb-6 p-4 sm:p-6 rounded-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Rating */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Minimum Puan</label>
                  <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: parseFloat(e.target.value)})} className={`w-full p-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-900 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}>
                    <option value="0">Tümü (0+)</option>
                    <option value="3">3+ Yıldız</option>
                    <option value="4">4+ Yıldız</option>
                    <option value="4.5">4.5+ Yıldız</option>
                  </select>
                </div>

                {/* Delivery Time */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Teslimat Süresi (dakika)</label>
                  <input type="range" min="15" max="60" value={filters.deliveryTime} onChange={(e) => setFilters({...filters, deliveryTime: parseInt(e.target.value)})} className="w-full" />
                  <p className="text-xs mt-1">{filters.deliveryTime} dakika</p>
                </div>

                {/* Distance */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Maksimum Mesafe (km)</label>
                  <input type="range" min="0.5" max="5" value={filters.distance} onChange={(e) => setFilters({...filters, distance: parseFloat(e.target.value)})} className="w-full" />
                  <p className="text-xs mt-1">{filters.distance} km'ye kadar</p>
                </div>

                {/* Price Range */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-neutral-700'}`}>Fiyat Aralığı</label>
                  <select value={filters.priceRange} onChange={(e) => setFilters({...filters, priceRange: e.target.value})} className={`w-full p-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-900 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-950'}`}>
                    <option value="all">Tüm Fiyatlar</option>
                    <option value="dusuk">Düşük Fiyat</option>
                    <option value="orta">Orta Fiyat</option>
                    <option value="yuksek">Yüksek Fiyat</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4 sm:mt-6">
                <button onClick={() => setFilters({rating: 0, deliveryTime: 60, distance: 5, priceRange: 'all'})} className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-200 hover:bg-neutral-300'}`}>
                  Sıfırla
                </button>
                <button onClick={() => setShowFilters(false)} className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${darkMode ? 'bg-white text-gray-900 hover:bg-neutral-100' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>
                  Uygula
                </button>
              </div>
            </div>
          )}

          {/* Stores Grid */}
          <div className="w-full mx-auto px-4 pb-32">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                {selectedCategory === 'all' ? 'Önerilen Mağazalar' : `${categories.find(c => c.id === selectedCategory)?.name} Mağazaları`}
                <span className={`text-sm ml-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>({filteredStores.length})</span>
              </h2>
            </div>

            {filteredStores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredStores.map(store => (
                  <div key={store.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${darkMode ? 'bg-gray-800 border-neutral-700 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'}`}>
                    <div className={`h-40 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-linear-to-br from-neutral-800 to-neutral-700' : 'bg-linear-to-br from-neutral-200 to-neutral-300'}`}>
                      <div className={`absolute inset-0 ${darkMode ? 'bg-linear-to-br from-white/5 to-white/10' : 'bg-linear-to-br from-black/5 to-black/10'}`}></div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300 ${darkMode ? 'bg-white text-gray-900' : 'bg-neutral-950 text-white'}`}>
                          {store.badge}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 group-hover:opacity-70 line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.name}</h3>
                      <div className={`flex items-center gap-4 mb-3 pb-3 border-b transition-colors duration-300 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-950'}`}>{store.rating}</span>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>({store.items})</span>
                      </div>
                      <div className={`grid grid-cols-2 gap-2 mb-4 text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-700'}`}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>{store.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{store.delivery} dk</span>
                        </div>
                      </div>

                      <button className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base ${darkMode ? 'bg-white text-gray-900 hover:bg-neutral-100' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>
                        Mağazayı Gör
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-2xl p-8 sm:p-12 text-center ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'}`}>
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={`text-lg font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Aradığınız kriterlere uygun mağaza bulunamadı
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  Filtreleri değiştirerek deneyin
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-t`}>
        <div className="w-full mx-auto px-4">
          <div className="flex justify-around">
            {[
              { id: 'home', icon: ShoppingBag, label: 'Mağazalar' },
              { id: 'orders', icon: Package, label: 'Siparişler' },
              { id: 'favorites', icon: Heart, label: 'Favoriler' },
              { id: 'profile', icon: User, label: 'Profil' }
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 py-2 px-3 sm:py-3 sm:px-4 transition-colors duration-300 text-xs sm:text-sm ${activeTab === item.id ? (darkMode ? 'text-white' : 'text-neutral-950') : (darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-950')}`}>
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}