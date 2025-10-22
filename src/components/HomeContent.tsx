'use client';

import { useStores } from '@/hooks/useStores';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@googlemaps/js-api-loader';

function HomeContent() {
  const { stores, loading } = useStores();
  const { user, role } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'store' | 'courier'>('store');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log('HomeContent mounted on client');
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Partner kullanıcıları partner sayfasına yönlendir
    if (user && (role === 1 || role === 3)) {
      router.push('/partner');
    }
  }, [user, role, router]);

  if (!isMounted) {
    console.log('HomeContent: Not mounted yet, returning null');
    return null; // Prevent any server-side rendering
  }

  console.log('HomeContent: Rendering on client');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Yummine</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMode(mode === 'store' ? 'courier' : 'store')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {mode === 'store' ? 'Kurye Hizmeti' : 'Mağaza'}
              </button>
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Hoş geldiniz, {user.email}</span>
                  <Link href="/profile" className="text-indigo-600 hover:text-indigo-900">Profil</Link>
                  {role === 0 && <Link href="/admin" className="text-red-600 hover:text-red-900">Admin</Link>}
                  {role === 1 && <Link href="/store" className="text-green-600 hover:text-green-900">Mağaza</Link>}
                  {role === 3 && <Link href="/courier" className="text-blue-600 hover:text-blue-900">Kurye</Link>}
                  <button onClick={() => window.location.href = '/auth/login'} className="text-gray-600 hover:text-gray-900">Çıkış</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login?type=customer" className="text-indigo-600 hover:text-indigo-900">Giriş</Link>
                  <Link href="/auth/register?type=customer" className="text-indigo-600 hover:text-indigo-900">Kayıt</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {mode === 'store' ? (
            <>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Mağazalar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <div key={store.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{store.description}</p>
                      <div className="mt-4">
                        <Link
                          href={`/store/${store.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Mağazaya Git
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CourierService />
          )}
        </div>
      </main>
    </div>
  );
}

function CourierService() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Note: google.maps.Marker is deprecated as of Feb 2024, but will continue to work until at least Feb 2026
  // This warning can be safely ignored for now. Consider migrating to AdvancedMarkerElement when @react-google-maps/api supports it.
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    productInfo: '',
    name: '',
    phone: '',
    idNumber: '',
  });

  useEffect(() => {
    // Google Maps loader - şimdilik devre dışı
    // const loader = new Loader({
    //   apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    //   version: 'weekly',
    //   libraries: ['places'],
    // });

    // loader.load().then(() => {
    //   const mapElement = document.getElementById('map');
    //   if (mapElement) {
    //     const googleMap = new google.maps.Map(mapElement, {
    //       center: { lat: 39.9334, lng: 32.8597 }, // Ankara
    //       zoom: 10,
    //     });
    //     setMap(googleMap);
    //   }
    // });
  }, []);

  const calculateDistance = () => {
    if (markers.length >= 2) {
      const directionsService = new google.maps.DirectionsService();
      const waypoints = markers.slice(1, -1).map(marker => ({
        location: marker.getPosition()!,
        stopover: true,
      }));

      directionsService.route({
        origin: markers[0].getPosition()!,
        destination: markers[markers.length - 1].getPosition()!,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance!.value, 0) / 1000; // km
          setDistance(totalDistance);
          setDeliveryFee(totalDistance * 2); // 2 TL/km
        }
      });
    }
  };

  const submitCourierRequest = () => {
    // Firestore'a kaydet
    console.log('Kurye talebi:', { ...formData, distance, deliveryFee, markers });
    alert('Kurye talebi oluşturuldu!');
  };

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Kurye Hizmeti</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div id="map" className="w-full h-96 bg-gray-200 rounded-lg"></div>
          <button
            onClick={calculateDistance}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Mesafe Hesapla
          </button>
          {distance > 0 && (
            <p className="mt-2">Mesafe: {distance.toFixed(2)} km, Ücret: ₺{deliveryFee.toFixed(2)}</p>
          )}
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Teslimat Bilgileri</h3>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Alış Adresi"
              className="w-full px-3 py-2 border rounded"
              value={formData.pickupAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Teslimat Adresi"
              className="w-full px-3 py-2 border rounded"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Ürün Bilgisi"
              className="w-full px-3 py-2 border rounded"
              value={formData.productInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, productInfo: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Ad Soyad"
              className="w-full px-3 py-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="tel"
              placeholder="Telefon"
              className="w-full px-3 py-2 border rounded"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Kimlik Numarası"
              className="w-full px-3 py-2 border rounded"
              value={formData.idNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
            />
            <button
              type="button"
              onClick={submitCourierRequest}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Kurye Talebi Oluştur
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomeContent;