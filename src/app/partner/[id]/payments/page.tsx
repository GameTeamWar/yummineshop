export default function PaymentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Ödemeler</h1>
        <p className="text-gray-400">Ödeme geçmişi ve finansal işlemlerinizi yönetin</p>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bu Ay Toplam</p>
              <p className="text-2xl font-bold text-green-400">₺45,230</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">↑</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Bekleyen Ödeme</p>
              <p className="text-2xl font-bold text-yellow-400">₺12,450</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <span className="text-yellow-400 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Komisyon Oranı</p>
              <p className="text-2xl font-bold text-blue-400">%15.5</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ödeme Geçmişi */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Ödeme Geçmişi</h2>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Örnek Ödeme */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">Ekim 2025 Ödemesi</p>
                  <p className="text-sm text-gray-400">15 Ekim 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">₺32,780</p>
                <p className="text-sm text-gray-400">Tamamlandı</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400">⏳</span>
                </div>
                <div>
                  <p className="font-medium text-white">Kasım 2025 Ödemesi</p>
                  <p className="text-sm text-gray-400">15 Kasım 2025 (Bekleniyor)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-yellow-400">₺12,450</p>
                <p className="text-sm text-gray-400">İşleniyor</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-green-400">✓</span>
                </div>
                <div>
                  <p className="font-medium text-white">Eylül 2025 Ödemesi</p>
                  <p className="text-sm text-gray-400">15 Eylül 2025</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">₺28,950</p>
                <p className="text-sm text-gray-400">Tamamlandı</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banka Bilgileri */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Banka Hesap Bilgileri</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Banka Adı</label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">Garanti Bankası</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Hesap Sahibi</label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">Restoran Adı Ltd. Şti.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">IBAN</label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg font-mono">TR12 3456 7890 1234 5678 9012 34</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Şube Kodu</label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">1234</p>
            </div>
          </div>

          <div className="mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Bilgileri Güncelle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}