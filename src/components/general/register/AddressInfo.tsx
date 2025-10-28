'use client';

import React, { useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

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

  // Create custom marker icon
  const createMarkerIcon = () => {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="white" stroke-width="3"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
          <path d="M20 44C20 44 8 32 8 20C8 14.477 12.477 10 18 10H22C27.523 10 32 14.477 32 20C32 32 20 44 20 44Z" fill="#EF4444"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(40, 48),
      anchor: new google.maps.Point(20, 48),
    };
  };

  // Update marker when address coordinates change
  useEffect(() => {
    if (mapRef.current && isLoaded && window.google && window.google.maps) {
      // Center map on marker when coordinates exist
      if (address.latitude && address.longitude) {
        mapRef.current.panTo({ lat: address.latitude, lng: address.longitude });
      }
    }
  }, [address.latitude, address.longitude, isLoaded]);

  // Reverse geocoding function to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results[0]) {
        const addressComponents = response.results[0].address_components;
        const formattedAddress = response.results[0].formatted_address;

        // Parse address components
        let province = '';
        let district = '';
        let neighborhood = '';
        let street = '';
        let detailedAddress = formattedAddress;

        addressComponents.forEach((component: google.maps.GeocoderAddressComponent) => {
          const types = component.types;

          if (types.includes('administrative_area_level_1')) {
            province = component.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            district = component.long_name;
          } else if (types.includes('administrative_area_level_4') || types.includes('sublocality')) {
            neighborhood = component.long_name;
          } else if (types.includes('route')) {
            street = component.long_name;
          }
        });

        // Update address state with geocoded data
        setAddress(prev => ({
          ...prev,
          province: province || prev.province,
          district: district || prev.district,
          neighborhood: neighborhood || prev.neighborhood,
          street: street || prev.street,
          detailedAddress: detailedAddress || prev.detailedAddress,
          latitude: lat,
          longitude: lng,
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

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
                    // Reverse geocode to get address details
                    reverseGeocode(lat, lng);
                  }
                }
              }}
              options={{
                disableDefaultUI: true,
                clickableIcons: false,
              }}
            >
              {address.latitude && address.longitude && (
                <Marker
                  position={{ lat: address.latitude, lng: address.longitude }}
                  icon={createMarkerIcon()}
                  animation={google.maps.Animation.DROP}
                />
              )}
            </GoogleMap>
            {/* Sadece Konumumu Bul butonu */}
            <button
              type="button"
              className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
              onClick={async () => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const lat = position.coords.latitude;
                      const lng = position.coords.longitude;
                      // Reverse geocode to get address details
                      reverseGeocode(lat, lng);
                      // Başarılı konum alma sonrası kullanıcıya bilgi ver
                      console.log('Konum başarıyla alındı:', lat, lng);
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
            <div className="text-gray-400"></div>
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