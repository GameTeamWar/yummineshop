import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, Heart, ShoppingBag, Search, User, Menu, X, Truck, Star, ChevronRight, Sun, Moon, FileText, Navigation, Minus, Plus, Filter, LogOut, Play, Shield, ShoppingCart, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useLoadScript, GoogleMap } from '@react-google-maps/api';
import AddAddressModal from '../modals/AddAddressModal';
import EditAddressModal from '../modals/EditAddressModal';
import CartSidebar from '../card/cart';

// Google Maps libraries - static array to prevent re-renders
const GOOGLE_MAPS_LIBRARIES: ("places" | "geocoding")[] = ['places', 'geocoding'];

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  heroMode: string;
  setHeroMode: (mode: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  setCartTotal
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

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
      if (cartSidebarOpen && !(event.target as Element).closest('.cart-sidebar')) {
        setCartSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addressDropdownOpen, userDropdownOpen, cartSidebarOpen]);

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

  return (
    <>
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-neutral-800' : 'bg-white border-neutral-200'} border-b shadow-lg`}>
        <div className="w-full mx-auto px-4 py-3">
          {isMobile ? (
            // Mobile Header: Only logo and search
            <div className="flex items-center justify-between relative">
              <div className="flex items-center">
                <span className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Yummine</span><span>.</span>
              </div>
              
              {/* Fixed Search Button in Bottom Right Corner */}
              {heroMode === 'shopping' && (
                <div className="absolute bottom-0 right-0 z-30">
                  {/* Animated Search Bar - Fixed Position */}
                  <div className={`relative flex items-center transition-all duration-500 ease-in-out ${isSearchExpanded ? 'w-screen h-12' : 'w-12 h-12'}`}>
                    {/* Search Icon Button */}
                    <button
                      onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                      className={`absolute right-0 z-20 p-3 rounded-lg transition-all duration-300 ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'} ${isSearchExpanded ? 'text-blue-500' : ''}`}
                    >
                      <Search className={`w-5 h-5 transition-transform duration-300 ${isSearchExpanded ? 'scale-110' : ''}`} />
                    </button>

                    {/* Expandable Input - Full Width */}
                    <input
                      type="text"
                      placeholder={isSearchExpanded ? "Ara..." : ""}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => {
                        // Auto-collapse when losing focus and empty
                        if (!searchQuery.trim()) {
                          setTimeout(() => setIsSearchExpanded(false), 150);
                        }
                      }}
                      className={`w-full h-full pl-4 pr-12 rounded-lg border transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isSearchExpanded 
                          ? `opacity-100 ${darkMode ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-neutral-100 border-neutral-300 text-neutral-950 placeholder-neutral-500'}`
                          : 'opacity-0 w-0 p-0 border-0'
                      }`}
                      style={{ 
                        transition: 'all 0.5s ease-in-out',
                        width: isSearchExpanded ? '100vw' : '0px',
                        transform: isSearchExpanded ? 'translateX(-100%)' : 'translateX(0%)',
                        transformOrigin: 'right center'
                      }}
                    />

                    {/* Close button when expanded */}
                    {isSearchExpanded && (
                      <button
                        onClick={() => {
                          setIsSearchExpanded(false);
                          setSearchQuery('');
                        }}
                        className={`absolute right-3 z-20 p-2 rounded-full transition-all duration-300 ${darkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-200 text-neutral-600'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Desktop Header: Full version
            <>
              <div className="flex items-center justify-between mb-3">
                {/* Sol: Logo */}
                <div className="flex items-center">
                  <div className="hidden sm:block ml-4">
                    <span className={`text-xl sm:text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>Yummine</span><span>.</span> <span className=" transform rotate-90 -translate-x-3 -translate-y-1 inline-block text-sm font-semibold">com</span>
                  </div>
                </div>

                {/* Orta: Mode Toggle - Compact Design */}
                {user && (
                  <div className="relative">
                    {/* Compact Tab Design */}
                    <div className={`relative flex rounded-xl overflow-hidden border transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/90 border-gray-200/50'} backdrop-blur-sm shadow-lg`}>
                      
                      {/* Sliding Indicator */}
                      <div 
                        className={`absolute top-0 bottom-0 w-1/2 rounded-lg transition-all duration-300 ease-out ${
                          heroMode === 'shopping' 
                            ? 'left-0 bg-linear-to-r from-blue-500 to-purple-500' 
                            : 'left-1/2 bg-linear-to-r from-green-500 to-teal-500'
                        }`}
                      ></div>

                      {/* Shopping Tab */}
                      <button
                        onClick={() => setHeroMode('shopping')}
                        className={`relative flex-1 px-3 sm:px-4 py-2.5 font-semibold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
                          heroMode === 'shopping' 
                            ? 'text-white' 
                            : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                        }`}
                      >
                        <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${heroMode === 'shopping' ? 'animate-pulse' : ''}`} />
                        <span className="text-xs sm:text-sm font-medium">Market</span>
                      </button>

                      {/* Documents Tab */}
                      <button
                        onClick={() => setHeroMode('documents')}
                        className={`relative flex-1 px-3 sm:px-4 py-2.5 font-semibold transition-all duration-300 flex items-center justify-center gap-2 z-10 ${
                          heroMode === 'documents' 
                            ? 'text-white' 
                            : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                        }`}
                      >
                        <FileText className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${heroMode === 'documents' ? 'animate-pulse' : ''}`} />
                        <span className="text-xs sm:text-sm font-medium">Belge</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sağ: Transparent Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Address Selection Button - Transparent */}
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

                  {/* Dark Mode Toggle - Transparent */}
                  <button onClick={() => setDarkMode(!darkMode)} className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}>
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  {/* Cart Button - Transparent */}
                  {user && (
                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCartSidebarOpen(!cartSidebarOpen); }}
                      className={`p-1.5 rounded-lg transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 relative ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {/* Sepet sayısı badge'i (dinamik) */}
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                          {cart.length}
                        </span>
                      )}
                    </button>
                  )}

                  {/* User Menu - Transparent */}
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
                          <button className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 first:rounded-t-lg ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Profil
                            </div>
                          </button>
                          <button className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              Satın Aldıklarım
                            </div>
                          </button>
                          <button className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Favorilerim
                            </div>
                          </button>
                          <button className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Adreslerim
                            </div>
                          </button>
                          <button className={`w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-neutral-700' : 'text-neutral-950 hover:bg-neutral-50'}`}>
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
                    <div className="flex items-center gap-1">
                      <button onClick={() => router.push('/auth/register?type=customer')} className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-white'}`}>
                        Kayıt Ol
                      </button>
                      <button onClick={() => router.push('/auth/login?type=customer')} className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors duration-300 bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-white'}`}>
                        Giriş Yap
                      </button>
                    </div>
                  )}
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
