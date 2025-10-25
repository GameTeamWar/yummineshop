import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, Navigation, Minus, Plus, Filter, LogOut, Play, Shield, ShoppingCart, Users, Edit, Trash2 } from 'lucide-react';
import { IoIosNotifications, IoIosHome } from 'react-icons/io';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useLoadScript, GoogleMap } from '@react-google-maps/api';
import AddAddressModal from '../modals/AddAddressModal';
import EditAddressModal from '../modals/EditAddressModal';
import CartSidebar from '../cart/cart';
import ModeToggle from '../ui/ModeToggle';

// Google Maps libraries - static array to prevent re-renders
const GOOGLE_MAPS_LIBRARIES: ("places" | "geocoding")[] = ['places', 'geocoding'];

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promotion';
  read: boolean;
  createdAt: Date;
}

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  heroMode: string;
  setHeroMode: (mode: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  cartSidebarOpen: boolean;
  setCartSidebarOpen: (open: boolean) => void;
  showAddAddressModal: boolean;
  setShowAddAddressModal: (show: boolean) => void;
  showHowItWorksModal: boolean;
  setShowHowItWorksModal: (show: boolean) => void;
  isMobile: boolean;
  cart?: any[];
  cartTotal?: number;
  setCart?: (cart: any[]) => void;
  setCartTotal?: (total: number) => void;
  cartItemCount?: number;
  addToCart?: (productId: string) => void;
  removeFromCart?: (productId: string) => void;
  clearCart?: () => void;
  deleteItemFromCart?: (productId: string) => void;
}

