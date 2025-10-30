'use client';

import { useState } from 'react';

interface Store {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
    province?: string;
    district?: string;
    neighborhood?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  isActive: boolean;
  serviceArea?: {
    center: { lat: number; lng: number };
    radius: number;
    polygon?: { lat: number; lng: number }[];
  };
  logo?: string;
  storeType?: string;
}

interface Courier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'online' | 'offline' | 'busy';
  location?: { lat: number; lng: number };
  maxDeliveryKm: number;
  enableNotifications: boolean;
  fcmToken?: string;
  locationHistory?: { lat: number; lng: number; timestamp: number }[];
  waitingPoints?: { lat: number; lng: number; duration: number; startTime: number; endTime: number }[];
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location?: { lat: number; lng: number };
  address?: string;
  lastOrderDate?: string;
  totalOrders?: number;
  status: 'active' | 'inactive' | 'blocked';
}

interface StoreSidebarProps {
  activeTab: 'stores' | 'couriers' | 'customers' | 'zones';
  data: (Store | Courier | Customer)[];
  selectedStore: Store | null;
  selectedCourier: Courier | null;
  selectedCustomer: Customer | null;
  onStoreSelect: (store: Store) => void;
  onCourierSelect: (courier: Courier) => void;
  onCustomerSelect: (customer: Customer) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (filter: string) => void;
  activeMode: 'store-service' | 'map-center' | 'app-service' | 'courier-zones' | 'customer-block';
  onModeChange: (mode: 'store-service' | 'map-center' | 'app-service' | 'courier-zones' | 'customer-block') => void;
  onSaveMapCenter?: () => void;
  serviceAreas?: { id: string; name: string; color: string; polygon: { lat: number; lng: number }[]; editing?: boolean }[];
  onCreateServiceArea?: () => void;
  onEditServiceArea?: (id: string) => void;
  onSaveServiceArea?: (id: string) => void;
  onCancelServiceArea?: (id: string) => void;
  onDeleteServiceArea?: (id: string) => void;
  onUpdateServiceAreaName?: (id: string, name: string) => void;
  onUpdateServiceAreaColor?: (id: string, color: string) => void;
}

