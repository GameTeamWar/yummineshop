'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteField, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/panels/layout';
import ServiceAreaMap from '@/components/admin/ServiceAreaMap';
import StoreSidebar from '@/components/admin/StoreSidebar';

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
    radius: number; // in meters
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

export default function ServiceAreaPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stores' | 'couriers' | 'customers' | 'zones'>('stores');

  // Data states
  const [stores, setStores] = useState<Store[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Selection states
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Map states
  const [activeMode, setActiveMode] = useState<'store-service' | 'app-service' | 'courier-zones' | 'customer-block' | 'map-center'>('store-service');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 41.0082, lng: 28.9784 });

  // Zone states
  const [serviceAreas, setServiceAreas] = useState<{ id: string; name: string; color: string; polygon: { lat: number; lng: number }[]; editing?: boolean }[]>([]);
  const [courierZones, setCourierZones] = useState<{ id: string; name: string; center: { lat: number; lng: number }; singlePackageRadius: number; multiPackageRadius: number; color: string; maxDeliveryKm?: number; enableNotifications?: boolean }[]>([]);
  const [customerBlockAreas, setCustomerBlockAreas] = useState<{ id: string; name: string; polygon: { lat: number; lng: number }[]; color: string }[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user || role !== 0) {
      router.push('/');
      return;
    }

    fetchAllData();
  }, [user, role, router]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch stores
      const storesSnapshot = await getDocs(collection(db, 'stores'));
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Store));
      setStores(storesData);

      // Fetch couriers
      const couriersSnapshot = await getDocs(collection(db, 'couriers'));
      const couriersData = couriersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Courier));
      setCouriers(couriersData);

      // Fetch customers
      const customersSnapshot = await getDocs(collection(db, 'customers'));
      const customersData = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Customer));
      setCustomers(customersData);

      // Fetch zones
      await fetchZones();

      setLoading(false);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Veriler yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      // Fetch service areas
      const serviceAreasSnapshot = await getDocs(collection(db, 'serviceAreas'));
      const serviceAreasData = serviceAreasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as typeof serviceAreas;
      setServiceAreas(serviceAreasData);

      // Fetch courier zones
      const courierZonesSnapshot = await getDocs(collection(db, 'courierZones'));
      const courierZonesData = courierZonesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as typeof courierZones;
      setCourierZones(courierZonesData);

      // Fetch customer block areas
      const customerBlocksSnapshot = await getDocs(collection(db, 'customerBlockAreas'));
      const customerBlocksData = customerBlocksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as typeof customerBlockAreas;
      setCustomerBlockAreas(customerBlocksData);
    } catch (error) {
      console.error('Bölge verileri yükleme hatası:', error);
    }
  };

  // Filtered data based on search and filters
  const getFilteredData = () => {
    switch (activeTab) {
      case 'stores':
        return stores.filter(store => {
          const matchesSearch = !searchTerm ||
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus = statusFilter === 'all' || store.status === statusFilter;

          return matchesSearch && matchesStatus;
        });

      case 'couriers':
        return couriers.filter(courier => {
          const matchesSearch = !searchTerm ||
            courier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courier.phone?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus = statusFilter === 'all' || courier.status === statusFilter;

          return matchesSearch && matchesStatus;
        });

      case 'customers':
        return customers.filter(customer => {
          const matchesSearch = !searchTerm ||
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

          return matchesSearch && matchesStatus;
        });

      default:
        return [];
    }
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    setSelectedCourier(null);
    setSelectedCustomer(null);
    setActiveMode('store-service');
  };

  const handleCourierSelect = (courier: Courier) => {
    setSelectedCourier(courier);
    setSelectedStore(null);
    setSelectedCustomer(null);
    setActiveMode('courier-zones');
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedStore(null);
    setSelectedCourier(null);
    setActiveMode('customer-block');
  };

  const handleServiceAreaUpdate = async (storeId: string, serviceArea: Store['serviceArea']) => {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (serviceArea === undefined) {
        updateData.serviceArea = deleteField();
      } else {
        updateData.serviceArea = serviceArea;
      }

      await updateDoc(doc(db, 'stores', storeId), updateData);

      // Update local state
      setStores(prevStores =>
        prevStores.map(store =>
          store.id === storeId ? { ...store, serviceArea } : store
        )
      );

      if (selectedStore && selectedStore.id === storeId) {
        setSelectedStore(prev => prev ? { ...prev, serviceArea } : null);
      }

      toast.success(serviceArea === undefined ? 'Hizmet bölgesi kaldırıldı' : 'Hizmet bölgesi güncellendi');
    } catch (error) {
      console.error('Hizmet bölgesi güncellenirken hata:', error);
      toast.error('Hizmet bölgesi güncellenirken hata oluştu');
    }
  };

  const handleCourierZoneUpdate = async (zones: typeof courierZones) => {
    try {
      // Update Firebase
      for (const zone of zones) {
        if (zone.id.startsWith('courier-zone-')) {
          // New zone - use setDoc with custom ID
          await setDoc(doc(db, 'courierZones', zone.id), {
            ...zone,
            createdAt: new Date(),
          });
        } else {
          // Update existing
          await updateDoc(doc(db, 'courierZones', zone.id), {
            ...zone,
            updatedAt: new Date(),
          });
        }
      }

      setCourierZones(zones);
      toast.success('Kurye bölgeleri güncellendi');
    } catch (error) {
      console.error('Kurye bölgeleri güncellenirken hata:', error);
      toast.error('Kurye bölgeleri güncellenirken hata oluştu');
    }
  };

  const handleCustomerBlockAreaUpdate = async (areas: typeof customerBlockAreas) => {
    try {
      // Update Firebase
      for (const area of areas) {
        if (area.id.startsWith('customer-block-')) {
          // New area - use setDoc with custom ID
          await setDoc(doc(db, 'customerBlockAreas', area.id), {
            ...area,
            createdAt: new Date(),
          });
        } else {
          // Update existing
          await updateDoc(doc(db, 'customerBlockAreas', area.id), {
            ...area,
            updatedAt: new Date(),
          });
        }
      }

      setCustomerBlockAreas(areas);
      toast.success('Müşteri blok bölgeleri güncellendi');
    } catch (error) {
      console.error('Müşteri blok bölgeleri güncellenirken hata:', error);
      toast.error('Müşteri blok bölgeleri güncellenirken hata oluştu');
    }
  };

  // Zone management functions
  const handleCreateServiceArea = async () => {
    const newId = Date.now().toString();
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newArea = {
      id: newId,
      name: `Yeni Bölge ${serviceAreas.length + 1}`,
      color: randomColor,
      polygon: [],
      editing: true
    };

    try {
      await setDoc(doc(db, 'serviceAreas', newId), {
        ...newArea,
        createdAt: new Date(),
      });

      setServiceAreas(prev => [...prev, newArea]);
      toast.success('Yeni hizmet bölgesi oluşturuldu');
    } catch (error) {
      console.error('Hizmet bölgesi oluşturulurken hata:', error);
      toast.error('Hizmet bölgesi oluşturulurken hata oluştu');
    }
  };

  const handleSaveServiceArea = async (id: string) => {
    const area = serviceAreas.find(a => a.id === id);
    if (!area) return;

    try {
      await updateDoc(doc(db, 'serviceAreas', id), {
        ...area,
        editing: false,
        updatedAt: new Date(),
      });

      setServiceAreas(prev => prev.map(a =>
        a.id === id ? { ...a, editing: false } : a
      ));
      toast.success('Hizmet bölgesi kaydedildi');
    } catch (error) {
      console.error('Hizmet bölgesi kaydedilirken hata:', error);
      toast.error('Hizmet bölgesi kaydedilirken hata oluştu');
    }
  };

  const handleCancelServiceArea = (id: string) => {
    setServiceAreas(prev => prev.map(area =>
      area.id === id ? { ...area, editing: false } : area
    ));
  };

  const handleDeleteServiceArea = async (id: string) => {
    try {
      await updateDoc(doc(db, 'serviceAreas', id), {
        deleted: true,
        deletedAt: new Date(),
      });

      setServiceAreas(prev => prev.filter(area => area.id !== id));
      toast.success('Hizmet bölgesi silindi');
    } catch (error) {
      console.error('Hizmet bölgesi silinirken hata:', error);
      toast.error('Hizmet bölgesi silinirken hata oluştu');
    }
  };

  const handleUpdateServiceAreaName = async (id: string, name: string) => {
    try {
      await updateDoc(doc(db, 'serviceAreas', id), {
        name,
        updatedAt: new Date(),
      });

      setServiceAreas(prev => prev.map(area =>
        area.id === id ? { ...area, name } : area
      ));
    } catch (error) {
      console.error('Bölge adı güncellenirken hata:', error);
    }
  };

  const handleUpdateServiceAreaColor = async (id: string, color: string) => {
    try {
      await updateDoc(doc(db, 'serviceAreas', id), {
        color,
        updatedAt: new Date(),
      });

      setServiceAreas(prev => prev.map(area =>
        area.id === id ? { ...area, color } : area
      ));
    } catch (error) {
      console.error('Bölge rengi güncellenirken hata:', error);
    }
  };

  const handleRegionUpdate = async (id: string, updates: Partial<{ polygon: { lat: number; lng: number }[] }>) => {
    try {
      await updateDoc(doc(db, 'serviceAreas', id), {
        ...updates,
        updatedAt: new Date(),
      });

      setServiceAreas(prev => prev.map(area =>
        area.id === id ? { ...area, ...updates } : area
      ));
    } catch (error) {
      console.error('Bölge güncellenirken hata:', error);
    }
  };

  if (!user || role !== 0) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Veriler yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const filteredData = getFilteredData();

  return (
    <AdminLayout>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hizmet Bölgesi Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Mağaza, kurye ve müşteri konumlarını yönetin
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Statistics */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Mağaza: <span className="font-semibold text-gray-900 dark:text-white">{stores.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Kurye: <span className="font-semibold text-gray-900 dark:text-white">{couriers.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Müşteri: <span className="font-semibold text-gray-900 dark:text-white">{customers.length}</span>
                  </span>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAllData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Yenile</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6">
            {[
              { id: 'stores', label: 'Mağazalar', icon: '🏪', count: stores.length },
              { id: 'couriers', label: 'Kuryeler', icon: '🚚', count: couriers.length },
              { id: 'customers', label: 'Müşteriler', icon: '👥', count: customers.length },
              { id: 'zones', label: 'Bölgeler', icon: '🗺️', count: serviceAreas.length + courierZones.length + customerBlockAreas.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <StoreSidebar
            activeTab={activeTab}
            data={filteredData}
            selectedStore={selectedStore}
            selectedCourier={selectedCourier}
            selectedCustomer={selectedCustomer}
            onStoreSelect={handleStoreSelect}
            onCourierSelect={handleCourierSelect}
            onCustomerSelect={handleCustomerSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            activeMode={activeMode}
            onModeChange={setActiveMode}
            serviceAreas={serviceAreas}
            onCreateServiceArea={handleCreateServiceArea}
            onSaveServiceArea={handleSaveServiceArea}
            onCancelServiceArea={handleCancelServiceArea}
            onDeleteServiceArea={handleDeleteServiceArea}
            onUpdateServiceAreaName={handleUpdateServiceAreaName}
            onUpdateServiceAreaColor={handleUpdateServiceAreaColor}
          />

          {/* Map Container */}
          <div className="flex-1 relative">
            <ServiceAreaMap
              stores={stores}
              selectedStore={selectedStore}
              onServiceAreaUpdate={handleServiceAreaUpdate}
              activeMode={activeMode}
              mapCenter={mapCenter}
              onMapCenterChange={setMapCenter}
              serviceAreas={serviceAreas}
              onCreateServiceArea={handleCreateServiceArea}
              onSaveServiceArea={handleSaveServiceArea}
              onCancelServiceArea={handleCancelServiceArea}
              onDeleteServiceArea={handleDeleteServiceArea}
              onUpdateServiceAreaName={handleUpdateServiceAreaName}
              onUpdateServiceAreaColor={handleUpdateServiceAreaColor}
              onRegionUpdate={handleRegionUpdate}
              courierZones={courierZones}
              onCourierZoneUpdate={handleCourierZoneUpdate}
              customerBlockAreas={customerBlockAreas}
              onCustomerBlockAreaUpdate={handleCustomerBlockAreaUpdate}
              couriers={couriers}
              onCourierUpdate={(updatedCouriers: Courier[]) => setCouriers(updatedCouriers)}
              customers={customers}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}