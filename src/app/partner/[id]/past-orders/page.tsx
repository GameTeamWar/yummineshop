export default function PastOrdersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Geçmiş Siparişler</h1>
        <p className="text-gray-400">Tamamlanmış siparişlerinizin geçmişini görüntüleyin</p>
      </div>

      {/* Filtreler */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
          <option>Tüm Tarihler</option>
          <option>Bugün</option>
          <option>Dün</option>
          <option>Son 7 Gün</option>
          <option>Son 30 Gün</option>
        </select>
        <input
          type="text"
          placeholder="Sipariş No veya Müşteri Ara..."
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 flex-1 min-w-64"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Filtrele
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-green-400">1,247</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ortalama Tutar</p>
              <p className="text-2xl font-bold text-blue-400">₺78</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">En Çok Satan</p>
              <p className="text-2xl font-bold text-purple-400">Pizza</p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-xl">🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sipariş Geçmişi */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Sipariş Geçmişi</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Örnek Geçmiş Sipariş */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12340</p>
                  <p className="text-sm text-gray-400">Fatma Şahin • 25 Ekim 2025, 14:30</p>
                  <p className="text-sm text-gray-500">2x Tavuk Döner, 1x Pilav, 2x Ayran</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">₺95</p>
                <p className="text-sm text-gray-400">Teslim Edildi</p>
                <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Detaylar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12339</p>
                  <p className="text-sm text-gray-400">Ali Veli • 25 Ekim 2025, 12:15</p>
                  <p className="text-sm text-gray-500">1x Karışık Pizza, 1x Kola</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">₺75</p>
                <p className="text-sm text-gray-400">Teslim Edildi</p>
                <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Detaylar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">#12338</p>
                  <p className="text-sm text-gray-400">Zeynep Öztürk • 24 Ekim 2025, 19:45</p>
                  <p className="text-sm text-gray-500">3x Lahmacun, 1x Şalgam</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">₺110</p>
                <p className="text-sm text-gray-400">Teslim Edildi</p>
                <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Detaylar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}