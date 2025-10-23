'use client';

import React, { useState } from 'react';

// Document Delivery Page Component
const DocumentDeliveryPage = ({ darkMode }: { darkMode: boolean }) => {
  const [showForm, setShowForm] = useState(false);
  const [regions, setRegions] = useState([{ id: 1, pickup: '', delivery: '', weight: '' }]);
  const [deliveryTime, setDeliveryTime] = useState('gun_icinde');
  const [deliveryUntil, setDeliveryUntil] = useState('18:00');
  const [timeRangeStart, setTimeRangeStart] = useState('09:00');
  const [timeRangeEnd, setTimeRangeEnd] = useState('17:00');

  const addRegion = () => {
    setRegions([...regions, { id: regions.length + 1, pickup: '', delivery: '', weight: '' }]);
  };

  const removeRegion = (id: number) => {
    if (regions.length > 1) {
      setRegions(regions.filter(r => r.id !== id));
    }
  };

  const calculateTotal = () => {
    return regions.reduce((sum, region) => {
      const weight = parseFloat(region.weight) || 0;
      return sum + (weight * 15); // 15 TL per kg
    }, 0);
  };

  return (
    <div className="py-6 sm:py-8 pb-32">
      <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
          <div className={`rounded-2xl p-4 sm:p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-white border border-neutral-200'} shadow-lg`}>
            {!showForm ? (
              <div className="flex flex-col items-center text-center space-y-6">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "Bölge Aç" butonuna tıklayın, ardından aşağıdaki adımları takip edin.
                </p>
                
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300"
                >
                  Bölge Aç
                </button>

                <div className="space-y-8 w-full mt-8">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                      1
                    </div>
                    <div className="text-orange-500 text-3xl mb-2">📍</div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Teslimat Bölgesini Belirleyin
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                      2
                    </div>
                    <div className="text-orange-500 text-3xl mb-2">�</div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Paket Bilgilerini Giriniz
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                      3
                    </div>
                    <div className="text-orange-500 text-3xl mb-2">⏰</div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Teslimat Zamanını Seçin
                    </p>
                  </div>
                </div>

                <button className={`text-purple-600 text-sm font-medium hover:underline mt-6 ${darkMode ? 'text-purple-400' : ''}`}>
                  📋 Teslimat nasıl yapılır?
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Teslimat Detayları
                  </h3>
                  <button 
                    onClick={() => setShowForm(false)}
                    className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
                  >
                    ✕
                  </button>
                </div>

                {regions.map((region, index) => (
                  <div key={region.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Bölge {index + 1}
                      </span>
                      {regions.length > 1 && (
                        <button 
                          onClick={() => removeRegion(region.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Alış Noktası
                        </label>
                        <input
                          type="text"
                          placeholder="Alış noktasını girin"
                          value={region.pickup}
                          onChange={(e) => {
                            const newRegions = [...regions];
                            newRegions[index].pickup = e.target.value;
                            setRegions(newRegions);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                      </div>

                      <div>
                        <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Teslimat Noktası
                        </label>
                        <input
                          type="text"
                          placeholder="Teslimat noktasını girin"
                          value={region.delivery}
                          onChange={(e) => {
                            const newRegions = [...regions];
                            newRegions[index].delivery = e.target.value;
                            setRegions(newRegions);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                      </div>

                      <div>
                        <label className={`text-xs mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Teslimat İçeriği Kilosu (kg)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={region.weight}
                          onChange={(e) => {
                            const newRegions = [...regions];
                            newRegions[index].weight = e.target.value;
                            setRegions(newRegions);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                          step="0.1"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Time Selection */}
                <div className="space-y-3">
                  <div>
                    <label className={`text-xs mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Teslimat Zamanı
                    </label>
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    >
                      <option value="gun_icinde">Gün İçinde</option>
                      <option value="belirtilen_sure">Belirtilen Süre İçinde</option>
                    </select>
                  </div>

                  {deliveryTime === 'gun_icinde' && (
                    <div>
                      <label className={`text-xs mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Saat Kaça Kadar
                      </label>
                      <input
                        type="time"
                        value={deliveryUntil}
                        onChange={(e) => setDeliveryUntil(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                    </div>
                  )}

                  {deliveryTime === 'belirtilen_sure' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-xs mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Başlangıç Saati
                        </label>
                        <input
                          type="time"
                          value={timeRangeStart}
                          onChange={(e) => setTimeRangeStart(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                      </div>
                      <div>
                        <label className={`text-xs mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Bitiş Saati
                        </label>
                        <input
                          type="time"
                          value={timeRangeEnd}
                          onChange={(e) => setTimeRangeEnd(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-700 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={addRegion}
                  className={`w-full py-2 rounded-lg border-2 border-dashed transition-all duration-300 ${
                    darkMode 
                      ? 'border-gray-600 hover:border-orange-500 text-gray-400 hover:text-orange-400' 
                      : 'border-gray-300 hover:border-orange-500 text-gray-600 hover:text-orange-500'
                  }`}
                >
                  + Bölge Ekle
                </button>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Toplam Tutar
                    </span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₺{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    (₺15/kg hesaplanmıştır)
                  </p>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                  Kurye Çağır
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Google Maps */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div className={`rounded-2xl overflow-hidden h-[400px] sm:h-[600px] border-2 transition-colors duration-300 ${darkMode ? 'border-neutral-700 bg-gray-800' : 'border-neutral-200 bg-neutral-100'}`}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=28.8,40.9,29.2,41.2&layer=mapnik&marker=41.0082,28.9784"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OpenStreetMap"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDeliveryPage;