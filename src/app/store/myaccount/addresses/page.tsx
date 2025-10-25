'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapPin, Plus, Edit, Trash2, Home, Building, Phone, Navigation } from 'lucide-react';

interface Address {
  id: string;
  userId: string;
  title: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: Date;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const AddressesPage: React.FC = () => {
  const { user, darkMode } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const addressesQuery = query(
        collection(db, 'addresses'),
        where('userId', '==', user.uid)
      );

      const addressesSnapshot = await getDocs(addressesQuery);
      const addressesData = addressesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Address[];

      // Sort by default first, then by creation date
      addressesData.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setAddresses(addressesData);
    } catch (error) {
      console.error('Adresler alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteDoc(doc(db, 'addresses', addressId));
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (error) {
      console.error('Adres silinirken hata:', error);
    }
  };

  const setAsDefault = async (addressId: string) => {
    try {
      // Remove default from all addresses
      const updatePromises = addresses.map(addr =>
        updateDoc(doc(db, 'addresses', addr.id), { isDefault: false })
      );
      await Promise.all(updatePromises);

      // Set new default
      await updateDoc(doc(db, 'addresses', addressId), { isDefault: true });

      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
    } catch (error) {
      console.error('Varsayılan adres ayarlanırken hata:', error);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Building className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getAddressTypeText = (type: string) => {
    switch (type) {
      case 'home':
        return 'Ev';
      case 'work':
        return 'İş';
      default:
        return 'Diğer';
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Adreslerim</h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Teslimat adreslerinizi yönetin
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Adres Ekle</span>
        </button>
      </div>

      {/* Stats */}
      {addresses.length > 0 && (
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {addresses.length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Toplam Adres
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {addresses.filter(a => a.isDefault).length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Varsayılan Adres
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Set(addresses.map(a => a.city)).size}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Farklı Şehir
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Henüz adresiniz yok
          </h3>
          <p className={`text-gray-600 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            İlk adresinizi ekleyerek siparişlerinizi daha hızlı verebilirsiniz!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            İlk Adresinizi Ekleyin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md relative ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } ${address.isDefault ? 'ring-2 ring-blue-500' : ''}`}
            >
              {address.isDefault && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Varsayılan
                </div>
              )}

              {/* Address Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {getAddressTypeIcon(address.type)}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {address.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getAddressTypeText(address.type)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {address.fullName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {address.phone}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className={`w-4 h-4 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p>{address.address}</p>
                    <p>{address.district}, {address.city}</p>
                    {address.postalCode && <p>{address.postalCode}</p>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button className={`text-sm px-3 py-1 rounded ${
                    address.isDefault
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                  }`} disabled={address.isDefault} onClick={() => setAsDefault(address.id)}>
                    Varsayılan Yap
                  </button>
                </div>

                <div className="flex gap-2">
                  <button className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAddress(address.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;