export default function Header({
  darkMode,
  setDarkMode,
  heroMode,
  setHeroMode,
  searchQuery,
  setSearchQuery,
  cartSidebarOpen,
  setCartSidebarOpen,
  showAddAddressModal,
  setShowAddAddressModal,
  showHowItWorksModal,
  setShowHowItWorksModal,
  isMobile,
  cart = [],
  cartTotal = 0,
  setCart,
  setCartTotal,
  cartItemCount = 0,
  addToCart,
  removeFromCart,
  clearCart,
  deleteItemFromCart
}: HeaderProps) {
  const [selectedAddress, setSelectedAddress] = useState('Adres Ekleyin');
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddressName, setNewAddressName] = useState('');
  const [newAddressStreet, setNewAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressBuildingNumber, setAddressBuildingNumber] = useState('');
  const [addressApartment, setAddressApartment] = useState('');
  const [addressFloor, setAddressFloor] = useState('');
  const [addressHasElevator, setAddressHasElevator] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Siparişiniz Hazırlandı',
      message: 'Siparişiniz #12345 hazırlanıp yola çıkarıldı.',
      type: 'order',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2',
      title: 'Yeni Kampanya!',
      message: 'Seçili ürünlerde %20 indirim fırsatı kaçırmayın!',
      type: 'promotion',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: '3',
      title: 'Hesap Güvenliği',
      message: 'Hesabınızın güvenliği için şifrenizi güncelleyin.',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: '4',
      title: 'Sipariş Teslim Edildi',
      message: 'Siparişiniz #12344 başarıyla teslim edildi.',
      type: 'order',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    }
  ];

  // Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Reverse geocoding function
  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const addressComponents = results[0].address_components;

        // Extract address components
        let city = '';
        let district = '';
        let neighborhood = '';
        let street = '';

        addressComponents.forEach((component: any) => {
          const types = component.types;
          console.log('Address component:', component.long_name, 'Types:', types);

          if (types.includes('administrative_area_level_1')) {
            city = component.long_name; // İl
          } else if (types.includes('administrative_area_level_2')) {
            district = component.long_name; // İlçe
          } else if (types.includes('sublocality') ||
                    types.includes('neighborhood') ||
                    types.includes('sublocality_level_1') ||
                    types.includes('sublocality_level_2') ||
                    types.includes('sublocality_level_3') ||
                    types.includes('sublocality_level_4') ||
                    types.includes('sublocality_level_5') ||
                    types.includes('locality') ||
                    (types.includes('political') && !types.includes('administrative_area_level_1') && !types.includes('administrative_area_level_2'))) {
            // Mahalle için daha geniş arama - political type ile birlikte gelen mahalle bilgileri
            if (!neighborhood && component.long_name !== city && component.long_name !== district) {
              neighborhood = component.long_name;
            }
          } else if (types.includes('route')) {
            street = component.long_name; // Cadde/Sokak
          }
        });

        // Eğer mahalle bulunamadıysa, sokak adından çıkarabiliriz (bazı durumlarda)
        if (!neighborhood && street) {
          // Sokak adından mahalle çıkar (örneğin "Atatürk Mahallesi" içinden "Atatürk" çıkar)
          const mahalleMatch = street.match(/(.+?)\s+Mahallesi|\s+Mah\.|\s+Mh\./i);
          if (mahalleMatch) {
            neighborhood = mahalleMatch[1].trim();
          }
        }

        // Update form fields
        setAddressCity(city || '');
        setAddressDistrict(district || '');
        setAddressNeighborhood(neighborhood || '');
        setAddressStreet(street || '');

        console.log('Reverse geocoding result:', { city, district, neighborhood, street });
      } else {
        console.error('Geocoder failed:', status);
        // Fallback to default values if geocoding fails
        setAddressCity('İstanbul');
        setAddressDistrict('Kadıköy');
        setAddressNeighborhood('');
        setAddressStreet('');
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressDropdownOpen && !(event.target as Element).closest('.address-dropdown')) {
        setAddressDropdownOpen(false);
      }
      if (userDropdownOpen && !(event.target as Element).closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
      if (notificationsOpen && !(event.target as Element).closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
      if (authDropdownOpen && !(event.target as Element).closest('.auth-dropdown')) {
        setAuthDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addressDropdownOpen, userDropdownOpen, notificationsOpen, authDropdownOpen, cartSidebarOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            // Load addresses from user data
            if (data.addresses && data.addresses.length > 0) {
              setAddresses(data.addresses);
              // Set first address as selected
              const firstAddress = data.addresses[0];
              const shortNeighborhood = firstAddress.neighborhood && firstAddress.neighborhood.length > 15 
                ? firstAddress.neighborhood.substring(0, 15) + '...' 
                : firstAddress.neighborhood || '';
              setSelectedAddress(`${firstAddress.name} (${shortNeighborhood})`);
            } else {
              // No addresses exist
              setAddresses([]);
              setSelectedAddress('Adres Ekleyin');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setAddresses([]);
      }
    };
    fetchUserData();
  }, [user]);

  // Load notifications
  useEffect(() => {
    if (user) {
      // In a real app, this would fetch from API
      setNotifications(mockNotifications);
      setNotificationCount(mockNotifications.filter(n => !n.read).length);
    } else {
      setNotifications([]);
      setNotificationCount(0);
    }
  }, [user]);

  return (
    <>
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-b shadow-lg`}>
        <div className="w-full mx-auto px-4 py-3">
          {isMobile ? (
            // Mobile Header: Logo, address, and dark mode toggle
            <div className="flex items-center justify-between relative">
              {/* Sol: Logo */}
              <div className="flex items-center">
                <span className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Yummine</span>
              </div>

              {/* Sağ: Home, Notifications, Cart, User Menu, Address, Dark Mode Toggle */}
              <div className="flex items-center gap-1">
                {/* Home Button - Mobile */}
                <button
                  onClick={() => router.push('/')}
                  className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  <IoIosHome className="w-4 h-4" />
                </button>

                {/* Notifications Button - Mobile */}
                {user && (
                  <div className="relative notifications-dropdown">
                    <button
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 relative ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                      <IoIosNotifications className="w-4 h-4" />
                      {/* Bildirim sayısı badge'i (dinamik) */}
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                          {notificationCount}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bildirimler</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b transition-colors duration-200 ${
                                  notification.read
                                    ? `${darkMode ? 'border-neutral-700 hover:bg-gray-700' : 'border-neutral-200 hover:bg-gray-50'}`
                                    : `${darkMode ? 'border-neutral-700 bg-blue-900/20 hover:bg-blue-900/30' : 'border-neutral-200 bg-blue-50 hover:bg-blue-100'}`
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                    notification.type === 'order' ? 'bg-green-500' :
                                    notification.type === 'promotion' ? 'bg-orange-500' : 'bg-blue-500'
                                  }`} />
                                  <div className="flex-1">
                                    <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {notification.title}
                                    </h4>
                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                      {notification.message}
                                    </p>
                                    <span className={`text-xs mt-2 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {new Date(notification.createdAt).toLocaleString('tr-TR', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <IoIosNotifications className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>Henüz bildirim yok</p>
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className={`p-4 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                            <button
                              onClick={() => {
                                setNotifications(notifications.map(n => ({ ...n, read: true })));
                                setNotificationCount(0);
                              }}
                              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                darkMode
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              Tümünü Okundu İşaretle
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Cart Button - Mobile */}
                {user && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCartSidebarOpen(!cartSidebarOpen); }}
                    className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 relative ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {/* Sepet sayısı badge'i (dinamik) */}
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                )}

                {/* User Menu Button - Mobile */}
                {user ? (
                  <div className="relative user-dropdown">
                    <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}>
                      <User className="w-4 h-4" />
                    </button>

                    {userDropdownOpen && (
                      <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                        <button onClick={() => router.push('/store/myaccount')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Hesabım
                          </div>
                        </button>
                        <button onClick={() => router.push('/store/myaccount/orders')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Siparişlerim
                          </div>
                        </button>
                        <button onClick={() => router.push('/store/myaccount/favorites')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Favorilerim
                          </div>
                        </button>
                        <button onClick={() => router.push('/store/myaccount/addresses')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Adreslerim
                          </div>
                        </button>
                        <button onClick={() => router.push('/store/myaccount/deliveries')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Teslimatlarım
                          </div>
                        </button>
                        <button onClick={logout} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 last:rounded-b-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Çıkış Yap
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => router.push('/auth/login?type=customer')} className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}>
                    <User className="w-4 h-4" />
                  </button>
                )}

                {/* Address Selection Button - Mobile */}
                {user && (
                  <div className="relative address-dropdown">
                    <button onClick={() => setAddressDropdownOpen(!addressDropdownOpen)} className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-400 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-white'}`}>
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-medium max-w-16 truncate">{selectedAddress.split(' (')[0]}</span>
                    </button>

                    {addressDropdownOpen && (
                      <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                        {addresses.map((address, index) => {
                          const shortNeighborhood = address.neighborhood && address.neighborhood.length > 15
                            ? address.neighborhood.substring(0, 15) + '...'
                            : address.neighborhood || '';

                          const displayString = `${address.name} (${shortNeighborhood})`;
                          const isSelected = displayString === selectedAddress;

                          return (
                            <div key={address.id || index} className={`px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${isSelected ? (darkMode ? 'bg-blue-900/50 border-l-4 border-blue-400' : 'bg-blue-50 border-l-4 border-blue-500') : ''}`}>
                              <div className="flex items-center justify-between">
                                <button onClick={() => {
                                  setSelectedAddress(displayString);
                                  setAddressDropdownOpen(false);
                                }} className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    {isSelected && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                    <div className="font-medium">{address.name}</div>
                                  </div>
                                  <div className={`text-sm ml-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{address.street}</div>
                                </button>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingAddress(address);
                                      setNewAddressName(address.name);
                                      setNewAddressStreet(address.additionalInfo || '');
                                      setAddressCity(address.city);
                                      setAddressDistrict(address.district);
                                      setAddressNeighborhood(address.neighborhood);
                                      setAddressStreet(address.streetName);
                                      setAddressBuildingNumber(address.buildingNumber);
                                      setAddressApartment(address.apartment);
                                      setAddressFloor(address.floor);
                                      setAddressHasElevator(address.hasElevator || false);
                                      setShowEditAddressModal(true);
                                      setAddressDropdownOpen(false);
                                    }}
                                    className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors ${darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-800'}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
                                        try {
                                          const updatedAddresses = addresses.filter((_, i) => i !== index);
                                          setAddresses(updatedAddresses);

                                          const userRef = doc(db, 'users', user.uid);
                                          await updateDoc(userRef, {
                                            addresses: updatedAddresses
                                          });

                                          if (isSelected) {
                                            if (updatedAddresses.length > 0) {
                                              const firstAddress = updatedAddresses[0];
                                              const shortNeighborhood = firstAddress.neighborhood && firstAddress.neighborhood.length > 15
                                                ? firstAddress.neighborhood.substring(0, 15) + '...'
                                                : firstAddress.neighborhood || '';
                                              setSelectedAddress(`${firstAddress.name} (${shortNeighborhood})`);
                                            } else {
                                              setSelectedAddress('Adres Ekleyin');
                                            }
                                          }
                                        } catch (error) {
                                          console.error('Error deleting address:', error);
                                        }
                                      }
                                    }}
                                    className={`p-1 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors ${darkMode ? 'text-neutral-400 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className={`border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                          <button onClick={() => { setShowAddAddressModal(true); setAddressDropdownOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 rounded-b-lg ${darkMode ? 'text-blue-400 hover:bg-neutral-700' : 'text-blue-600 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Adres Ekle
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dark Mode Toggle - Mobile */}
                <button onClick={() => setDarkMode(!darkMode)} className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}>
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            // Desktop Header: Full version
            <>
              <div className="flex items-center justify-between mb-3">
                {/* Sol: Logo */}
                <div className="flex items-center">
                  <div className="hidden sm:block ml-4">
                    <span className={`text-xl sm:text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Yummine</span>
                  </div>
                </div>

                {/* Orta: Mode Toggle - Compact Design */}
                {user && pathname === '/' && (
                  <ModeToggle
                    darkMode={darkMode}
                    heroMode={heroMode}
                    setHeroMode={setHeroMode}
                    user={user}
                  />
                )}

                {/* Sağ: Home, Notifications, Cart, User Menu, Address, Dark Mode Toggle */}
                <div className="flex items-center gap-1">
                  {/* Home Button - Desktop */}
                  <button
                    onClick={() => router.push('/')}
                    className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                    title="Ana Sayfa"
                  >
                    <IoIosHome className="w-4 h-4" />
                  </button>

                  {/* Notifications Button - Desktop */}
                  {user && (
                    <div className="relative notifications-dropdown">
                      <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 relative ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                        title="Bildirimler"
                      >
                        <IoIosNotifications className="w-4 h-4" />
                        {/* Bildirim sayısı badge'i (dinamik) */}
                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                            {notificationCount}
                          </span>
                        )}
                      </button>

                      {notificationsOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                          <div className={`p-4 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bildirimler</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`p-4 border-b transition-colors duration-200 ${
                                    notification.read
                                      ? `${darkMode ? 'border-neutral-700 hover:bg-gray-700' : 'border-neutral-200 hover:bg-gray-50'}`
                                      : `${darkMode ? 'border-neutral-700 bg-blue-900/20 hover:bg-blue-900/30' : 'border-neutral-200 bg-blue-50 hover:bg-blue-100'}`
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                      notification.type === 'order' ? 'bg-green-500' :
                                      notification.type === 'promotion' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`} />
                                    <div className="flex-1">
                                      <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {notification.title}
                                      </h4>
                                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {notification.message}
                                      </p>
                                      <span className={`text-xs mt-2 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(notification.createdAt).toLocaleString('tr-TR', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <IoIosNotifications className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Henüz bildirim yok</p>
                              </div>
                            )}
                          </div>
                          {notifications.length > 0 && (
                            <div className={`p-4 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                              <button
                                onClick={() => {
                                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                                  setNotificationCount(0);
                                }}
                                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                  darkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                              >
                                Tümünü Okundu İşaretle
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cart Button - Desktop */}
                  {user && (
                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCartSidebarOpen(!cartSidebarOpen); }}
                      className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 relative ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                      title="Sepet"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {/* Sepet sayısı badge'i (dinamik) */}
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* User Menu - Desktop */}
                  {user ? (
                    <div className="relative user-dropdown">
                      <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-400 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-white'}`}>
                        <User className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline max-w-20 truncate">
                          {userData?.firstName && userData?.lastName ? `${userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()}` : user?.displayName || user?.email?.split('@')[0] || 'User'}
                        </span>
                        <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${userDropdownOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {userDropdownOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                          <button onClick={() => router.push('/store/myaccount')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Hesabım
                            </div>
                          </button>
                          <button onClick={() => router.push('/store/myaccount/orders')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              Siparişlerim
                            </div>
                          </button>
                          <button onClick={() => router.push('/store/myaccount/favorites')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Favorilerim
                            </div>
                          </button>
                          <button onClick={() => router.push('/store/myaccount/addresses')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Adreslerim
                            </div>
                          </button>
                          <button onClick={() => router.push('/store/myaccount/deliveries')} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Teslimatlarım
                            </div>
                          </button>
                          <button onClick={logout} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 last:rounded-b-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4" />
                              Çıkış Yap
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative auth-dropdown">
                      <button onClick={() => setAuthDropdownOpen(!authDropdownOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-400 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-white'}`}>
                        <User className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline">Hesap</span>
                        <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${authDropdownOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {authDropdownOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                          {/* Customer Section */}
                          <div className="pb-2">
                            <button onClick={() => { router.push('/auth/register?type=customer'); setAuthDropdownOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-blue-300 hover:bg-blue-900/30' : 'text-blue-700 hover:bg-blue-50'} border-b border-blue-100 dark:border-blue-900/50`}>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">Kayıt Ol</span>
                              </div>
                            </button>
                            <button onClick={() => { router.push('/auth/login?type=customer'); setAuthDropdownOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 ${darkMode ? 'text-blue-300 hover:bg-blue-900/30' : 'text-blue-700 hover:bg-blue-50'}`}>
                              <div className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Giriş Yap</span>
                              </div>
                            </button>
                          </div>

                          {/* Separator */}
                          <div className={`h-px bg-linear-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent my-2`}></div>

                          {/* Partner Section */}
                          <div className="pt-2">
                            <button onClick={() => { router.push('/partners'); setAuthDropdownOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors duration-200 last:rounded-b-lg ${darkMode ? 'text-purple-300 hover:bg-purple-900/30' : 'text-purple-700 hover:bg-purple-50'} border-t border-purple-100 dark:border-purple-900/50`}>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">Partnerimiz Ol</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Address Selection Button - Desktop */}
                  {user && (
                    <div className="relative address-dropdown">
                      <button onClick={() => setAddressDropdownOpen(!addressDropdownOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-400 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-white'}`}>
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium hidden sm:inline max-w-24 truncate">{selectedAddress}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${addressDropdownOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {addressDropdownOpen && (
                        <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl border z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                          {addresses.map((address, index) => {
                            // Mahalle adını kısalt (15 karakterden fazla ise ... ekle)
                            const shortNeighborhood = address.neighborhood && address.neighborhood.length > 15 
                              ? address.neighborhood.substring(0, 15) + '...' 
                              : address.neighborhood || '';
                            
                            const displayString = `${address.name} (${shortNeighborhood})`;
                            const isSelected = displayString === selectedAddress;
                            
                            return (
                              <div key={address.id || index} className={`px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${isSelected ? (darkMode ? 'bg-blue-900/50 border-l-4 border-blue-400' : 'bg-blue-50 border-l-4 border-blue-500') : ''}`}>
                                <div className="flex items-center justify-between">
                                  <button onClick={() => { 
                                    setSelectedAddress(displayString); 
                                    setAddressDropdownOpen(false); 
                                  }} className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                      {isSelected && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                      <div className="font-medium">{address.name}</div>
                                    </div>
                                    <div className={`text-sm ml-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{address.street}</div>
                                  </button>
                                  <div className="flex items-center gap-1 ml-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingAddress(address);
                                        setNewAddressName(address.name);
                                        setNewAddressStreet(address.additionalInfo || '');
                                        setAddressCity(address.city);
                                        setAddressDistrict(address.district);
                                        setAddressNeighborhood(address.neighborhood);
                                        setAddressStreet(address.streetName);
                                        setAddressBuildingNumber(address.buildingNumber);
                                        setAddressApartment(address.apartment);
                                        setAddressFloor(address.floor);
                                        setAddressHasElevator(address.hasElevator || false);
                                        setShowEditAddressModal(true);
                                        setAddressDropdownOpen(false);
                                      }}
                                      className={`p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors ${darkMode ? 'text-neutral-400 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-800'}`}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
                                          try {
                                            const updatedAddresses = addresses.filter((_, i) => i !== index);
                                            setAddresses(updatedAddresses);
                                            
                                            // Update Firestore
                                            const userRef = doc(db, 'users', user.uid);
                                            await updateDoc(userRef, {
                                              addresses: updatedAddresses
                                            });
                                            
                                            // If deleted address was selected, update selection
                                            if (isSelected) {
                                              if (updatedAddresses.length > 0) {
                                                const firstAddress = updatedAddresses[0];
                                                const shortNeighborhood = firstAddress.neighborhood && firstAddress.neighborhood.length > 15 
                                                  ? firstAddress.neighborhood.substring(0, 15) + '...' 
                                                  : firstAddress.neighborhood || '';
                                                setSelectedAddress(`${firstAddress.name} (${shortNeighborhood})`);
                                              } else {
                                                setSelectedAddress('Adres Ekleyin');
                                              }
                                            }
                                          } catch (error) {
                                            console.error('Error deleting address:', error);
                                          }
                                        }
                                      }}
                                      className={`p-1 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors ${darkMode ? 'text-neutral-400 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div className={`border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                            <button onClick={() => { setShowAddAddressModal(true); setAddressDropdownOpen(false); }} className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 rounded-b-lg ${darkMode ? 'text-blue-400 hover:bg-neutral-700' : 'text-blue-600 hover:bg-neutral-50'}`}>
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Adres Ekle
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dark Mode Toggle - Desktop */}
                  <button onClick={() => setDarkMode(!darkMode)} className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}>
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar
        darkMode={darkMode}
        cartSidebarOpen={cartSidebarOpen}
        setCartSidebarOpen={setCartSidebarOpen}
        cart={cart}
        cartTotal={cartTotal}
        setCart={setCart}
        setCartTotal={setCartTotal}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        deleteItemFromCart={deleteItemFromCart}
      />

      {/* Add Address Modal */}
      <AddAddressModal
        darkMode={darkMode}
        showAddAddressModal={showAddAddressModal}
        setShowAddAddressModal={setShowAddAddressModal}
        isLoaded={isLoaded}
        reverseGeocode={reverseGeocode}
        newAddressName={newAddressName}
        setNewAddressName={setNewAddressName}
        addressCity={addressCity}
        setAddressCity={setAddressCity}
        addressDistrict={addressDistrict}
        setAddressDistrict={setAddressDistrict}
        addressNeighborhood={addressNeighborhood}
        setAddressNeighborhood={setAddressNeighborhood}
        addressStreet={addressStreet}
        setAddressStreet={setAddressStreet}
        addressBuildingNumber={addressBuildingNumber}
        setAddressBuildingNumber={setAddressBuildingNumber}
        addressApartment={addressApartment}
        setAddressApartment={setAddressApartment}
        addressFloor={addressFloor}
        setAddressFloor={setAddressFloor}
        addressHasElevator={addressHasElevator}
        setAddressHasElevator={setAddressHasElevator}
        newAddressStreet={newAddressStreet}
        setNewAddressStreet={setNewAddressStreet}
        addresses={addresses}
        setAddresses={setAddresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        user={user}
      />

      {/* Edit Address Modal */}
      <EditAddressModal
        darkMode={darkMode}
        showEditAddressModal={showEditAddressModal}
        setShowEditAddressModal={setShowEditAddressModal}
        editingAddress={editingAddress}
        setEditingAddress={setEditingAddress}
        isLoaded={isLoaded}
        reverseGeocode={reverseGeocode}
        newAddressName={newAddressName}
        setNewAddressName={setNewAddressName}
        addressCity={addressCity}
        setAddressCity={setAddressCity}
        addressDistrict={addressDistrict}
        setAddressDistrict={setAddressDistrict}
        addressNeighborhood={addressNeighborhood}
        setAddressNeighborhood={setAddressNeighborhood}
        addressStreet={addressStreet}
        setAddressStreet={setAddressStreet}
        addressBuildingNumber={addressBuildingNumber}
        setAddressBuildingNumber={setAddressBuildingNumber}
        addressApartment={addressApartment}
        setAddressApartment={setAddressApartment}
        addressFloor={addressFloor}
        setAddressFloor={setAddressFloor}
        addressHasElevator={addressHasElevator}
        setAddressHasElevator={setAddressHasElevator}
        newAddressStreet={newAddressStreet}
        setNewAddressStreet={setNewAddressStreet}
        addresses={addresses}
        setAddresses={setAddresses}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        user={user}
      />
    </>
  );
}
