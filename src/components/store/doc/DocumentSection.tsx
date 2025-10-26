'use client';

import React, { useState } from 'react';
import MapSection from './MapSection';
import DeliveryFormSection from './DeliveryFormSection';

// Document Delivery Page Component
const DocumentDeliveryPage = ({ darkMode, user }: { darkMode: boolean; user: any }) => {
  return (
    <div className="py-6 sm:py-8 pb-32">
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <DeliveryFormSection darkMode={darkMode} user={user} />
        </div>

        {/* Google Maps */}
        <div className="lg:col-span-4">
          <MapSection darkMode={darkMode} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Google Maps */}
        <div className="h-64 sm:h-80">
          <MapSection darkMode={darkMode} />
        </div>

        <div className="flex-1" />

        {/* Mobile Intro Card */}
        <div className={`fixed bottom-15 left-0 right-0  rounded-2xl p-4 sm:p-6 transition-colors duration-300 mb-4 ${darkMode ? 'bg-gray-800 border border-neutral-700' : 'bg-white border border-neutral-200'} shadow-lg`}>
          <div className="flex flex-col items-center text-center space-y-6">
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Aşağıdaki adımları takip ederek teslimatınızı oluşturun.
            </p>

            {/* Horizontal Steps */}
            <div className="flex flex-row justify-center items-center space-x-4 w-full overflow-x-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                  1
                </div>
                <div className="text-orange-500 text-3xl mb-2">📍</div>
                <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Alış Noktası'nı Belirleyin
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                  2
                </div>
                <div className="text-orange-500 text-3xl mb-2">🏠</div>
                <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Teslimat Noktası'nı Belirleyin
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                  3
                </div>
                <div className="text-orange-500 text-3xl mb-2">📦</div>
                <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paket Bilgilerini Giriniz
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                  4
                </div>
                <div className="text-orange-500 text-3xl mb-2">⏰</div>
                <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Teslimat Zamanını Seçin
                </p>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                  5
                </div>
                <div className="text-orange-500 text-3xl mb-2">🏍️</div>
                <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Kurye Çağır
                </p>
              </div>
            </div>
            <button
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Teslimat Oluştur
            </button>
          </div>
        </div>        {/* Delivery Form */}
        <DeliveryFormSection darkMode={darkMode} user={user} initialShowForm={true} />
      </div>
    </div>
  );
};

export default DocumentDeliveryPage;