export default function CancelledOrdersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">İptal Siparişler</h1>
        <p className="text-gray-400">İptal edilen siparişlerinizi inceleyin ve nedenlerini görün</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bu Ay İptal</p>
              <p className="text-2xl font-bold text-red-400">23</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-xl">✗</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">İptal Oranı</p>
              <p className="text-2xl font-bold text-orange-400">%4.2</p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <span className="text-orange-400 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">En Çok İptal Nedeni</p>
              <p className="text-2xl font-bold text-yellow-400">Geç Kalma</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-xl">⏰</span>
            </div>
          </div>
        </div>
      </div>

      {/* İptal Siparişleri */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">İptal Edilen Siparişler</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Örnek İptal Sipariş */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400">✗</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12335</p>
                  <p className="text-sm text-gray-400">Caner Yıldız • 24 Ekim 2025, 13:20</p>
                  <p className="text-sm text-gray-500">2x Et Döner, 1x Çorba</p>
                  <p className="text-sm text-red-400 mt-1">İptal Nedeni: Restoran çok meşgul</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-400">₺85</p>
                <p className="text-sm text-gray-400">İptal Edildi</p>
                <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Detaylar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400">✗</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12330</p>
                  <p className="text-sm text-gray-400">Elif Kara • 23 Ekim 2025, 18:45</p>
                  <p className="text-sm text-gray-500">1x Pizza, 1x Salata</p>
                  <p className="text-sm text-red-400 mt-1">İptal Nedeni: Müşteri vazgeçti</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-400">₺70</p>
                <p className="text-sm text-gray-400">İptal Edildi</p>
                <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Detaylar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400">✗</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12325</p>
                  <p className="text-sm text-gray-400">Burak Aydın • 22 Ekim 2025, 20:10</p>
                  <p className="text-sm text-gray-500">4x Köfte, 2x Pilav</p>
                  <p className="text-sm text-red-400 mt-1">İptal Nedeni: Teslimat adresi yanlış</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-400">₺140</p>
                <p className="text-sm text-gray-400">İptal Edildi</p>
                <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Detaylar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İptal Nedenleri Analizi */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">İptal Nedenleri Analizi</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Restoran çok meşgul</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
                <span className="text-sm text-gray-400 w-12">45%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Müşteri vazgeçti</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
                <span className="text-sm text-gray-400 w-12">30%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Teslimat adresi yanlış</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
                <span className="text-sm text-gray-400 w-12">15%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Diğer</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{width: '10%'}}></div>
                </div>
                <span className="text-sm text-gray-400 w-12">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}