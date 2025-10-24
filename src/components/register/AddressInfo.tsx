'use client';

import React, { useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ['places'];

interface Address {
  province: string;
  district: string;
  neighborhood: string;
  street: string;
  detailedAddress: string;
  latitude: number;
  longitude: number;
}

interface AddressInfoProps {
  address: Address;
  setAddress: React.Dispatch<React.SetStateAction<Address>>;
  formErrors: { [key: string]: string };
  cities: string[];
  loadingLocations: boolean;
}

const AddressInfo: React.FC<AddressInfoProps> = ({
  address,
  setAddress,
  formErrors,
  cities,
  loadingLocations,
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Create custom marker content
  const createMarkerContent = () => {
    const content = document.createElement("div");
    content.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #3B82F6;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: white;
        "></div>
      </div>
    `;
    return content;
  };

  // Update marker when address coordinates change
  useEffect(() => {
    if (mapRef.current && isLoaded && window.google && window.google.maps && window.google.maps.marker) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }

      // Create new marker if coordinates exist
      if (address.latitude && address.longitude) {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: address.latitude, lng: address.longitude },
          content: createMarkerContent(),
        });
        markerRef.current = marker;
      }
    }
  }, [address.latitude, address.longitude, isLoaded]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <h3 className="text-xl font-semibold mb-4">Adres Bilgileri</h3>
      <p className="text-sm text-gray-300 mb-4">Harita üzerinden DOĞRU konumunuzu seçin [ÖNERİLEN MANUEL KONUM SEÇİMİDİR ] ve adres bilgilerinizi doldurun.</p>

      {/* Google Maps */}
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative" suppressHydrationWarning>
        {isLoaded ? (
          <>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{
                lat: address.latitude || 39.9334,
                lng: address.longitude || 32.8597
              }}
              zoom={address.latitude ? 15 : 6}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              onClick={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat?.();
                  const lng = e.latLng.lng?.();
                  if (typeof lat === 'number' && typeof lng === 'number') {
                    setAddress(f => ({
                      ...f,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }
                }
              }}
              options={{
                disableDefaultUI: true,
                clickableIcons: false,
              }}
            >
            </GoogleMap>
            {/* Sadece Konumumu Bul butonu */}
            <button
              type="button"
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
              onClick={async () => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setAddress(f => ({
                        ...f,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                      }));
                      // Başarılı konum alma sonrası kullanıcıya bilgi ver
                      console.log('Konum başarıyla alındı:', position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                      console.error('Konum alma hatası:', error);
                      let errorMessage = 'Konum alınamadı. Lütfen harita üzerinden manuel olarak konum seçin.';
                      
                      if (error && error.code) {
                        switch (error.code) {
                          case error.PERMISSION_DENIED:
                            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
                            break;
                          case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Konum bilgisi mevcut değil. Lütfen GPS\'inizi açın.';
                            break;
                          case error.TIMEOUT:
                            errorMessage = 'Konum alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.';
                            break;
                          default:
                            errorMessage = 'Bilinmeyen konum hatası. Lütfen manuel olarak konum seçin.';
                            break;
                        }
                      }
                      
                      alert(errorMessage);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
                  );
                } else {
                  alert('Tarayıcınız konum özelliğini desteklemiyor.');
                }
              }}
            >
              Konumumu Bul
            </button>
          </>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-gray-400">Harita yükleniyor...</div>
          </div>
        )}
      </div>

      {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}

      {/* Adres Formu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">İl *</label>
          <select
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.province ? 'border-red-500' : 'border-gray-300'
            }`}
            value={address.province || ""}
            onChange={e => setAddress(f => ({ ...f, province: e.target.value }))}
            required
          >
            <option value="" disabled>İl seçin</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {formErrors.province && <p className="text-red-500 text-xs mt-1">{formErrors.province}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">İlçe *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.district ? 'border-red-500' : 'border-gray-300'
            }`}
            value={address.district || ""}
            onChange={e => setAddress(f => ({ ...f, district: e.target.value }))}
            placeholder="İlçe adını girin"
            required
          />
          {formErrors.district && <p className="text-red-500 text-xs mt-1">{formErrors.district}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mahalle *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.neighborhood ? 'border-red-500' : 'border-gray-300'
            }`}
            value={address.neighborhood || ""}
            onChange={e => setAddress(f => ({ ...f, neighborhood: e.target.value }))}
            placeholder="Mahalle adını girin"
            required
          />
          {formErrors.neighborhood && <p className="text-red-500 text-xs mt-1">{formErrors.neighborhood}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sokak/Cadde *</label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.street ? 'border-red-500' : 'border-gray-300'
            }`}
            value={address.street || ""}
            onChange={e => setAddress(f => ({ ...f, street: e.target.value }))}
            placeholder="Örnek: Atatürk Caddesi"
            required
          />
          {formErrors.street && <p className="text-red-500 text-xs mt-1">{formErrors.street}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Açık Adres *</label>
          <textarea
            className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.detailedAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            value={address.detailedAddress || ""}
            onChange={e => setAddress(f => ({ ...f, detailedAddress: e.target.value }))}
            placeholder="Bina no, daire no, kat bilgisi vb."
            rows={2}
            required
          />
          {formErrors.detailedAddress && <p className="text-red-500 text-xs mt-1">{formErrors.detailedAddress}</p>}
        </div>
      </div>

      {/* Konum Bilgileri */}
      {address.latitude && address.longitude && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Seçilen Konum:</h4>
          <div className="text-xs text-gray-600">
            Enlem: {address.latitude.toFixed(6)}, Boylam: {address.longitude.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressInfo;