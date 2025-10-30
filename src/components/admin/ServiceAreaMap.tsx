'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Circle, Polygon, Polyline } from '@react-google-maps/api';
import toast from 'react-hot-toast';

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

interface ServiceAreaMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onServiceAreaUpdate: (storeId: string, serviceArea: Store['serviceArea']) => void;
  activeMode?: 'store-service' | 'map-center' | 'app-service' | 'courier-zones' | 'customer-block';
  mapCenter?: { lat: number; lng: number };
  onMapCenterChange?: (center: { lat: number; lng: number }) => void;
  serviceAreas?: { id: string; name: string; color: string; polygon: { lat: number; lng: number }[]; editing?: boolean }[];
  onCreateServiceArea?: () => void;
  onSaveServiceArea?: (id: string) => void;
  onCancelServiceArea?: (id: string) => void;
  onDeleteServiceArea?: (id: string) => void;
  onUpdateServiceAreaName?: (id: string, name: string) => void;
  onUpdateServiceAreaColor?: (id: string, color: string) => void;
  onRegionUpdate?: (id: string, updates: Partial<{ polygon: { lat: number; lng: number }[] }>) => void;
  courierZones?: { id: string; name: string; center: { lat: number; lng: number }; singlePackageRadius: number; multiPackageRadius: number; color: string; maxDeliveryKm?: number; enableNotifications?: boolean }[];
  onCourierZoneUpdate?: (zones: { id: string; name: string; center: { lat: number; lng: number }; singlePackageRadius: number; multiPackageRadius: number; color: string; maxDeliveryKm?: number; enableNotifications?: boolean }[]) => void;
  customerBlockAreas?: { id: string; name: string; polygon: { lat: number; lng: number }[]; color: string }[];
  onCustomerBlockAreaUpdate?: (areas: { id: string; name: string; polygon: { lat: number; lng: number }[]; color: string }[]) => void;
  couriers?: { id: string; name: string; location?: { lat: number; lng: number }; status: 'online' | 'offline' | 'busy'; maxDeliveryKm: number; enableNotifications: boolean; fcmToken?: string; locationHistory?: { lat: number; lng: number; timestamp: number }[]; waitingPoints?: { lat: number; lng: number; duration: number; startTime: number; endTime: number }[] }[];
  onCourierUpdate?: (couriers: { id: string; name: string; location?: { lat: number; lng: number }; status: 'online' | 'offline' | 'busy'; maxDeliveryKm: number; enableNotifications: boolean; fcmToken?: string; locationHistory?: { lat: number; lng: number; timestamp: number }[]; waitingPoints?: { lat: number; lng: number; duration: number; startTime: number; endTime: number }[] }[]) => void;
  customers?: { id: string; name: string; phone?: string; location?: { lat: number; lng: number }; address?: string; lastOrderDate?: string; totalOrders?: number; status: 'active' | 'inactive' | 'blocked' }[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 41.0082, // İstanbul merkez
  lng: 28.9784,
};

const mapOptions = {
  disableDefaultUI: true, // Tüm varsayılan butonları gizle
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export default function ServiceAreaMap({ stores, selectedStore, onServiceAreaUpdate, activeMode = 'store-service', mapCenter: propMapCenter, onMapCenterChange, serviceAreas = [], onCreateServiceArea, onSaveServiceArea, onCancelServiceArea, onDeleteServiceArea, onUpdateServiceAreaName, onUpdateServiceAreaColor, onRegionUpdate, courierZones = [], onCourierZoneUpdate, customerBlockAreas = [], onCustomerBlockAreaUpdate, couriers = [], onCourierUpdate, customers = [] }: ServiceAreaMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<'circle' | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [circleRadius, setCircleRadius] = useState(2); // Default 2km
  const [mapCenter, setMapCenter] = useState(propMapCenter || defaultCenter);
  
  // App service areas state
  const [drawingPolygon, setDrawingPolygon] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [pendingDrawingRegionId, setPendingDrawingRegionId] = useState<string | null>(null);

  // App service area functions
  const [polygonUndoStack, setPolygonUndoStack] = useState<{ lat: number; lng: number }[][]>([]);

  // Blok modu state - birden çok daire oluşturma
  const [blockMode, setBlockMode] = useState(false);
  const [blocks, setBlocks] = useState<{ id: string; center: { lat: number; lng: number }; radius: number }[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Kurye bölgeleri state
  const [selectedCourierZoneId, setSelectedCourierZoneId] = useState<string | null>(null);
  const [courierZoneSettings, setCourierZoneSettings] = useState({
    singlePackageRadius: 5000, // 5km default
    multiPackageRadius: 10000, // 10km default
    maxDeliveryKm: 25, // 25km default max delivery distance
    enableNotifications: true, // Enable proximity notifications by default
  });

  // Kurye konum geçmişi state
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [showCourierHistory, setShowCourierHistory] = useState(false);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState<number | null>(null);

  // Müşteri blok bölgesi state
  const [selectedCustomerBlockAreaId, setSelectedCustomerBlockAreaId] = useState<string | null>(null);

  // Toolbar state
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSystemSummary, setShowSystemSummary] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [toolbarMode, setToolbarMode] = useState<'select' | 'polygon' | 'circle' | 'delete'>('select');

  // Filtreleme sistemi state
  const [filters, setFilters] = useState({
    showStores: true,
    showCustomers: true,
    showCouriers: true,
    showServiceAreas: true,
    showCourierZones: true,
    showCustomerBlocks: true,
  });

  // Kurye konum geçmişi fonksiyonları
  const updateCourierLocationHistory = useCallback((courierId: string, newLocation: { lat: number; lng: number }) => {
    const now = Date.now();
    const updatedCouriers = couriers.map(courier => {
      if (courier.id === courierId) {
        const locationHistory = courier.locationHistory || [];
        const newHistoryEntry = { lat: newLocation.lat, lng: newLocation.lng, timestamp: now };
        
        // Son 100 konumu tut (hafıza yönetimi için)
        const updatedHistory = [...locationHistory, newHistoryEntry].slice(-100);
        
        // Bekleme noktalarını hesapla
        const waitingPoints = calculateWaitingPoints(updatedHistory);
        
        return {
          ...courier,
          location: newLocation,
          locationHistory: updatedHistory,
          waitingPoints
        };
      }
      return courier;
    });
    
    if (onCourierUpdate) {
      onCourierUpdate(updatedCouriers);
    }
  }, [couriers, onCourierUpdate]);

  // Bekleme noktalarını hesaplama algoritması
  const calculateWaitingPoints = useCallback((locationHistory: { lat: number; lng: number; timestamp: number }[]) => {
    const waitingPoints: { lat: number; lng: number; duration: number; startTime: number; endTime: number }[] = [];
    const minWaitingTime = 2 * 60 * 1000; // 2 dakika minimum bekleme süresi
    const maxMovementDistance = 10; // 10 metre maksimum hareket mesafesi (bekleme için)

    let currentWaitingStart: number | null = null;
    let waitingLocation: { lat: number; lng: number } | null = null;

    for (let i = 1; i < locationHistory.length; i++) {
      const current = locationHistory[i];
      const previous = locationHistory[i - 1];
      
      // İki konum arasındaki mesafeyi hesapla
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(previous.lat, previous.lng),
        new google.maps.LatLng(current.lat, current.lng)
      );

      const timeDiff = current.timestamp - previous.timestamp;

      if (distance <= maxMovementDistance) {
        // Hareket yok veya çok az - bekleme başladı
        if (currentWaitingStart === null) {
          currentWaitingStart = previous.timestamp;
          waitingLocation = { lat: previous.lat, lng: previous.lng };
        }
      } else {
        // Hareket var - bekleme bitti
        if (currentWaitingStart !== null && waitingLocation) {
          const waitingDuration = current.timestamp - currentWaitingStart;
          if (waitingDuration >= minWaitingTime) {
            waitingPoints.push({
              lat: waitingLocation.lat,
              lng: waitingLocation.lng,
              duration: waitingDuration,
              startTime: currentWaitingStart,
              endTime: current.timestamp
            });
          }
          currentWaitingStart = null;
          waitingLocation = null;
        }
      }
    }

    // Son bekleme noktası hala devam ediyorsa
    if (currentWaitingStart !== null && waitingLocation && locationHistory.length > 0) {
      const lastLocation = locationHistory[locationHistory.length - 1];
      const waitingDuration = lastLocation.timestamp - currentWaitingStart;
      if (waitingDuration >= minWaitingTime) {
        waitingPoints.push({
          lat: waitingLocation.lat,
          lng: waitingLocation.lng,
          duration: waitingDuration,
          startTime: currentWaitingStart,
          endTime: lastLocation.timestamp
        });
      }
    }

    return waitingPoints;
  }, []);

  // Kurye konum güncelleme simülasyonu (gerçek uygulamada GPS verisi gelecek)
  const startLocationTracking = useCallback((courierId: string) => {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
    }

    const interval = setInterval(() => {
      const courier = couriers.find(c => c.id === courierId);
      if (courier && courier.status === 'online') {
        // Rastgele küçük hareket simülasyonu (gerçek uygulamada GPS verisi)
        const currentLocation = courier.location || { lat: 39.9334, lng: 32.8597 };
        const randomLat = currentLocation.lat + (Math.random() - 0.5) * 0.001; // ~100m rastgele hareket
        const randomLng = currentLocation.lng + (Math.random() - 0.5) * 0.001;
        
        updateCourierLocationHistory(courierId, { lat: randomLat, lng: randomLng });
      }
    }, 30000); // 30 saniyede bir güncelleme

    setLocationUpdateInterval(interval);
    toast.success('Konum takibi başlatıldı');
  }, [couriers, updateCourierLocationHistory, locationUpdateInterval]);

  const stopLocationTracking = useCallback(() => {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      setLocationUpdateInterval(null);
      toast.success('Konum takibi durduruldu');
    }
  }, [locationUpdateInterval]);

  // Update mapCenter when prop changes
  useEffect(() => {
    if (propMapCenter) {
      setMapCenter(propMapCenter);
    }
  }, [propMapCenter]);

  // Start polygon drawing when pendingDrawingRegionId changes
  useEffect(() => {
    if (pendingDrawingRegionId) {
      setDrawingPolygon(true);
      setPolygonPoints([]);
      setPolygonUndoStack([]);
      setEditingRegionId(pendingDrawingRegionId);
      setPendingDrawingRegionId(null);
      toast('Çokgen çizmek için haritada noktalara tıklayın. İlk noktaya tekrar tıklayarak kapatın.');
    }
  }, [pendingDrawingRegionId]);

  // Set editing region when serviceAreas changes
  useEffect(() => {
    const editingArea = serviceAreas.find(area => area.editing);
    if (editingArea) {
      setEditingRegionId(editingArea.id);
    } else {
      setEditingRegionId(null);
    }
  }, [serviceAreas]);

  const cancelDrawing = useCallback(() => {
    setDrawingMode(null);
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['drawing', 'geometry'],
  });

  // Bölge doğrulama fonksiyonları
  const validateZoneOverlap = useCallback((newZone: { center: { lat: number; lng: number }; radius: number }, zoneType: 'courier' | 'block') => {
    // Kurye bölgeleri ile blok bölgelerinin çakışıp çakışmadığını kontrol et
    if (zoneType === 'courier') {
      for (const blockArea of customerBlockAreas) {
        try {
          const blockPolygon = blockArea.polygon.map(p => new google.maps.LatLng(p.lat, p.lng));
          const zoneCenter = new google.maps.LatLng(newZone.center.lat, newZone.center.lng);
          
          // Kurye bölgesi merkezi blok bölge içinde mi kontrol et
          if (google.maps.geometry.poly.containsLocation(zoneCenter, new google.maps.Polygon({ paths: blockPolygon }))) {
            return { valid: false, message: `Kurye bölgesi "${blockArea.name}" blok bölgesinin içinde kalıyor` };
          }
        } catch (error) {
          console.warn('Çakışma kontrolü hatası:', error);
        }
      }
    }
    
    return { valid: true };
  }, [customerBlockAreas]);

  const validateBlockAreaOverlap = useCallback((newArea: { polygon: { lat: number; lng: number }[] }) => {
    // Blok bölge ile kurye bölgelerinin çakışıp çakışmadığını kontrol et
    for (const courierZone of courierZones) {
      try {
        const zoneCenter = new google.maps.LatLng(courierZone.center.lat, courierZone.center.lng);
        const areaPolygon = newArea.polygon.map(p => new google.maps.LatLng(p.lat, p.lng));
        
        // Kurye bölgesi merkezi blok bölge içinde mi kontrol et
        if (google.maps.geometry.poly.containsLocation(zoneCenter, new google.maps.Polygon({ paths: areaPolygon }))) {
          return { valid: false, message: `Blok bölge "${courierZone.name}" kurye bölgesinin merkezini kapsıyor` };
        }
      } catch (error) {
        console.warn('Çakışma kontrolü hatası:', error);
      }
    }
    
    return { valid: true };
  }, [courierZones]);

  // Proximity analysis logic for kurye-store matching
  const analyzeProximity = useCallback(() => {
    const analysis: {
      courierZone: { id: string; name: string; center: { lat: number; lng: number } };
      nearbyStores: {
        store: Store;
        distance: number;
        withinSinglePackage: boolean;
        withinMultiPackage: boolean;
      }[];
    }[] = [];

    courierZones.forEach(courierZone => {
      const nearbyStores: {
        store: Store;
        distance: number;
        withinSinglePackage: boolean;
        withinMultiPackage: boolean;
      }[] = [];

      stores.forEach(store => {
        if (!store.location?.latitude || !store.location?.longitude) return;

        // Calculate distance between courier zone center and store location
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(courierZone.center.lat, courierZone.center.lng),
          new google.maps.LatLng(store.location.latitude, store.location.longitude)
        );

        // Check if store is within courier zone ranges
        const withinSinglePackage = distance <= courierZone.singlePackageRadius;
        const withinMultiPackage = distance <= courierZone.multiPackageRadius;

        // Only include stores within reasonable distance (within multi-package range + 10km buffer)
        if (distance <= courierZone.multiPackageRadius + 10000) {
          nearbyStores.push({
            store,
            distance,
            withinSinglePackage,
            withinMultiPackage,
          });
        }
      });

      // Sort stores by distance
      nearbyStores.sort((a, b) => a.distance - b.distance);

      analysis.push({
        courierZone,
        nearbyStores,
      });
    });

    return analysis;
  }, [courierZones, stores]);

  // Bildirim gönderme fonksiyonları
  const sendProximityNotification = useCallback(async (recipientType: 'store' | 'customer', recipientId: string, courierLocation: { lat: number; lng: number }, distance: number, fcmToken?: string) => {
    if (!fcmToken) {
      console.warn('FCM token bulunamadı, bildirim gönderilemedi');
      return;
    }

    try {
      const notificationData = {
        to: fcmToken,
        notification: {
          title: recipientType === 'store' ? '🚚 Kurye Yaklaşıyor!' : '🚚 Teslimatınız Yaklaşıyor!',
          body: recipientType === 'store' 
            ? `Kurye mağazanıza ${(distance / 1000).toFixed(1)} km mesafede. Hazırlık yapın!`
            : `Siparişiniz ${(distance / 1000).toFixed(1)} km mesafede. Hazırlanın!`,
          icon: '/favicon.ico',
          click_action: recipientType === 'store' ? '/partner/orders' : '/orders'
        },
        data: {
          type: 'courier_proximity',
          courierLat: courierLocation.lat.toString(),
          courierLng: courierLocation.lng.toString(),
          distance: distance.toString(),
          recipientType,
          recipientId
        }
      };

      // Firebase Admin SDK ile bildirim gönder
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        console.log('Bildirim başarıyla gönderildi');
      } else {
        console.error('Bildirim gönderme hatası:', await response.text());
      }
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
    }
  }, []);

  // Kurye konum takibi ve bildirim kontrolü
  const checkCourierProximity = useCallback(async (courier: { id: string; name: string; location?: { lat: number; lng: number }; status: 'online' | 'offline' | 'busy'; maxDeliveryKm: number; enableNotifications: boolean; fcmToken?: string }) => {
    if (!courier.location || courier.status !== 'online' || !courier.enableNotifications) return;

    const courierLatLng = new google.maps.LatLng(courier.location.lat, courier.location.lng);

    // Mağazalara olan yakınlığı kontrol et
    stores.forEach(store => {
      if (!store.location?.latitude || !store.location?.longitude) return;

      const storeLatLng = new google.maps.LatLng(store.location.latitude, store.location.longitude);
      const distance = google.maps.geometry.spherical.computeDistanceBetween(courierLatLng, storeLatLng);

      // Kurye max teslimat mesafesi içinde mi kontrol et
      if (distance <= courier.maxDeliveryKm * 1000) {
        // 2km'den daha yakınsa bildirim gönder (şimdilik console.log ile test)
        if (distance <= 2000) {
          console.log(`Kurye ${courier.name} mağaza ${store.name}'ya ${(distance / 1000).toFixed(1)} km mesafede - Bildirim gönderilecek`);
          // sendProximityNotification('store', store.id, courier.location, distance, store.fcmToken);
        }
      }
    });

    // Müşterilere olan yakınlığı kontrol et (şimdilik örnek olarak)
    // Gerçek uygulamada sipariş verilerini kullan
    couriers.forEach(otherCourier => {
      if (otherCourier.id !== courier.id && otherCourier.location) {
        const otherLatLng = new google.maps.LatLng(otherCourier.location.lat, otherCourier.location.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(courierLatLng, otherLatLng);

        // 1km'den daha yakınsa uyarı (örnek kullanım)
        if (distance <= 1000) {
          console.log(`Kurye ${courier.name} başka bir kuryeye çok yakın: ${(distance / 1000).toFixed(1)}km`);
        }
      }
    });
  }, [stores, couriers]);

  // Get proximity analysis results
  const proximityAnalysis = analyzeProximity();

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMarkerClick = useCallback((store: Store) => {
    setEditMode(true);
    // Set radius from existing service area or default
    if (store.serviceArea && store.serviceArea.radius) {
      setCircleRadius(store.serviceArea.radius / 1000); // Convert to km
    } else {
      setCircleRadius(2); // Default 2km
    }
  }, []);

  const handleSaveServiceArea = useCallback(() => {
    if (!selectedStore) return;

    if (circleRadius < 0.1 || circleRadius > 50) {
      toast.error('Yarıçap 0.1 - 50 km arası olmalıdır');
      return;
    }

    const serviceArea = {
      center: {
        lat: selectedStore.location?.latitude || 0,
        lng: selectedStore.location?.longitude || 0
      },
      radius: circleRadius * 1000, // Convert km to meters
    };

    onServiceAreaUpdate(selectedStore.id, serviceArea);
    setEditMode(false);
    toast.success(`${circleRadius} km yarıçaplı hizmet bölgesi kaydedildi`);
  }, [selectedStore, circleRadius, onServiceAreaUpdate]);

  const onMapRightClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (drawingMode) {
      cancelDrawing();
      toast('Çizim iptal edildi');
    }
  }, [drawingMode, cancelDrawing]);

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setCircleRadius(2);
  }, []);


  // Helper function to calculate polygon area in km²
  const calculatePolygonArea = useCallback((points: { lat: number; lng: number }[]) => {
    if (points.length < 3) return 0;
    
    try {
      const path = points.map(point => new google.maps.LatLng(point.lat, point.lng));
      const areaInSquareMeters = google.maps.geometry.spherical.computeArea(path);
      const areaInSquareKm = areaInSquareMeters / 1000000; // Convert to km²
      return areaInSquareKm;
    } catch (error) {
      console.error('Alan hesaplama hatası:', error);
      return 0;
    }
  }, []);

  const startPolygonDrawing = useCallback((regionId: string) => {
    setPendingDrawingRegionId(regionId);
  }, []);

  const finishPolygonDrawing = useCallback(() => {
    if (polygonPoints.length < 3) {
      toast.error('Çokgen en az 3 nokta içermelidir');
      return;
    }

    if (!editingRegionId) {
      toast.error('Düzenlenecek bölge seçilmedi');
      return;
    }

    // Close the polygon by adding the first point again
    const closedPolygon = [...polygonPoints, polygonPoints[0]];
    
    // Update the region via callback
    if (onRegionUpdate) {
      onRegionUpdate(editingRegionId, { polygon: closedPolygon });
    }

    setDrawingPolygon(false);
    setPolygonPoints([]);
    setPolygonUndoStack([]);
    setEditingRegionId(null);
    toast.success('Uygulama hizmet bölgesi kaydedildi');
  }, [polygonPoints, editingRegionId, onRegionUpdate]);

  const cancelPolygonDrawing = useCallback(() => {
    setDrawingPolygon(false);
    setPolygonPoints([]);
    setPolygonUndoStack([]);
    setEditingRegionId(null);
    toast('Çokgen çizimi iptal edildi');
  }, []);

  const onMapClickForAppService = useCallback((event: google.maps.MapMouseEvent) => {
    if (activeMode !== 'app-service' || !drawingPolygon || !editingRegionId) return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();

    if (!lat || !lng) return;

    const newPoint = { lat, lng };

    // Check if clicking on the first point to close the polygon
    if (polygonPoints.length >= 3) {
      const firstPoint = polygonPoints[0];
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(newPoint.lat, newPoint.lng),
        new google.maps.LatLng(firstPoint.lat, firstPoint.lng)
      );

      // If clicking close to the first point (within 20 meters), close the polygon
      if (distance < 20) {
        finishPolygonDrawing();
        return;
      }
    }

    setPolygonUndoStack(prev => [...prev, polygonPoints]);
    setPolygonPoints(prev => [...prev, newPoint]);
    toast(`Nokta ${polygonPoints.length + 1} eklendi`);
  }, [activeMode, drawingPolygon, editingRegionId, polygonPoints, finishPolygonDrawing]);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!selectedStore || !drawingMode) return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();

    if (!lat || !lng) return;

    if (drawingMode === 'circle') {
      // Circle mode - set center
      const serviceArea = {
        center: { lat, lng },
        radius: 2000, // Default 2km radius
      };
      onServiceAreaUpdate(selectedStore.id, serviceArea);
      setDrawingMode(null);
      toast.success('Hizmet bölgesi merkezi ayarlandı');
    }
  }, [selectedStore, drawingMode, onServiceAreaUpdate]);

  const onMapClickForCenter = useCallback((event: google.maps.MapMouseEvent) => {
    if (activeMode !== 'map-center') return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();

    if (!lat || !lng) return;

    const newCenter = { lat, lng };
    setMapCenter(newCenter);
    onMapCenterChange?.(newCenter);

    // Update map center
    if (map) {
      map.setCenter(newCenter);
      toast.success(`Harita merkezi güncellendi: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, [activeMode, map, onMapCenterChange]);

  // ESC tuşu ile çizimden çıkma ve Ctrl+Z ile undo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (drawingMode || drawingPolygon)) {
        if (drawingMode) {
          cancelDrawing();
        } else if (drawingPolygon) {
          cancelPolygonDrawing();
        }
      }
      // Ctrl+Z ile çokgen çiziminde son noktayı geri al
      if (
        drawingPolygon &&
        (event.key === 'z' || event.key === 'Z') &&
        (event.ctrlKey || event.metaKey)
      ) {
        if (polygonUndoStack.length > 0) {
          const prevPoints = polygonUndoStack[polygonUndoStack.length - 1];
          setPolygonPoints(prevPoints);
          setPolygonUndoStack(stack => stack.slice(0, -1));
          toast('Son nokta geri alındı');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawingMode, drawingPolygon, cancelDrawing, cancelPolygonDrawing, polygonUndoStack, calculatePolygonArea]);

  // Focus on selected store
  useEffect(() => {
    if (map && selectedStore?.location?.latitude && selectedStore?.location?.longitude) {
      map.panTo({
        lat: selectedStore.location.latitude,
        lng: selectedStore.location.longitude,
      });
      map.setZoom(14);
    }
  }, [map, selectedStore]);



  // Toolbar mode change handler
  const handleToolbarModeChange = useCallback((mode: 'select' | 'polygon' | 'circle' | 'delete') => {
    setToolbarMode(mode);
  }, []);

  // Blok modu event handler - haritada tıklayarak daire oluşturma
  const handleBlockModeClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!blockMode || !map || activeMode !== 'app-service' || drawingPolygon) return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (!lat || !lng) return;

    const domEvent = event.domEvent as MouseEvent;
    const isShiftPressed = domEvent && domEvent.shiftKey;
    const radius = isShiftPressed ? 500 : 300; // Shift ile daha büyük blok

    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      center: { lat, lng },
      radius: radius
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(null); // Yeni blok eklenince seçimi kaldır
    toast.success(`${isShiftPressed ? 'Büyük' : 'Normal'} blok eklendi`);
  }, [blockMode, map, activeMode, drawingPolygon]);

  // Blok silme fonksiyonu
  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    toast.success('Blok silindi');
  }, []);

  // Blokların toplam alanını hesapla
  const calculateBlocksTotalArea = useCallback(() => {
    if (blocks.length === 0) return 0;
    
    const totalArea = blocks.reduce((sum, block) => {
      // Daire alanı: πr² (metre kare)
      const areaInSquareMeters = Math.PI * Math.pow(block.radius, 2);
      return sum + areaInSquareMeters;
    }, 0);
    
    // km²'ye çevir
    return totalArea / 1000000;
  }, [blocks]);

  // Blokları çokgene dönüştür ve kaydet
  const saveBlocksAsPolygon = useCallback(() => {
    if (blocks.length === 0 || !editingRegionId) {
      toast.error('Kaydedilecek blok bulunamadı');
      return;
    }

    // Tüm blokları kapsayan bir çokgen oluştur
    const allPoints: { lat: number; lng: number }[] = [];
    
    blocks.forEach(block => {
      // Her blok için yaklaşık çokgen noktaları oluştur (8 nokta)
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const lat = block.center.lat + (block.radius / 111320) * Math.sin(angle); // Yaklaşık lat dönüşümü
        const lng = block.center.lng + (block.radius / (111320 * Math.cos(block.center.lat * Math.PI / 180))) * Math.cos(angle);
        allPoints.push({ lat, lng });
      }
    });

    // Convex hull hesapla (basit yaklaşım)
    const polygonPoints = allPoints.sort((a, b) => a.lng - b.lng);

    if (polygonPoints.length < 3) {
      toast.error('Yeterli nokta bulunamadı');
      return;
    }

    // İlk noktayı sonuna ekleyerek kapat
    const closedPolygon = [...polygonPoints, polygonPoints[0]];
    
    if (onRegionUpdate) {
      onRegionUpdate(editingRegionId, { polygon: closedPolygon });
    }

    setBlocks([]);
    setBlockMode(false);
    toast.success('Bloklar çokgene dönüştürüldü ve kaydedildi');
  }, [blocks, editingRegionId, onRegionUpdate]);

  // Kurye bölgesi oluşturma
  const createCourierZone = useCallback((center: { lat: number; lng: number }) => {
    // Bölge çakışmasını kontrol et
    const validation = validateZoneOverlap({ center, radius: courierZoneSettings.multiPackageRadius }, 'courier');
    if (!validation.valid) {
      toast.error(validation.message || 'Bölge çakışması tespit edildi');
      return;
    }

    const newZone = {
      id: `courier-zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Kurye Bölgesi ${courierZones.length + 1}`,
      center,
      singlePackageRadius: courierZoneSettings.singlePackageRadius,
      multiPackageRadius: courierZoneSettings.multiPackageRadius,
      maxDeliveryKm: courierZoneSettings.maxDeliveryKm,
      enableNotifications: courierZoneSettings.enableNotifications,
      color: '#FF6B35'
    };

    const updatedZones = [...courierZones, newZone];
    if (onCourierZoneUpdate) {
      onCourierZoneUpdate(updatedZones);
    }
    toast.success('Kurye bölgesi oluşturuldu');
  }, [courierZones, courierZoneSettings, onCourierZoneUpdate, validateZoneOverlap]);

  // Kurye bölgesi silme
  const deleteCourierZone = useCallback((zoneId: string) => {
    const updatedZones = courierZones.filter(zone => zone.id !== zoneId);
    if (onCourierZoneUpdate) {
      onCourierZoneUpdate(updatedZones);
    }
    setSelectedCourierZoneId(null);
    toast.success('Kurye bölgesi silindi');
  }, [courierZones, onCourierZoneUpdate]);

  // Kurye bölgesi güncelleme
  const updateCourierZone = useCallback((zoneId: string, updates: Partial<{ name: string; center: { lat: number; lng: number }; singlePackageRadius: number; multiPackageRadius: number; maxDeliveryKm: number; enableNotifications: boolean; color: string }>) => {
    const updatedZones = courierZones.map(zone =>
      zone.id === zoneId ? { ...zone, ...updates } : zone
    );
    if (onCourierZoneUpdate) {
      onCourierZoneUpdate(updatedZones);
    }
  }, [courierZones, onCourierZoneUpdate]);

  // Kurye modu için tıklama handler
  const handleCourierModeClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (activeMode !== 'courier-zones') return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (!lat || !lng) return;

    createCourierZone({ lat, lng });
  }, [activeMode, createCourierZone]);

  // Müşteri blok bölgesi oluşturma
  const createCustomerBlockArea = useCallback((center: { lat: number; lng: number }) => {
    const newArea = {
      id: `customer-block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Blok Bölge ${customerBlockAreas.length + 1}`,
      polygon: [
        { lat: center.lat + 0.005, lng: center.lng - 0.005 },
        { lat: center.lat + 0.005, lng: center.lng + 0.005 },
        { lat: center.lat - 0.005, lng: center.lng + 0.005 },
        { lat: center.lat - 0.005, lng: center.lng - 0.005 },
        { lat: center.lat + 0.005, lng: center.lng - 0.005 }
      ],
      color: '#DC2626'
    };

    // Bölge çakışmasını kontrol et
    const validation = validateBlockAreaOverlap(newArea);
    if (!validation.valid) {
      toast.error(validation.message || 'Bölge çakışması tespit edildi');
      return;
    }

    const updatedAreas = [...customerBlockAreas, newArea];
    if (onCustomerBlockAreaUpdate) {
      onCustomerBlockAreaUpdate(updatedAreas);
    }
    toast.success('Müşteri blok bölgesi oluşturuldu');
  }, [customerBlockAreas, onCustomerBlockAreaUpdate, validateBlockAreaOverlap]);

  // Müşteri blok bölgesi silme
  const deleteCustomerBlockArea = useCallback((areaId: string) => {
    const updatedAreas = customerBlockAreas.filter(area => area.id !== areaId);
    if (onCustomerBlockAreaUpdate) {
      onCustomerBlockAreaUpdate(updatedAreas);
    }
    setSelectedCustomerBlockAreaId(null);
    toast.success('Müşteri blok bölgesi silindi');
  }, [customerBlockAreas, onCustomerBlockAreaUpdate]);

  // Müşteri blok bölgesi güncelleme
  const updateCustomerBlockArea = useCallback((areaId: string, updates: Partial<{ name: string; polygon: { lat: number; lng: number }[]; color: string }>) => {
    const updatedAreas = customerBlockAreas.map(area =>
      area.id === areaId ? { ...area, ...updates } : area
    );
    if (onCustomerBlockAreaUpdate) {
      onCustomerBlockAreaUpdate(updatedAreas);
    }
  }, [customerBlockAreas, onCustomerBlockAreaUpdate]);

  // Müşteri blok modu için tıklama handler
  const handleCustomerBlockModeClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (activeMode !== 'customer-block') return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (!lat || !lng) return;

    createCustomerBlockArea({ lat, lng });
  }, [activeMode, createCustomerBlockArea]);

  if (!isLoaded) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Harita Yüklenemedi</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Google Maps API anahtarı eksik veya geçersiz.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Toolbar */}
      {showToolbar && (
        <div className="absolute top-4 center-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex items-center space-x-1">
          <button
            onClick={() => handleToolbarModeChange('select')}
            className={`p-2 rounded-md transition-colors ${
              toolbarMode === 'select'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Seç"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          {(activeMode === 'app-service' || activeMode === 'store-service') && (
            <button
              onClick={() => handleToolbarModeChange('polygon')}
              className={`p-2 rounded-md transition-colors ${
                toolbarMode === 'polygon'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Çokgen Çiz"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )}
          
          {activeMode === 'store-service' && (
            <button
              onClick={() => handleToolbarModeChange('circle')}
              className={`p-2 rounded-md transition-colors ${
                toolbarMode === 'circle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Daire Çiz"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
              </svg>
            </button>
          )}
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          
          <button
            onClick={() => {
              if (selectedCourierZoneId) {
                const updatedZones = courierZones.filter(zone => zone.id !== selectedCourierZoneId);
                if (onCourierZoneUpdate) {
                  onCourierZoneUpdate(updatedZones);
                }
                setSelectedCourierZoneId(null);
                toast.success('Kurye bölgesi silindi');
              } else if (selectedCustomerBlockAreaId) {
                const updatedAreas = customerBlockAreas.filter(area => area.id !== selectedCustomerBlockAreaId);
                if (onCustomerBlockAreaUpdate) {
                  onCustomerBlockAreaUpdate(updatedAreas);
                }
                setSelectedCustomerBlockAreaId(null);
                toast.success('Müşteri blok bölgesi silindi');
              } else if (editingRegionId) {
                onDeleteServiceArea?.(editingRegionId);
              }
            }}
            className={`p-2 rounded-md transition-colors ${
              toolbarMode === 'delete'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900'
            }`}
            title="Sil"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          
          <button
            onClick={() => setShowToolbar(false)}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            title="Toolbar'ı Gizle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Toolbar Toggle Button */}
      {!showToolbar && (
        <button
          onClick={() => setShowToolbar(true)}
          className="absolute top-4 center-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg p-2"
          title="Toolbar'ı Göster"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={10}
        options={{
          ...mapOptions,
        }}
        onLoad={onMapLoad}
        onClick={
          activeMode === 'map-center' ? onMapClickForCenter :
          activeMode === 'app-service' ? (blockMode ? handleBlockModeClick : onMapClickForAppService) :
          activeMode === 'courier-zones' ? handleCourierModeClick :
          activeMode === 'customer-block' ? handleCustomerBlockModeClick :
          onMapClick
        }
        onRightClick={onMapRightClick}
      >
        {/* Courier Zones - Show in courier-zones mode */}
        {activeMode === 'courier-zones' && filters.showCourierZones && courierZones.map((zone) => (
          <div key={zone.id}>
            {/* Multi-package zone (outer circle) */}
            <Circle
              center={zone.center}
              radius={zone.multiPackageRadius}
              options={{
                fillColor: zone.color,
                fillOpacity: 0.1,
                strokeColor: zone.color,
                strokeOpacity: 0.6,
                strokeWeight: selectedCourierZoneId === zone.id ? 3 : 2,
                zIndex: selectedCourierZoneId === zone.id ? 12 : 10,
              }}
            />
            {/* Single-package zone (inner circle) */}
            <Circle
              center={zone.center}
              radius={zone.singlePackageRadius}
              options={{
                fillColor: zone.color,
                fillOpacity: 0.2,
                strokeColor: zone.color,
                strokeOpacity: 0.8,
                strokeWeight: selectedCourierZoneId === zone.id ? 4 : 3,
                zIndex: selectedCourierZoneId === zone.id ? 13 : 11,
              }}
            />
            {/* Zone center marker */}
            <Marker
              position={zone.center}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="${zone.color}" stroke="white" stroke-width="3"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🚚</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 40),
              }}
              title={`${zone.name} - Tek paket: ${(zone.singlePackageRadius / 1000).toFixed(1)}km, Çoklu paket: ${(zone.multiPackageRadius / 1000).toFixed(1)}km`}
              onClick={() => setSelectedCourierZoneId(selectedCourierZoneId === zone.id ? null : zone.id)}
              draggable={true}
              onDragEnd={(e) => {
                const lat = e.latLng?.lat();
                const lng = e.latLng?.lng();
                if (lat && lng) {
                  updateCourierZone(zone.id, { center: { lat, lng } });
                }
              }}
            />
          </div>
        ))}

        {/* Active Couriers - Show in courier-zones mode */}
        {activeMode === 'courier-zones' && filters.showCouriers && couriers.map((courier) => {
          if (!courier.location) return null;

          const statusColors = {
            online: '#10B981',
            offline: '#6B7280',
            busy: '#F59E0B'
          };

          return (
            <div key={courier.id}>
              <Marker
                position={courier.location}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="35" height="35" viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="17.5" cy="17.5" r="16" fill="${statusColors[courier.status]}" stroke="white" stroke-width="3"/>
                      <text x="17.5" y="23" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🚴</text>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(35, 35),
                  anchor: new google.maps.Point(17.5, 35),
                }}
                title={`${courier.name} - ${courier.status} - Max: ${courier.maxDeliveryKm}km`}
                onClick={() => checkCourierProximity(courier)}
              />
              {/* Max delivery radius circle */}
              <Circle
                center={courier.location}
                radius={courier.maxDeliveryKm * 1000}
                options={{
                  fillColor: statusColors[courier.status],
                  fillOpacity: 0.05,
                  strokeColor: statusColors[courier.status],
                  strokeOpacity: 0.3,
                  strokeWeight: 1,
                  zIndex: 5,
                }}
              />
            </div>
          );
        })}

        {/* Courier Location History - Show when selected */}
        {activeMode === 'courier-zones' && selectedCourierId && showCourierHistory && (() => {
          const selectedCourier = couriers.find(c => c.id === selectedCourierId);
          if (!selectedCourier?.locationHistory || selectedCourier.locationHistory.length < 2) return null;

          const path = selectedCourier.locationHistory.map(point => ({ lat: point.lat, lng: point.lng }));

          return (
            <div key={`history-${selectedCourierId}`}>
              {/* Location history polyline */}
              <Polyline
                path={path}
                options={{
                  strokeColor: '#3B82F6',
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                  zIndex: 10,
                }}
              />
              
              {/* Waiting points markers */}
              {selectedCourier.waitingPoints?.map((waitingPoint, index) => (
                <Marker
                  key={`waiting-${selectedCourierId}-${index}`}
                  position={{ lat: waitingPoint.lat, lng: waitingPoint.lng }}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="13" fill="#EF4444" stroke="white" stroke-width="3"/>
                        <text x="15" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">⏱️</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(30, 30),
                    anchor: new google.maps.Point(15, 30),
                  }}
                  title={`${selectedCourier.name} - Bekleme Süresi: ${Math.round(waitingPoint.duration / 1000 / 60)} dakika`}
                />
              ))}
            </div>
          );
        })()}

        {/* Customer Block Areas - Show in customer-block mode */}
        {activeMode === 'customer-block' && filters.showCustomerBlocks && customerBlockAreas.map((area) => (
          <div key={area.id}>
            <Polygon
              paths={area.polygon}
              options={{
                fillColor: area.color,
                fillOpacity: 0.4,
                strokeColor: area.color,
                strokeOpacity: 0.9,
                strokeWeight: selectedCustomerBlockAreaId === area.id ? 4 : 3,
                zIndex: selectedCustomerBlockAreaId === area.id ? 15 : 14,
              }}
            />
            {/* Area center marker */}
            <Marker
              position={{
                lat: area.polygon.reduce((sum, p) => sum + p.lat, 0) / area.polygon.length,
                lng: area.polygon.reduce((sum, p) => sum + p.lng, 0) / area.polygon.length,
              }}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="13" fill="${area.color}" stroke="white" stroke-width="3"/>
                    <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🚫</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(30, 30),
                anchor: new google.maps.Point(15, 30),
              }}
              title={`${area.name} - Teslimat yapılamaz`}
              onClick={() => setSelectedCustomerBlockAreaId(selectedCustomerBlockAreaId === area.id ? null : area.id)}
            />
          </div>
        ))}
        {/* Customer Markers */}
        {filters.showCustomers && customers.map((customer) => {
          if (!customer.location?.lat || !customer.location?.lng) return null;

          const statusColors = {
            active: '#10B981',
            inactive: '#6B7280',
            blocked: '#EF4444'
          };

          return (
            <Marker
              key={customer.id}
              position={{
                lat: customer.location.lat,
                lng: customer.location.lng,
              }}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="13" fill="${statusColors[customer.status]}" stroke="white" stroke-width="2"/>
                    <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-weight="bold">👤</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(28, 28),
                anchor: new google.maps.Point(14, 28),
              }}
              title={`${customer.name} - ${customer.phone || 'Telefon yok'} - ${customer.totalOrders || 0} sipariş`}
            />
          );
        })}

        {/* Store Markers */}
        {filters.showStores && stores.map((store) => {
          if (!store.location?.latitude || !store.location?.longitude) return null;

          const isSelected = selectedStore?.id === store.id;
          const isApproved = store.status === 'approved' && store.isActive;

          return (
            <div key={store.id}>
              <Marker
                position={{
                  lat: store.location.latitude,
                  lng: store.location.longitude,
                }}
                icon={{
                  url: editMode && selectedStore?.id === store.id
                    ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#F59E0B" stroke="white" stroke-width="3"/>
                        <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${store.name.charAt(0).toUpperCase()}</text>
                      </svg>
                    `)
                    : isSelected
                    ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="3"/>
                        <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${store.name.charAt(0).toUpperCase()}</text>
                      </svg>
                    `)
                    : isApproved
                    ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="13" fill="#10B981" stroke="white" stroke-width="2"/>
                        <text x="15" y="19" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${store.name.charAt(0).toUpperCase()}</text>
                      </svg>
                    `)
                    : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="13" fill="#F59E0B" stroke="white" stroke-width="2"/>
                        <text x="15" y="19" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${store.name.charAt(0).toUpperCase()}</text>
                      </svg>
                    `),
                  scaledSize: isSelected || (editMode && selectedStore?.id === store.id) ? new google.maps.Size(40, 40) : new google.maps.Size(30, 30),
                  anchor: isSelected || (editMode && selectedStore?.id === store.id) ? new google.maps.Point(20, 40) : new google.maps.Point(15, 30),
                }}
                title={`${store.name} - ${store.address || 'Adres belirtilmemiş'}`}
                onClick={activeMode === 'store-service' ? () => onMarkerClick(store) : undefined}
              />

              {/* Service Area Visualization */}
              {store.serviceArea && (
                <>
                  {store.serviceArea.polygon ? (
                    <Polygon
                      paths={store.serviceArea.polygon}
                      options={{
                        fillColor: isSelected ? '#3B82F6' : '#10B981',
                        fillOpacity: 0.2,
                        strokeColor: isSelected ? '#3B82F6' : '#10B981',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                      }}
                    />
                  ) : (
                    <Circle
                      center={store.serviceArea.center}
                      radius={store.serviceArea.radius}
                      options={{
                        fillColor: isSelected ? '#3B82F6' : '#10B981',
                        fillOpacity: 0.2,
                        strokeColor: isSelected ? '#3B82F6' : '#10B981',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                      }}
                    />
                  )}
                </>
              )}

              {/* Preview Circle for Edit Mode */}
              {editMode && selectedStore?.id === store.id && (
                <Circle
                  center={{
                    lat: store.location.latitude,
                    lng: store.location.longitude,
                  }}
                  radius={circleRadius * 1000}
                  options={{
                    fillColor: '#F59E0B',
                    fillOpacity: 0.3,
                    strokeColor: '#F59E0B',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Map Center Marker - Only show in map-center mode */}
        {activeMode === 'map-center' && (
          <Marker
            position={mapCenter}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="22" fill="#DC2626" stroke="white" stroke-width="4"/>
                  <circle cx="25" cy="25" r="12" fill="white"/>
                  <circle cx="25" cy="25" r="8" fill="#DC2626"/>
                  <text x="25" y="30" text-anchor="middle" fill="white" font-size="14" font-weight="bold">📍</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(50, 50),
              anchor: new google.maps.Point(25, 45),
            }}
            title={`Harita Merkezi: ${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}`}
            draggable={true}
            onDragEnd={(event) => {
              const lat = event.latLng?.lat();
              const lng = event.latLng?.lng();
              if (lat && lng) {
                const newCenter = { lat, lng };
                setMapCenter(newCenter);
                onMapCenterChange?.(newCenter);
                if (map) {
                  map.setCenter(newCenter);
                }
                toast.success(`Harita merkezi taşındı: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              }
            }}
          />
        )}

        {/* App Service Areas - Only show in app-service mode */}
        {activeMode === 'app-service' && filters.showServiceAreas && serviceAreas.map((area) => (
          area.polygon.length > 0 && (
            <Polygon
              key={area.id}
              paths={area.polygon}
              options={{
                fillColor: area.color,
                fillOpacity: 0.3,
                strokeColor: area.color,
                strokeOpacity: 0.8,
                strokeWeight: 3,
              }}
            />
          )
        ))}

        {/* Polygon Drawing Points - Only show when drawing in app-service mode */}
        {activeMode === 'app-service' && drawingPolygon && polygonPoints.map((point, index) => (
          <Marker
            key={`point-${index}`}
            position={point}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="13" fill="#EF4444" stroke="white" stroke-width="3"/>
                  <text x="15" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 30),
              anchor: new google.maps.Point(15, 15),
            }}
            title={`Nokta ${index + 1}`}
            onClick={(e) => {
              const domEvent = e.domEvent as MouseEvent;
              // Ctrl ile sil
              if (domEvent && (domEvent.ctrlKey || domEvent.metaKey)) {
                setPolygonPoints(prev => prev.filter((_, i) => i !== index));
                setPolygonUndoStack(prev => [...prev, polygonPoints]);
                toast(`Nokta ${index + 1} silindi`);
              }
            }}
            draggable={true}
            onDragEnd={(e) => {
              const domEvent = e.domEvent as MouseEvent;
              if (domEvent && domEvent.shiftKey) {
                const newLat = e.latLng?.lat();
                const newLng = e.latLng?.lng();
                if (typeof newLat === 'number' && typeof newLng === 'number') {
                  setPolygonPoints(prev => prev.map((p, i) => i === index ? { lat: newLat, lng: newLng } : p));
                  setPolygonUndoStack(prev => [...prev, polygonPoints]);
                  toast(`Nokta ${index + 1} taşındı`);
                }
              } else {
                setPolygonPoints(prev => [...prev]);
              }
            }}
            cursor="pointer"
          />
        ))}

        {/* Kenar ortalarına yeni nokta ekleme (Alt tuşu ile) */}
        {activeMode === 'app-service' && drawingPolygon && polygonPoints.length > 1 && polygonPoints.map((point, i) => {
          const nextIndex = (i + 1) % polygonPoints.length;
          const nextPoint = polygonPoints[nextIndex];
          // Kenarın ortasını hesapla
          const midLat = (point.lat + nextPoint.lat) / 2;
          const midLng = (point.lng + nextPoint.lng) / 2;
          return (
            <Marker
              key={`midpoint-${i}`}
              position={{ lat: midLat, lng: midLng }}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="7" fill="#FBBF24" stroke="white" stroke-width="2"/>
                    <text x="9" y="13" text-anchor="middle" fill="white" font-size="10" font-weight="bold">+</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(18, 18),
                anchor: new google.maps.Point(9, 9),
              }}
              onClick={(e) => {
                const domEvent = e.domEvent as MouseEvent;
                if (domEvent && domEvent.altKey) {
                  setPolygonPoints(prev => {
                    const newPoints = [...prev];
                    newPoints.splice(nextIndex, 0, { lat: midLat, lng: midLng });
                    return newPoints;
                  });
                  setPolygonUndoStack(prev => [...prev, polygonPoints]);
                  toast('Yeni nokta eklendi');
                }
              }}
              cursor="pointer"
              zIndex={2}
              opacity={0.7}
            />
          );
        })}

        {/* Preview Polygon - Show while drawing */}
        {activeMode === 'app-service' && drawingPolygon && polygonPoints.length > 2 && (
          <Polygon
            paths={[[...polygonPoints, polygonPoints[0]]]}
            options={{
              fillColor: '#10B981',
              fillOpacity: 0.2,
              strokeColor: '#10B981',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        )}

        {/* Silgiyle çizilen alanı göster */}
        {/* No freehand erasing, so no preview polygon needed */}
      </GoogleMap>

      {/* System Summary Panel */}
      {showSystemSummary && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">🗺️ Bölge Sistemi</h4>
            <button
              onClick={() => setShowSystemSummary(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
              title="Gizle"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>Mağaza: {stores.filter(s => s.serviceArea).length}/{stores.length}</div>
            <div>Müşteri: {customers.length}</div>
            <div>Uygulama: {serviceAreas.length}</div>
            <div>Kurye: {courierZones.length}</div>
            <div>Blok: {customerBlockAreas.length}</div>
            <div>Aktif Kurye: {couriers.filter(c => c.status === 'online').length}/{couriers.length}</div>
          </div>
        </div>
      )}

      {/* Filter Controls Panel */}
      {showFilters && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">🔍 Filtreler</h4>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
              title="Gizle"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showStores"
                checked={filters.showStores}
                onChange={(e) => setFilters(prev => ({ ...prev, showStores: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showStores" className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Mağazalar ({stores.length})</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCustomers"
                checked={filters.showCustomers}
                onChange={(e) => setFilters(prev => ({ ...prev, showCustomers: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="showCustomers" className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Müşteriler ({customers.length})</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCouriers"
                checked={filters.showCouriers}
                onChange={(e) => setFilters(prev => ({ ...prev, showCouriers: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="showCouriers" className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Kuryeler ({couriers.length})</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showServiceAreas"
                checked={filters.showServiceAreas}
                onChange={(e) => setFilters(prev => ({ ...prev, showServiceAreas: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="showServiceAreas" className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full opacity-30"></span>
                <span>Hizmet Bölgeleri ({serviceAreas.length})</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCourierZones"
                checked={filters.showCourierZones}
                onChange={(e) => setFilters(prev => ({ ...prev, showCourierZones: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="showCourierZones" className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full opacity-20"></span>
                <span>Kurye Bölgeleri ({courierZones.length})</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCustomerBlocks"
                checked={filters.showCustomerBlocks}
                onChange={(e) => setFilters(prev => ({ ...prev, showCustomerBlocks: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="showCustomerBlocks" className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-2 h-2 bg-red-500 rounded-full opacity-40"></span>
                <span>Blok Bölgeleri ({customerBlockAreas.length})</span>
              </label>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setFilters({
                  showStores: true,
                  showCustomers: true,
                  showCouriers: true,
                  showServiceAreas: true,
                  showCourierZones: true,
                  showCustomerBlocks: true,
                })}
                className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Tümünü Göster
              </button>
            </div>
            <div className="pt-1">
              <button
                onClick={() => setFilters({
                  showStores: false,
                  showCustomers: false,
                  showCouriers: false,
                  showServiceAreas: false,
                  showCourierZones: false,
                  showCustomerBlocks: false,
                })}
                className="w-full px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
              >
                Tümünü Gizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Service Controls - Only show for store-service mode */}
      {activeMode === 'store-service' && selectedStore && (
        <div className="absolute top-32 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {selectedStore?.name} - Hizmet Bölgesi
          </h3>

          {!drawingMode && !editMode ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Mağaza marker'ına tıklayarak düzenleme moduna geçin
              </div>
              {selectedStore?.serviceArea && (
                <div className="space-y-2">
                  <button
                    onClick={() => selectedStore && onServiceAreaUpdate(selectedStore.id, undefined)}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                  >
                    Bölgeyi Temizle
                  </button>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {selectedStore?.serviceArea?.polygon ? 'Çokgen bölgesi tanımlı' : 'Daire bölgesi tanımlı'}
                  </div>
                </div>
              )}
            </div>
          ) : editMode ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Hizmet Bölgesi Düzenleme
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yarıçap (km)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={circleRadius}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value >= 0.1 && value <= 50) {
                      setCircleRadius(value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Örn: 2.5"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  0.1 - 50 km arası değer girin
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveServiceArea}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                >
                  Kaydet
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
                >
                  İptal
                </button>
              </div>
              {selectedStore?.serviceArea && (
                <button
                  onClick={() => {
                    if (selectedStore) {
                      onServiceAreaUpdate(selectedStore.id, undefined);
                    }
                    setEditMode(false);
                  }}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                >
                  Bölgeyi Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Haritada merkezi tıklayın (ESC ile iptal)
              </div>
              <button
                onClick={cancelDrawing}
                className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
              >
                İptal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Courier Controls - Only show for courier-zones mode */}
      {activeMode === 'courier-zones' && (
        <div className="absolute top-32 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            🚚 Kurye Teslimat Bölgeleri
          </h3>

          <div className="space-y-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Kuryelerin paket teslimat mesafelerini belirleyin
            </div>

            {/* Zone Settings */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tek Paket Mesafesi (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={courierZoneSettings.singlePackageRadius / 1000}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value >= 1 && value <= 20) {
                      setCourierZoneSettings(prev => ({ ...prev, singlePackageRadius: value * 1000 }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Çoklu Paket Mesafesi (km)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  step="1"
                  value={courierZoneSettings.multiPackageRadius / 1000}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value >= 5 && value <= 50) {
                      setCourierZoneSettings(prev => ({ ...prev, multiPackageRadius: value * 1000 }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Teslimat Mesafesi (km)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="5"
                  value={courierZoneSettings.maxDeliveryKm}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value >= 10 && value <= 100) {
                      setCourierZoneSettings(prev => ({ ...prev, maxDeliveryKm: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableNotifications"
                  checked={courierZoneSettings.enableNotifications}
                  onChange={(e) => setCourierZoneSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="enableNotifications" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Yakınlık Bildirimleri
                </label>
              </div>
            </div>

            {/* Courier Zones List */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Tanımlı Kurye Bölgeleri</h4>
              {courierZones.map((zone) => (
                <div key={zone.id} className={`p-2 rounded-md border ${selectedCourierZoneId === zone.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      ></div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{zone.name}</span>
                    </div>
                    <button
                      onClick={() => deleteCourierZone(zone.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Tek: {(zone.singlePackageRadius / 1000).toFixed(1)}km | Çoklu: {(zone.multiPackageRadius / 1000).toFixed(1)}km
                  </div>
                  <div className="text-xs text-gray-500">
                    Max: {zone.maxDeliveryKm || 25}km | Bildirim: {zone.enableNotifications ? '✅' : '❌'}
                  </div>
                  {selectedCourierZoneId === zone.id && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => updateCourierZone(zone.id, { name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Bölge adı"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Tek Paket</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            step="0.5"
                            value={zone.singlePackageRadius / 1000}
                            onChange={(e) => updateCourierZone(zone.id, { singlePackageRadius: parseFloat(e.target.value) * 1000 })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Çoklu Paket</label>
                          <input
                            type="number"
                            min="5"
                            max="50"
                            step="1"
                            value={zone.multiPackageRadius / 1000}
                            onChange={(e) => updateCourierZone(zone.id, { multiPackageRadius: parseFloat(e.target.value) * 1000 })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Mesafe</label>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            step="5"
                            value={zone.maxDeliveryKm || 25}
                            onChange={(e) => updateCourierZone(zone.id, { maxDeliveryKm: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={zone.enableNotifications ?? true}
                            onChange={(e) => updateCourierZone(zone.id, { enableNotifications: e.target.checked })}
                            className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                          />
                          <label className="text-xs text-gray-600 dark:text-gray-400">Bildirim</label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Proximity Analysis */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">📊 Yakınlık Analizi</h4>
              
              {/* Active Couriers */}
              {couriers.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">Aktif Kuryeler</h5>
                  {couriers.map((courier) => (
                    <div key={courier.id} className="flex items-center justify-between text-xs p-1 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-gray-600 dark:text-gray-400">{courier.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          courier.status === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          courier.status === 'busy' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {courier.status}
                        </span>
                        <button
                          onClick={() => checkCourierProximity(courier)}
                          className="text-blue-500 hover:text-blue-700 text-xs"
                          title="Yakınlık kontrolü"
                        >
                          🔍
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourierId(selectedCourierId === courier.id ? null : courier.id);
                            setShowCourierHistory(selectedCourierId !== courier.id);
                          }}
                          className={`text-xs ${selectedCourierId === courier.id ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                          title="Konum geçmişi"
                        >
                          📍
                        </button>
                        <button
                          onClick={() => {
                            if (locationUpdateInterval) {
                              stopLocationTracking();
                            } else {
                              startLocationTracking(courier.id);
                            }
                          }}
                          className={`text-xs ${locationUpdateInterval ? 'text-red-500' : 'text-green-500 hover:text-green-700'}`}
                          title={locationUpdateInterval ? 'Takibi durdur' : 'Takibi başlat'}
                        >
                          {locationUpdateInterval ? '⏹️' : '▶️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {proximityAnalysis.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {proximityAnalysis.map((analysis) => (
                    <div key={analysis.courierZone.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {analysis.courierZone.name}
                      </div>
                      <div className="space-y-1">
                        {analysis.nearbyStores.slice(0, 3).map((storeAnalysis, index) => (
                          <div key={storeAnalysis.store.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400 truncate max-w-24">
                              {storeAnalysis.store.name}
                            </span>
                            <div className="flex items-center space-x-1">
                              <span className={`px-1 py-0.5 rounded text-xs ${
                                storeAnalysis.withinSinglePackage 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : storeAnalysis.withinMultiPackage
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {(storeAnalysis.distance / 1000).toFixed(1)}km
                              </span>
                            </div>
                          </div>
                        ))}
                        {analysis.nearbyStores.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{analysis.nearbyStores.length - 3} mağaza daha...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 text-center py-2">
                  Kurye bölgesi oluşturun
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Customer Block Controls - Only show for customer-block mode */}
      {activeMode === 'customer-block' && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            🚫 Müşteri Blok Bölgeleri
          </h3>

          <div className="space-y-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Kuryelerin teslimat yapamayacağı bölgeleri belirleyin
            </div>

            {/* Customer Block Areas List */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Tanımlı Blok Bölgeleri</h4>
              {customerBlockAreas.map((area) => (
                <div key={area.id} className={`p-2 rounded-md border ${selectedCustomerBlockAreaId === area.id ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: area.color }}
                      ></div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{area.name}</span>
                    </div>
                    <button
                      onClick={() => deleteCustomerBlockArea(area.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {area.polygon.length} köşe noktası
                  </div>
                  {selectedCustomerBlockAreaId === area.id && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => updateCustomerBlockArea(area.id, { name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-red-500 focus:border-transparent"
                        placeholder="Bölge adı"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Haritada tıklayarak yeni blok bölgesi oluşturun
            </div>
          </div>
        </div>
      )}

      {/* App Service Toolbar - Show when editing a region but not drawing */}
      {activeMode === 'app-service' && editingRegionId && !drawingPolygon && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="text-xs font-medium text-gray-900 dark:text-white mr-2">
              Düzenleme Araçları
            </div>
            <button
              onClick={() => startPolygonDrawing(editingRegionId!)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              title="Çokgen Çiz"
            >
              ✏️
            </button>
            <button
              onClick={() => setBlockMode((prev) => !prev)}
              className={`p-2 ${blockMode ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'} hover:bg-purple-700 text-white rounded-md transition-colors`}
              title="Blok Modu"
            >
              🟦
            </button>
            {blockMode && blocks.length > 0 && (
              <button
                onClick={saveBlocksAsPolygon}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                title="Blokları Kaydet"
              >
                �
              </button>
            )}
            <button
              onClick={() => {
                if (onCancelServiceArea) {
                  onCancelServiceArea(editingRegionId);
                }
              }}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              title="İptal"
            >
              ❌
            </button>
          </div>
          {blockMode && (
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
              Blok modu aktif: Haritada tıklayarak daire blokları oluşturun. Shift tuşu ile büyük blok oluşturun. Blokları sürükleyip sağ tıklayarak silebilirsiniz.
              {blocks.length > 0 && (
                <div className="mt-1">
                  Blok sayısı: {blocks.length} | Toplam alan: {calculateBlocksTotalArea().toFixed(2)} km²
                </div>
              )}
              {selectedBlockId && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seçili Blok Yarıçapı (metre)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    step="50"
                    value={blocks.find(b => b.id === selectedBlockId)?.radius || 300}
                    onChange={(e) => {
                      const newRadius = parseInt(e.target.value);
                      if (newRadius >= 50 && newRadius <= 2000) {
                        setBlocks(prev => prev.map(b =>
                          b.id === selectedBlockId
                            ? { ...b, radius: newRadius }
                            : b
                        ));
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Panel Toggle Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        {!showSystemSummary && (
          <button
            onClick={() => setShowSystemSummary(true)}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg shadow-lg p-2 transition-colors"
            title="Sistem Özeti Göster"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        )}
        
        {!showFilters && (
          <button
            onClick={() => setShowFilters(true)}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg shadow-lg p-2 transition-colors"
            title="Filtreler Göster"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        )}
        
        {!showLegend && (
          <button
            onClick={() => setShowLegend(true)}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg shadow-lg p-2 transition-colors"
            title="Lejant Göster"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}