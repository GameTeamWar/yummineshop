export default function RefundOrdersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">İade Siparişler</h1>
        <p className="text-gray-400">İade taleplerini yönetin ve iade işlemlerini takip edin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bekleyen İade</p>
              <p className="text-2xl font-bold text-yellow-400">7</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Onaylanan İade</p>
              <p className="text-2xl font-bold text-green-400">12</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Reddedilen İade</p>
              <p className="text-2xl font-bold text-red-400">3</p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-xl">✗</span>
            </div>
          </div>
        </div>
      </div>

      {/* İade Talepleri */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">İade Talepleri</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Bekleyen İade Talebi */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400">⏳</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12342</p>
                  <p className="text-sm text-gray-400">Deniz Arslan • 25 Ekim 2025</p>
                  <p className="text-sm text-gray-500">1x Margarita Pizza</p>
                  <p className="text-sm text-yellow-400 mt-1">İade Nedeni: Yemek soğuk geldi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-yellow-400">₺65</p>
                <p className="text-sm text-gray-400">Bekliyor</p>
                <div className="mt-2 space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors">
                    Onayla
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors">
                    Reddet
                  </button>
                </div>
              </div>
            </div>

            {/* Onaylanan İade */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12338</p>
                  <p className="text-sm text-gray-400">Selin Yıldırım • 24 Ekim 2025</p>
                  <p className="text-sm text-gray-500">2x Tavuk Şiş</p>
                  <p className="text-sm text-green-400 mt-1">İade Nedeni: Yanlış sipariş</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">₺95</p>
                <p className="text-sm text-gray-400">Onaylandı</p>
                <p className="text-xs text-gray-500 mt-1">İade tamamlandı</p>
              </div>
            </div>

            {/* Reddedilen İade */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400">✗</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12335</p>
                  <p className="text-sm text-gray-400">Emre Koç • 23 Ekim 2025</p>
                  <p className="text-sm text-gray-500">1x Hamburger Menü</p>
                  <p className="text-sm text-red-400 mt-1">İade Nedeni: Geç geldi</p>
                  <p className="text-xs text-gray-500 mt-1">Red Nedeni: Teslimat süresi uygundu</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-400">₺55</p>
                <p className="text-sm text-gray-400">Reddedildi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İade Politikası */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">İade Politikası</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Otomatik Onaylanan İadeler</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Yanlış sipariş</li>
                <li>• Eksik ürün</li>
                <li>• Ürün kalitesi sorunu</li>
                <li>• 30 dakikadan fazla gecikme</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">Manuel İnceleme Gereken</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Müşteri memnuniyetsizliği</li>
                <li>• Paketleme sorunu</li>
                <li>• Soğuk/sıcak gelme</li>
                <li>• Diğer özel durumlar</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              <strong>Bilgi:</strong> İade talepleri 24 saat içinde işlenir. Onaylanan iadeler 3-5 iş günü içinde hesaba yansır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}