export default function StoreSidebar({
  activeTab,
  data,
  selectedStore,
  selectedCourier,
  selectedCustomer,
  onStoreSelect,
  onCourierSelect,
  onCustomerSelect,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeMode,
  onModeChange,
  onSaveMapCenter,
  serviceAreas = [],
  onCreateServiceArea,
  onEditServiceArea,
  onSaveServiceArea,
  onCancelServiceArea,
  onDeleteServiceArea,
  onUpdateServiceAreaName,
  onUpdateServiceAreaColor,
}: StoreSidebarProps) {
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  const getStatusColor = (status: string, isActive?: boolean) => {
    if (isActive === false) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    switch (status) {
      case 'approved':
      case 'active':
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'busy':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'inactive':
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'rejected':
      case 'banned':
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string, isActive?: boolean) => {
    if (isActive === false) return 'Pasif';
    switch (status) {
      case 'approved':
        return 'Aktif';
      case 'active':
        return 'Aktif';
      case 'online':
        return 'Çevrimiçi';
      case 'pending':
        return 'Onay Bekliyor';
      case 'busy':
        return 'Meşgul';
      case 'inactive':
        return 'Pasif';
      case 'offline':
        return 'Çevrimdışı';
      case 'rejected':
        return 'Reddedildi';
      case 'banned':
        return 'Yasaklı';
      case 'blocked':
        return 'Engellendi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStoreTypeIcon = (storeType?: string) => {
    switch (storeType) {
      case 'restaurant':
        return '🍽️';
      case 'cafe':
        return '☕';
      case 'market':
        return '🛒';
      case 'pharmacy':
        return '💊';
      case 'bakery':
        return '🥖';
      default:
        return '🏪';
    }
  };

  const renderDataList = () => {
    switch (activeTab) {
      case 'stores':
        return (
          <div className="p-4 space-y-3">
            {data.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">🏪</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Mağaza bulunmuyor'}
                </p>
              </div>
            ) : (
              data.map((item) => {
                const store = item as Store;
                const isSelected = selectedStore?.id === store.id;
                const hasServiceArea = !!store.serviceArea;

                return (
                  <div
                    key={store.id}
                    onClick={() => onStoreSelect(store)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }`}
                  >
                    {/* Store Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getStoreTypeIcon(store.storeType)}</div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {store.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {store.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(store.status, store.isActive)}`}>
                          {getStatusText(store.status, store.isActive)}
                        </span>
                        {hasServiceArea && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            Bölge ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="space-y-1">
                      {store.phone && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {store.phone}
                        </p>
                      )}
                      {store.address && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <svg className="w-3 h-3 mr-1 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-2">{store.address}</span>
                        </p>
                      )}
                      {store.location && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {store.location.province && store.location.district && (
                            <span>{store.location.province}, {store.location.district}</span>
                          )}
                          {store.location.neighborhood && (
                            <span> • {store.location.neighborhood}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Service Area Info */}
                    {hasServiceArea && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {store.serviceArea?.polygon ? (
                            <span>Çokgen bölge • {store.serviceArea.polygon.length} nokta</span>
                          ) : (
                            <span>Daire bölge • {Math.round((store.serviceArea?.radius || 0) / 1000)} km yarıçap</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">Seçili</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );

      case 'couriers':
        return (
          <div className="p-4 space-y-3">
            {data.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">🚚</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Kurye bulunmuyor'}
                </p>
              </div>
            ) : (
              data.map((item) => {
                const courier = item as Courier;
                const isSelected = selectedCourier?.id === courier.id;

                return (
                  <div
                    key={courier.id}
                    onClick={() => onCourierSelect(courier)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }`}
                  >
                    {/* Courier Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🚴</div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {courier.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {courier.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(courier.status)}`}>
                          {getStatusText(courier.status)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {courier.maxDeliveryKm}km
                        </span>
                      </div>
                    </div>

                    {/* Courier Details */}
                    <div className="space-y-1">
                      {courier.email && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {courier.email}
                        </p>
                      )}
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Bildirimler: {courier.enableNotifications ? '✅' : '❌'}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">Seçili</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );

      case 'customers':
        return (
          <div className="p-4 space-y-3">
            {data.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">👥</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Müşteri bulunmuyor'}
                </p>
              </div>
            ) : (
              data.map((item) => {
                const customer = item as Customer;
                const isSelected = selectedCustomer?.id === customer.id;

                return (
                  <div
                    key={customer.id}
                    onClick={() => onCustomerSelect(customer)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }`}
                  >
                    {/* Customer Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">👤</div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {customer.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                          {getStatusText(customer.status)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          {customer.totalOrders || 0} sipariş
                        </span>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-1">
                      {customer.address && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                          <svg className="w-3 h-3 mr-1 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-2">{customer.address}</span>
                        </p>
                      )}
                      {customer.lastOrderDate && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Son sipariş: {new Date(customer.lastOrderDate).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">Seçili</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );

      case 'zones':
        return (
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className="text-gray-400 dark:text-gray-500 text-3xl mb-2">🗺️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Bölge Yönetimi
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Hizmet bölgelerini oluşturun ve düzenleyin.
              </p>

              {/* Keyboard Shortcuts */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 border border-blue-200 dark:border-blue-800">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ⌨️ Çizim Kısayolları
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <div><kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Ctrl</kbd> + Tıkla: Nokta sil</div>
                  <div><kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Shift</kbd> + Sürükle: Nokta taşı</div>
                  <div><kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Alt</kbd> + Tıkla: Kenar ortasına nokta ekle</div>
                  <div><kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Ctrl+Z</kbd>: Son noktayı geri al</div>
                  <div><kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">ESC</kbd>: Çizimi iptal et</div>
                </div>
              </div>
            </div>

            {/* Bölge Oluştur Butonu */}
            <button
              onClick={onCreateServiceArea}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Yeni Bölge Oluştur</span>
            </button>

            {/* Bölge Kartları */}
            <div className="space-y-3">
              {serviceAreas.map((area) => (
                <div
                  key={area.id}
                  className={`p-4 rounded-lg border transition-all ${
                    area.editing
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Bölge Başlığı */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: area.color }}
                      ></div>
                      {area.editing ? (
                        <input
                          type="text"
                          value={area.name}
                          onChange={(e) => onUpdateServiceAreaName?.(area.id, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Bölge adı"
                        />
                      ) : (
                        <h4 className="font-medium text-gray-900 dark:text-white">{area.name}</h4>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {!area.editing ? (
                        <>
                          <button
                            onClick={() => onEditServiceArea?.(area.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Düzenle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDeleteServiceArea?.(area.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onSaveServiceArea?.(area.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Kaydet"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onCancelServiceArea?.(area.id)}
                            className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                            title="İptal"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Renk Seçimi */}
                  {area.editing && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Renk Seçimi
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '#10B981', // Yeşil
                          '#3B82F6', // Mavi
                          '#F59E0B', // Sarı
                          '#EF4444', // Kırmızı
                          '#8B5CF6', // Mor
                          '#F97316', // Turuncu
                          '#06B6D4', // Cyan
                          '#84CC16', // Lime
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() => onUpdateServiceAreaColor?.(area.id, color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              area.color === color
                                ? 'border-gray-900 dark:border-white scale-110'
                                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Renk: ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bölge Bilgileri */}
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {area.polygon.length > 0 ? (
                      <span>{area.polygon.length} nokta tanımlı</span>
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400">
                        {area.editing ? 'Haritada çokgen çizin' : 'Henüz tanımlanmamış'}
                      </span>
                    )}
                  </div>

                  {/* Düzenleme Durumu */}
                  {area.editing && (
                    <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-800 dark:text-blue-200">
                      Düzenleme modu aktif • Haritada çokgen çizin ve kaydedin
                    </div>
                  )}
                </div>
              ))}

              {serviceAreas.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">🗺️</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Henüz bölge oluşturulmamış
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    "Yeni Bölge Oluştur" butonuna tıklayarak başlayın
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'stores' ? 'Mağaza Yönetimi' :
             activeTab === 'couriers' ? 'Kurye Yönetimi' :
             activeTab === 'customers' ? 'Müşteri Yönetimi' :
             'Bölge Yönetimi'}
          </h2>
          <button
            onClick={() => setShowSystemInfo(!showSystemInfo)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Sistem Bilgisi"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* System Info */}
        {showSystemInfo && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Yummine Sistem Bilgisi
            </h3>
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <p>• Toplam {activeTab === 'stores' ? 'Mağaza' : activeTab === 'couriers' ? 'Kurye' : activeTab === 'customers' ? 'Müşteri' : 'Bölge'}: {data.length}</p>
              {activeTab === 'stores' && (
                <>
                  <p>• Aktif Mağaza: {data.filter((s: any) => s.status === 'approved' && s.isActive).length}</p>
                  <p>• Hizmet Bölgesi Tanımlı: {data.filter((s: any) => s.serviceArea).length}</p>
                </>
              )}
              {activeTab === 'couriers' && (
                <>
                  <p>• Çevrimiçi Kurye: {data.filter((c: any) => c.status === 'online').length}</p>
                  <p>• Bildirim Açık: {data.filter((c: any) => c.enableNotifications).length}</p>
                </>
              )}
              {activeTab === 'customers' && (
                <>
                  <p>• Aktif Müşteri: {data.filter((c: any) => c.status === 'active').length}</p>
                  <p>• Toplam Sipariş: {data.reduce((sum: number, c: any) => sum + (c.totalOrders || 0), 0)}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mode Buttons - Only show for zones tab */}
        {activeTab === 'zones' && (
          <div className="space-y-2 mb-4">
            <button
              onClick={() => onModeChange('app-service')}
              className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeMode === 'app-service'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🌐 Uygulama Hizmet Bölgeleri
            </button>
            <button
              onClick={() => onModeChange('courier-zones')}
              className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeMode === 'courier-zones'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🚚 Kurye Bölgeleri
            </button>
            <button
              onClick={() => onModeChange('customer-block')}
              className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeMode === 'customer-block'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🚫 Müşteri Blok Bölgeleri
            </button>
          </div>
        )}

        {/* Search - Show for stores, couriers, customers */}
        {(activeTab === 'stores' || activeTab === 'couriers' || activeTab === 'customers') && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder={`${activeTab === 'stores' ? 'Mağaza' : activeTab === 'couriers' ? 'Kurye' : 'Müşteri'} ara...`}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                {activeTab === 'stores' && (
                  <>
                    <option value="approved">Aktif</option>
                    <option value="pending">Onay Bekliyor</option>
                    <option value="rejected">Reddedildi</option>
                    <option value="banned">Yasaklı</option>
                  </>
                )}
                {activeTab === 'couriers' && (
                  <>
                    <option value="online">Çevrimiçi</option>
                    <option value="offline">Çevrimdışı</option>
                    <option value="busy">Meşgul</option>
                  </>
                )}
                {activeTab === 'customers' && (
                  <>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="blocked">Engellendi</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderDataList()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {activeTab === 'stores' && (
            selectedStore ? (
              <span>
                <strong>{selectedStore.name}</strong> seçili • Haritada konumlandırın
              </span>
            ) : (
              <span>Bir mağaza seçin ve hizmet bölgesini ayarlayın</span>
            )
          )}
          {activeTab === 'couriers' && (
            selectedCourier ? (
              <span>
                <strong>{selectedCourier.name}</strong> seçili • Bölge atayın
              </span>
            ) : (
              <span>Bir kurye seçin ve bölge atayın</span>
            )
          )}
          {activeTab === 'customers' && (
            selectedCustomer ? (
              <span>
                <strong>{selectedCustomer.name}</strong> seçili • Konum görüntüleniyor
              </span>
            ) : (
              <span>Bir müşteri seçin ve konumunu görüntüleyin</span>
            )
          )}
          {activeTab === 'zones' && (
            <span>Hizmet bölgelerini yönetin</span>
          )}
        </div>
      </div>
    </div>
  );
}