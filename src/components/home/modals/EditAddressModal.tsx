import React, { useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { GoogleMap } from '@react-google-maps/api';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'react-toastify';

interface EditAddressModalProps {
  darkMode: boolean;
  showEditAddressModal: boolean;
  setShowEditAddressModal: (show: boolean) => void;
  editingAddress: any;
  setEditingAddress: (address: any) => void;
  isLoaded: boolean;
  reverseGeocode: (lat: number, lng: number) => void;
  newAddressName: string;
  setNewAddressName: (name: string) => void;
  addressCity: string;
  setAddressCity: (city: string) => void;
  addressDistrict: string;
  setAddressDistrict: (district: string) => void;
  addressNeighborhood: string;
  setAddressNeighborhood: (neighborhood: string) => void;
  addressStreet: string;
  setAddressStreet: (street: string) => void;
  addressBuildingNumber: string;
  setAddressBuildingNumber: (buildingNumber: string) => void;
  addressApartment: string;
  setAddressApartment: (apartment: string) => void;
  addressFloor: string;
  setAddressFloor: (floor: string) => void;
  addressHasElevator: boolean;
  setAddressHasElevator: (hasElevator: boolean) => void;
  newAddressStreet: string;
  setNewAddressStreet: (additionalInfo: string) => void;
  addresses: any[];
  setAddresses: (addresses: any[]) => void;
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
  user: any;
}

export default function EditAddressModal({
  darkMode,
  showEditAddressModal,
  setShowEditAddressModal,
  editingAddress,
  setEditingAddress,
  isLoaded,
  reverseGeocode,
  newAddressName,
  setNewAddressName,
  addressCity,
  setAddressCity,
  addressDistrict,
  setAddressDistrict,
  addressNeighborhood,
  setAddressNeighborhood,
  addressStreet,
  setAddressStreet,
  addressBuildingNumber,
  setAddressBuildingNumber,
  addressApartment,
  setAddressApartment,
  addressFloor,
  setAddressFloor,
  addressHasElevator,
  setAddressHasElevator,
  newAddressStreet,
  setNewAddressStreet,
  addresses,
  setAddresses,
  selectedAddress,
  setSelectedAddress,
  user
}: EditAddressModalProps) {
  const [markerPosition, setMarkerPosition] = React.useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Create custom marker content
  const createMarkerContent = () => {
    const content = document.createElement("div");
    content.innerHTML = `
      <svg fill="#ffffff" width="40px" height="40px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16,2A11.0134,11.0134,0,0,0,5,13a10.8885,10.8885,0,0,0,2.2163,6.6s.3.3945.3482.4517L16,30l8.439-9.9526c.0444-.0533.3447-.4478.3447-.4478l.0015-.0024A10.8846,10.8846,0,0,0,27,13,11.0134,11.0134,0,0,0,16,2Zm0,6a3,3,0,1,1-3,3A3.0033,3.0033,0,0,1,16,8Zm4,11H18V17H14v2H12V17a2.0023,2.0023,0,0,1,2-2h4a2.0023,2.0023,0,0,1,2,2Z" />
      </svg>
    `;
    return content;
  };

  // Update marker when position changes
  useEffect(() => {
    if (mapRef.current && isLoaded && window.google && window.google.maps && window.google.maps.marker) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }

      // Create new marker if position exists
      if (markerPosition) {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: markerPosition,
          content: createMarkerContent(),
        });
        markerRef.current = marker;
      }
    }
  }, [markerPosition, isLoaded]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (!showEditAddressModal || !editingAddress) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowEditAddressModal(false)}></div>
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-200rounded-lg shadow-2xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Adresi Düzenle</h2>
          <button onClick={() => setShowEditAddressModal(false)} className={`p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Adres Adı (Örn: Ev, İş, vb.)
            </label>
            <input
              type="text"
              placeholder="Adres adı girin"
              value={newAddressName}
              onChange={(e) => setNewAddressName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Location Selection */}
          <div>
            <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Konum Seçimi
            </label>
            <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
              <div className="h-48">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={markerPosition || { lat: 41.0082, lng: 28.9784 }}
                    zoom={markerPosition ? 18 : 15}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: false,
                      mapTypeControl: false,
                      scaleControl: false,
                      streetViewControl: false,
                      rotateControl: false,
                      fullscreenControl: false,
                      gestureHandling: 'greedy'
                    }}
                    onLoad={(map) => {
                      mapRef.current = map;
                    }}
                    onClick={(e) => {
                      if (e.latLng) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setMarkerPosition({ lat, lng });
                        // Use reverse geocoding when clicking on map
                        reverseGeocode(lat, lng);
                      }
                    }}
                  >
                  </GoogleMap>
                ) : (
                  <div className={`h-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                    <div className="text-center">
                      <MapPin className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Harita yükleniyor...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {/* Coordinates Display */}
                {markerPosition && (
                  <div className={`mb-3 p-2 rounded-lg text-xs font-mono ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    📍 Enlem: {markerPosition.lat.toFixed(6)}, Boylam: {markerPosition.lng.toFixed(6)}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          const newPosition = { lat: latitude, lng: longitude };
                          setMarkerPosition(newPosition);
                          // Use reverse geocoding to get address details
                          reverseGeocode(latitude, longitude);

                          toast.success(`Konum bulundu: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\nAdres bilgileri otomatik dolduruldu. Haritada işaretleyici görünecek.`, {
                            position: "top-right",
                            autoClose: 4000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                          });
                        },
                        (error) => {
                          // Konum alınamadı - sessizce devam et
                        }
                      );
                    } else {
                      console.error('Geolocation API desteklenmiyor');
                      toast.error('Tarayıcınız konum özelliğini desteklemiyor.', {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                    }
                  }}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Konumu Bul
                </button>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                İl
              </label>
              <input
                type="text"
                placeholder="İl"
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                İlçe
              </label>
              <input
                type="text"
                placeholder="İlçe"
                value={addressDistrict}
                onChange={(e) => setAddressDistrict(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mahalle
              </label>
              <input
                type="text"
                placeholder="Mahalle"
                value={addressNeighborhood}
                onChange={(e) => setAddressNeighborhood(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Cadde/Sokak
              </label>
              <input
                type="text"
                placeholder="Cadde/Sokak"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Bina No
              </label>
              <input
                type="text"
                placeholder="Bina no"
                value={addressBuildingNumber}
                onChange={(e) => setAddressBuildingNumber(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Daire
              </label>
              <input
                type="text"
                placeholder="Daire no"
                value={addressApartment}
                onChange={(e) => setAddressApartment(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Kat
              </label>
              <input
                type="text"
                placeholder="Kat"
                value={addressFloor}
                onChange={(e) => setAddressFloor(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div>
            <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Ek Bilgiler
            </label>
            <textarea
              placeholder="Adres ile ilgili ek bilgiler (örn: kapı rengi, güvenlik kodu vb.)"
              value={newAddressStreet}
              onChange={(e) => setNewAddressStreet(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 rounded-lg text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </div>

          <div>
            <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Asansör
            </label>
            <select
              value={addressHasElevator ? 'yes' : 'no'}
              onChange={(e) => setAddressHasElevator(e.target.value === 'yes')}
              className={`w-full px-3 py-2 rounded-lg text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="no">Hayır</option>
              <option value="yes">Evet</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditAddressModal(false);
                setEditingAddress(null);
                setMarkerPosition(null);
                // Reset form
                setNewAddressName('');
                setNewAddressStreet('');
                setAddressCity('');
                setAddressDistrict('');
                setAddressNeighborhood('');
                setAddressStreet('');
                setAddressBuildingNumber('');
                setAddressApartment('');
                setAddressFloor('');
                setAddressHasElevator(false);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors duration-300 ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-950'}`}
            >
              İptal
            </button>
            <button
              onClick={async () => {
                if (newAddressName.trim() && addressCity.trim() && addressDistrict.trim() && user && editingAddress) {
                  try {
                    // Combine address details
                    const buildingInfo = addressBuildingNumber.trim() ? ` No: ${addressBuildingNumber.trim()}` : '';
                    const apartmentInfo = addressApartment.trim() ? ` Daire: ${addressApartment.trim()}` : '';
                    const floorInfo = addressFloor.trim() ? ` Kat: ${addressFloor.trim()}` : '';
                    const additionalInfo = newAddressStreet.trim() ? ` - ${newAddressStreet.trim()}` : '';

                    const fullAddress = `${addressNeighborhood} ${addressStreet}${buildingInfo}${apartmentInfo}${floorInfo}, ${addressCity}/${addressDistrict}${additionalInfo}`;
                    const completeAddress = fullAddress;

                    const updatedAddress = {
                      ...editingAddress,
                      name: newAddressName.trim(),
                      street: completeAddress,
                      city: addressCity.trim(),
                      district: addressDistrict.trim(),
                      neighborhood: addressNeighborhood.trim(),
                      streetName: addressStreet.trim(),
                      buildingNumber: addressBuildingNumber.trim(),
                      apartment: addressApartment.trim(),
                      floor: addressFloor.trim(),
                      hasElevator: addressHasElevator,
                      additionalInfo: newAddressStreet.trim(),
                      latitude: markerPosition?.lat,
                      longitude: markerPosition?.lng,
                    };

                    const addressIndex = addresses.findIndex(addr => addr.id === editingAddress.id);
                    const updatedAddresses = [...addresses];
                    updatedAddresses[addressIndex] = updatedAddress;
                    setAddresses(updatedAddresses);

                    // Update Firestore
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                      addresses: updatedAddresses
                    });

                    // Update selected address if it was the one being edited
                    const shortNeighborhood = updatedAddress.neighborhood && updatedAddress.neighborhood.length > 15
                      ? updatedAddress.neighborhood.substring(0, 15) + '...'
                      : updatedAddress.neighborhood || '';
                    const currentDisplayString = `${editingAddress.name} (${editingAddress.neighborhood && editingAddress.neighborhood.length > 15 ? editingAddress.neighborhood.substring(0, 15) + '...' : editingAddress.neighborhood || ''})`;
                    if (selectedAddress === currentDisplayString) {
                      setSelectedAddress(`${updatedAddress.name} (${shortNeighborhood})`);
                    }

                    // Reset form and close modal
                    setNewAddressName('');
                    setNewAddressStreet('');
                    setAddressCity('');
                    setAddressDistrict('');
                    setAddressNeighborhood('');
                    setAddressStreet('');
                    setAddressBuildingNumber('');
                    setAddressApartment('');
                    setAddressFloor('');
                    setAddressHasElevator(false);
                    setShowEditAddressModal(false);
                    setEditingAddress(null);

                    toast.success('Adres başarıyla güncellendi!', {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                  } catch (error) {
                    console.error('Error updating address:', error);
                    toast.error('Adres güncellenirken bir hata oluştu. Lütfen tekrar deneyin.', {
                      position: "top-right",
                      autoClose: 4000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                    });
                  }
                }
              }}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-300"
            >
              Güncelle
            </button>
          </div>
        </div>
      </div>
    </>
  );
}