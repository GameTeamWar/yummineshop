'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Truck, MapPin, Clock, CheckCircle, Package, Phone, User } from 'lucide-react';

interface Delivery {
  id: string;
  orderId: string;
  userId: string;
  status: 'preparing' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  items: any[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

const DeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const { darkMode } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    if (!user) return;

    try {
      const deliveriesQuery = query(
        collection(db, 'deliveries'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const deliveriesSnapshot = await getDocs(deliveriesQuery);
      const deliveriesData = deliveriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        estimatedDelivery: doc.data().estimatedDelivery?.toDate() || new Date(),
        actualDelivery: doc.data().actualDelivery?.toDate(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Delivery[];

      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Teslimatlar alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Package className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />;
      case 'picked_up':
        return <Truck className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />;
      case 'in_transit':
        return <Truck className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />;
      case 'delivered':
        return <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />;
      case 'failed':
        return <Clock className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />;
      default:
        return <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Hazırlanıyor';
      case 'picked_up':
        return 'Kuryeye Teslim Edildi';
      case 'in_transit':
        return 'Yolda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'failed':
        return 'Teslimat Başarısız';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    const isDark = darkMode;
    switch (status) {
      case 'preparing':
        return isDark
          ? 'bg-orange-900/30 text-orange-300 border-orange-700/50'
          : 'bg-orange-100 text-orange-800 border-orange-200';
      case 'picked_up':
        return isDark
          ? 'bg-blue-900/30 text-blue-300 border-blue-700/50'
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit':
        return isDark
          ? 'bg-purple-900/30 text-purple-300 border-purple-700/50'
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return isDark
          ? 'bg-green-900/30 text-green-300 border-green-700/50'
          : 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return isDark
          ? 'bg-red-900/30 text-red-300 border-red-700/50'
          : 'bg-red-100 text-red-800 border-red-200';
      default:
        return isDark
          ? 'bg-gray-800/50 text-gray-300 border-gray-600/50'
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['preparing', 'picked_up', 'in_transit'].includes(delivery.status);
    if (filter === 'completed') return delivery.status === 'delivered';
    if (filter === 'failed') return delivery.status === 'failed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teslimatlarım</h1>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Siparişlerinizin teslimat durumunu takip edin
        </p>
      </div>

      {/* Stats */}
      {deliveries.length > 0 && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {deliveries.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Toplam Teslimat
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {deliveries.filter(d => ['preparing', 'picked_up', 'in_transit'].includes(d.status)).length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aktif Teslimat
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {deliveries.filter(d => d.status === 'delivered').length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tamamlanan
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {deliveries.filter(d => d.status === 'failed').length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Başarısız
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Tümü ({deliveries.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Aktif ({deliveries.filter(d => ['preparing', 'picked_up', 'in_transit'].includes(d.status)).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Tamamlanan ({deliveries.filter(d => d.status === 'delivered').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'failed'
                ? 'bg-blue-500 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border`
            }`}
          >
            Başarısız ({deliveries.filter(d => d.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="text-center py-16">
          <Truck className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {filter === 'all' ? 'Henüz teslimatınız yok' : 'Bu kategoride teslimat bulunmuyor'}
          </h3>
          <p className={`text-gray-600 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filter === 'all'
              ? 'İlk siparişinizi vererek teslimat sürecini başlatın!'
              : 'Başka bir kategori deneyebilirsiniz.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Delivery Header */}
              <div className={`p-6 border-b border-gray-100 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      {getStatusText(delivery.status)}
                    </div>
                    <span className={`text-gray-500 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      #{delivery.trackingNumber || delivery.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ₺{delivery.total.toLocaleString('tr-TR')}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {delivery.estimatedDelivery.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      {delivery.deliveryAddress.split(',')[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDelivery(selectedDelivery?.id === delivery.id ? null : delivery)}
                    className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {selectedDelivery?.id === delivery.id ? 'Detayları Gizle' : 'Detayları Göster'}
                  </button>
                </div>
              </div>

              {/* Delivery Details */}
              {selectedDelivery?.id === delivery.id && (
                <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  {/* Courier Info */}
                  {delivery.courierName && (
                    <div className="mb-6">
                      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kurye Bilgileri</h4>
                      <div className={`bg-white p-4 rounded-lg space-y-2 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {delivery.courierName}
                          </span>
                        </div>
                        {delivery.courierPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {delivery.courierPhone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  <div className="mb-6">
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teslimat Adresi</h4>
                    <div className={`bg-white p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <div className="flex items-start gap-2">
                        <MapPin className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p>{delivery.deliveryAddress}</p>
                          {delivery.deliveryNotes && (
                            <p className="mt-2 text-xs opacity-75">
                              Not: {delivery.deliveryNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sipariş İçeriği</h4>
                    <div className="space-y-3">
                      {delivery.items.map((item, index) => (
                        <div key={index} className={`flex items-center gap-4 bg-white p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <Package className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h5>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adet: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teslimat Geçmişi</h4>
                    <div className="space-y-3">
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sipariş Oluşturuldu</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {delivery.createdAt.toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {delivery.status !== 'preparing' && (
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kuryeye Teslim Edildi</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {delivery.updatedAt.toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      )}

                      {delivery.actualDelivery && (
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Teslim Edildi</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {delivery.actualDelivery.toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveriesPage;