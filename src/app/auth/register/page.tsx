'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, Store, Upload, X, Mail, Lock, Building, Phone, FileText, Users, Camera, CreditCard, Calendar, Car, MapPin, IdCard, GraduationCap, User, Building2, Home } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { db } from '@/lib/firebase'; // Firebase import
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Note: google.maps.Marker is deprecated as of Feb 2024, but will continue to work until at least Feb 2026
// The @react-google-maps/api library handles this internally. This warning can be safely ignored for now.

// Google Maps libraries constant to avoid performance warning
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ['places'];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isCourier, setIsCourier] = useState(false); // false = mağaza, true = kurye
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Konum arama için
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Firebase'den çekilen location verileri
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Firebase'den şehir, ilçe, mahalle verilerini çek
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const locationsRef = collection(db, 'locations');
        const querySnapshot = await getDocs(locationsRef);
        const citiesData: string[] = [];
        
        querySnapshot.forEach((doc) => {
          citiesData.push(doc.id); // Şehir isimleri
        });
        
        setCities(citiesData);
        
        // İstanbul için ilçeleri çek
        await fetchDistricts('İstanbul');
      } catch (error) {
        console.error('Konum verileri çekilirken hata:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Şehir seçildiğinde ilçeleri çek
  const fetchDistricts = async (city: string) => {
    if (!city) return;
    console.log('fetchDistricts çağrıldı, şehir:', city);
    try {
      const cityDoc = await getDoc(doc(db, 'locations', city));
      console.log('cityDoc.exists():', cityDoc.exists());
      if (cityDoc.exists()) {
        const data = cityDoc.data();
        console.log('data:', data);
        console.log('data.districts:', data.districts);
        setDistricts(data.districts || []);
        console.log('districts set edildi');
      } else {
        console.log('Document bulunamadı:', city);
      }
    } catch (error) {
      console.error('İlçe verileri çekilirken hata:', error);
    }
  };

  // İlçe seçildiğinde mahalleleri çek
  const fetchNeighborhoods = async (city: string, district: string) => {
    if (!city || !district) return;
    try {
      const cityDoc = await getDoc(doc(db, 'locations', city));
      if (cityDoc.exists()) {
        const data = cityDoc.data();
        const districtData = data.districts?.find((d: any) => d.name === district);
        setNeighborhoods(districtData?.neighborhoods || []);
      }
    } catch (error) {
      console.error('Mahalle verileri çekilirken hata:', error);
    }
  };

  // Form state'leri
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    address: {
      province: 'İstanbul',
      district: '',
      neighborhood: '',
      street: '',
      detailedAddress: ''
    },
    phone: '',
    taxNumber: '',
    kepAddress: '',
    storeType: '',
    businessType: '',
    employeeCount: '',
    iban: '',
    ibanOwnerName: '',
    ibanOwnerSurname: '',
    ibanOwnerBirthDate: '',
    taxCertificate: null as File | null,
    taxCertificatePreview: '',
    idCardCopy: null as File | null,
    idCardCopyPreview: '',
    branchCount: '',
    branchReferenceCode: '',
    logo: null as File | null,
    logoPreview: '',
    location: { lat: 41.0082, lng: 28.9784 }, // İstanbul merkez varsayılan
    authorizedPersons: [{ name: '', surname: '', phone: '', email: '', idCard: null as File | null, idCardPreview: '' }, { name: '', surname: '', phone: '', email: '', idCard: null as File | null, idCardPreview: '' }]
  });

  // Kopyalama için state
  const [copySuccess, setCopySuccess] = useState(false);

  const [courierForm, setCourierForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    tcNo: '',
    birthDate: '',
    licensePlate: '',
    vehicleType: '',
    workingHours: '',
    address: {
      province: 'İstanbul',
      district: '',
      neighborhood: '',
      street: '',
      detailedAddress: ''
    },
    idCard: null as File | null,
    idCardPreview: '',
    driversLicense: null as File | null,
    driversLicensePreview: '',
    taxCertificate: null as File | null,
    taxCertificatePreview: '',
    residenceCertificate: null as File | null,
    residenceCertificatePreview: '',
    iban: '',
    corporateType: '',
    email: '',
    password: '',
    courierReferenceCode: ''
  });

  useEffect(() => {
    if (type === 'customer') {
      setRole(2);
    } else if (type === 'partner') {
      setRole(isCourier ? 3 : 1);
    }
  }, [type, isCourier]);

  // Kurye referans kodu oluşturma
  const generateCourierReferenceCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Kurye için referans kodu oluştur
  useEffect(() => {
    if (type === 'partner' && isCourier && !courierForm.courierReferenceCode) {
      const referenceCode = generateCourierReferenceCode();
      setCourierForm(prev => ({ ...prev, courierReferenceCode: referenceCode }));
    }
  }, [type, isCourier, courierForm.courierReferenceCode]);

  // Sayfa yüklendiğinde konum izni iste
  useEffect(() => {
    if (type === 'partner' && !isCourier && isLoaded) {
      // Sadece mağaza kayıt sayfasında ve harita yüklendiğinde konum izni iste
      const requestLocationPermission = () => {
        if (!('geolocation' in navigator)) {
          setLocationError('Tarayıcınız konum özelliğini desteklemiyor.');
          return;
        }

        setLocationLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            updateLocation(lat, lng);
            setLocationLoading(false);
          },
          (error) => {
            setLocationLoading(false);
            switch(error.code) {
              case error.PERMISSION_DENIED:
                setLocationError('Konum izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.');
                break;
              case error.POSITION_UNAVAILABLE:
                setLocationError('Konum bilgisi alınamadı.');
                break;
              case error.TIMEOUT:
                setLocationError('Konum alma işlemi zaman aşımına uğradı.');
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      };

      requestLocationPermission();
    }
  }, [type, isCourier, isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    // Gizlilik politikası kontrolü
    if (!privacyPolicyAccepted) {
      setError('Gizlilik politikasını kabul etmeniz gerekmektedir.');
      return;
    }

    try {
      // Kurye için email'i courier formundan, mağaza için yetkili kişiden al
      const email = isCourier ? courierForm.email : storeForm.authorizedPersons[0].email;
      if (!email) {
        setError(isCourier ? 'E-posta adresi gereklidir.' : 'En az bir yetkili kişinin e-posta adresi gereklidir.');
        return;
      }

      const additionalData = isCourier ? {
        ...courierForm,
        partnerType: 'courier'
      } : {
        ...storeForm,
        partnerType: 'store'
      };

      await register(email, 'tempPassword123!', role, additionalData);
      if (type === 'customer') {
        router.push('/');
      } else {
        router.push('/partner');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    if (isCourier) {
      // Kurye için preview oluştur
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          setCourierForm(prev => ({ ...prev, [field]: file, [`${field}Preview`]: previewUrl }));
        };
        reader.readAsDataURL(file);
      } else {
        setCourierForm(prev => ({ ...prev, [field]: file, [`${field}Preview`]: '' }));
      }
    } else {
      // Mağaza için preview oluştur
      if (field === 'logo') {
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewUrl = e.target?.result as string;
            setStoreForm(prev => ({ ...prev, logo: file, logoPreview: previewUrl }));
          };
          reader.readAsDataURL(file);
        } else {
          setStoreForm(prev => ({ ...prev, logo: file, logoPreview: '' }));
        }
      } else if (field === 'taxCertificate') {
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewUrl = e.target?.result as string;
            setStoreForm(prev => ({ ...prev, taxCertificate: file, taxCertificatePreview: previewUrl }));
          };
          reader.readAsDataURL(file);
        } else {
          setStoreForm(prev => ({ ...prev, taxCertificate: file, taxCertificatePreview: '' }));
        }
      } else if (field === 'idCardCopy') {
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewUrl = e.target?.result as string;
            setStoreForm(prev => ({ ...prev, idCardCopy: file, idCardCopyPreview: previewUrl }));
          };
          reader.readAsDataURL(file);
        } else {
          setStoreForm(prev => ({ ...prev, idCardCopy: file, idCardCopyPreview: '' }));
        }
      }
    }
  };

  const removeFile = (field: string) => {
    handleFileUpload(field, null);
  };

  const addAuthorizedPerson = () => {
    setStoreForm(prev => ({
      ...prev,
      authorizedPersons: [...prev.authorizedPersons, { name: '', surname: '', phone: '', email: '', idCard: null as File | null, idCardPreview: '' }]
    }));
  };

  const updateAuthorizedPerson = (index: number, field: 'name' | 'surname' | 'phone' | 'email', value: string) => {
    setStoreForm(prev => ({
      ...prev,
      authorizedPersons: prev.authorizedPersons.map((person, i) =>
        i === index ? { ...person, [field]: value } : person
      )
    }));
  };

  const removeAuthorizedPerson = (index: number) => {
    if (storeForm.authorizedPersons.length > 2) {
      setStoreForm(prev => ({
        ...prev,
        authorizedPersons: prev.authorizedPersons.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAuthorizedPersonFileUpload = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setStoreForm(prev => ({
          ...prev,
          authorizedPersons: prev.authorizedPersons.map((person, i) =>
            i === index ? { ...person, idCard: file, idCardPreview: previewUrl } : person
          )
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setStoreForm(prev => ({
        ...prev,
        authorizedPersons: prev.authorizedPersons.map((person, i) =>
          i === index ? { ...person, idCard: file, idCardPreview: '' } : person
        )
      }));
    }
  };

  const removeAuthorizedPersonFile = (index: number) => {
    handleAuthorizedPersonFileUpload(index, null);
  };

  // Konum seçme işlevselliği
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setStoreForm(prev => ({
        ...prev,
        location: { lat, lng }
      }));
    }
  };

  const updateLocation = (lat: number, lng: number) => {
    setStoreForm(prev => ({
      ...prev,
      location: { lat, lng }
    }));
  };

  // Mevcut konumu al (manuel buton için)
  const getCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateLocation(lat, lng);
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Konum izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Konum bilgisi alınamadı.');
            break;
          case error.TIMEOUT:
            setLocationError('Konum alma işlemi zaman aşımına uğradı.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Şube referans kodunu kopyalama fonksiyonu
  const copyBranchCode = async () => {
    if (!storeForm.branchReferenceCode) return;

    try {
      await navigator.clipboard.writeText(storeForm.branchReferenceCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = storeForm.branchReferenceCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Kurye referans kodunu kopyalama fonksiyonu
  const copyCourierCode = async () => {
    if (!courierForm.courierReferenceCode) return;

    try {
      await navigator.clipboard.writeText(courierForm.courierReferenceCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = courierForm.courierReferenceCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Kayıt Türü Seçin
            </h2>
            <div className="mt-8 space-y-4">
              <a
                href="/auth/register?type=customer"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Müşteri Olarak Kayıt Ol
              </a>
              <a
                href="/auth/register?type=partner"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Partner Olarak Kayıt Ol (Mağaza/Kurye)
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCustomer = type === 'customer';

  if (isCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Müşteri Kayıt
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              Yummine ile kolayca alışveriş yapın
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">E-posta</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="E-posta adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Şifre</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kayıt Ol
              </button>
            </div>
            <div className="text-center">
              <a
                href="/auth/login?type=customer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                Zaten hesabınız var mı? Giriş yapın
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Partner Registration Form
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 pb-24" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto" suppressHydrationWarning>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isCourier ? 'Kurye Kayıt' : 'Mağaza Kayıt'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            {isCourier ? 'Yummine kurye ailesine katılın' : 'Mağaza olarak Yummine ailesine katılın'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="partner-register-form">
          {/* Store Form */}
          {!isCourier && (
            <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-4">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-white mr-3" />
                  <h3 className="text-lg font-semibold text-white">Mağaza Bilgileri</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-2">
                    <label htmlFor="storeName" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Building className="w-4 h-4 mr-2 text-green-500" />
                      Mağaza Adı
                    </label>
                    <input
                      id="storeName"
                      name="storeName"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Mağaza adınızı girin"
                      value={storeForm.storeName}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, storeName: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-green-500" />
                      İstanbul Adresi
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="province" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">İl</label>
                        <select
                          id="province"
                          name="province"
                          required
                          disabled={loadingLocations}
                          className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          value={storeForm.address.province}
                          onChange={(e) => {
                            const selectedCity = e.target.value;
                            setStoreForm(prev => ({
                              ...prev,
                              address: { ...prev.address, province: selectedCity, district: '', neighborhood: '', street: '' }
                            }));
                            setDistricts([]);
                            setNeighborhoods([]);
                            if (selectedCity) {
                              fetchDistricts(selectedCity);
                            }
                          }}
                        >
                          <option value="">
                            {loadingLocations ? 'Yükleniyor...' : 'İl Seçin...'}
                          </option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="district" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">İlçe</label>
                        <select
                          id="district"
                          name="district"
                          required
                          className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          value={storeForm.address.district}
                          onChange={(e) => {
                            const selectedDistrict = e.target.value;
                            setStoreForm(prev => ({
                              ...prev,
                              address: { ...prev.address, district: selectedDistrict, neighborhood: '', street: '' }
                            }));
                            setNeighborhoods([]);
                            if (selectedDistrict && storeForm.address.province) {
                              fetchNeighborhoods(storeForm.address.province, selectedDistrict);
                            }
                          }}
                        >
                          <option value="">İlçe Seçin...</option>
                          {districts.map((district) => (
                            <option key={district.name} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="neighborhood" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Mahalle</label>
                        <select
                          id="neighborhood"
                          name="neighborhood"
                          required
                          disabled={!storeForm.address.district}
                          className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                          value={storeForm.address.neighborhood}
                          onChange={(e) => setStoreForm(prev => ({
                            ...prev,
                            address: { ...prev.address, neighborhood: e.target.value }
                          }))}
                        >
                          <option value="">
                            {storeForm.address.district ? 'Mahalle Seçin...' : 'Önce ilçe seçin'}
                          </option>
                          {neighborhoods.map((neighborhood: string) => (
                            <option key={neighborhood} value={neighborhood}>
                              {neighborhood}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="street" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Cadde/Sokak</label>
                        <input
                          id="street"
                          name="street"
                          type="text"
                          className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Cadde/Sokak adını girin"
                          value={storeForm.address.street}
                          onChange={(e) => setStoreForm(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value }
                          }))}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label htmlFor="detailedAddress" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Açık Adres</label>
                        <textarea
                          id="detailedAddress"
                          name="detailedAddress"
                          rows={3}
                          required
                          className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                          placeholder="Bina no, daire no, kat vb. detayları girin"
                          value={storeForm.address.detailedAddress}
                          onChange={(e) => setStoreForm(prev => ({
                            ...prev,
                            address: { ...prev.address, detailedAddress: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Konum Seçme */}
                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-green-500" />
                      Mağaza Konumu
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Haritada mağaza konumunuzu doğru işaretleyin. Kurye bu konumdan teslim alacak.</p>

                    {/* Konum Butonu */}
                    <div className="flex justify-end mb-3">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mevcut konumumu bul"
                      >
                        {locationLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Alınıyor...
                          </>
                        ) : (
                          <>
                            📍 Konumum
                          </>
                        )}
                      </button>
                    </div>

                    <div className="h-64 w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{ height: '100%', width: '100%' }}
                          center={storeForm.location}
                          zoom={13}
                          onClick={handleMapClick}
                          options={{
                            disableDefaultUI: true,
                            zoomControl: false,
                            mapTypeControl: false,
                            scaleControl: false,
                            streetViewControl: false,
                            rotateControl: false,
                            fullscreenControl: false
                          }}
                        >
                          <Marker
                            position={storeForm.location}
                            draggable={true}
                            onDragEnd={(e) => {
                              if (e.latLng) {
                                updateLocation(e.latLng.lat(), e.latLng.lng());
                              }
                            }}
                          />
                        </GoogleMap>
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <div className="text-center">
                            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Harita yükleniyor...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {locationError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-700 flex items-center gap-2">
                          <span>⚠️</span>
                          {locationError}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex flex-col gap-1">
                        <span>Konum: {storeForm.location.lat.toFixed(6)}, {storeForm.location.lng.toFixed(6)}</span>
                        <a
                          href={`https://www.google.com/maps?q=${storeForm.location.lat},${storeForm.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline text-xs"
                        >
                          🗺️ Google Maps'te aç
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 mr-2 text-green-500" />
                      Telefon
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="0555 555 55 55"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                 <div className="space-y-2">
                    <label htmlFor="iban" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <CreditCard className="w-4 h-4 mr-2 text-green-500" />
                      IBAN
                    </label>
                    <input
                      id="iban"
                      name="iban"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      value={storeForm.iban}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, iban: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ibanOwnerName" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      IBAN Sahibi Adı
                    </label>
                    <input
                      id="ibanOwnerName"
                      name="ibanOwnerName"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="IBAN sahibi adı"
                      value={storeForm.ibanOwnerName || ''}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, ibanOwnerName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ibanOwnerSurname" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      IBAN Sahibi Soyadı
                    </label>
                    <input
                      id="ibanOwnerSurname"
                      name="ibanOwnerSurname"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="IBAN sahibi soyadı"
                      value={storeForm.ibanOwnerSurname || ''}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, ibanOwnerSurname: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ibanOwnerBirthDate" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-green-500" />
                      IBAN Sahibi Doğum Tarihi
                    </label>
                    <input
                      id="ibanOwnerBirthDate"
                      name="ibanOwnerBirthDate"
                      type="date"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={storeForm.ibanOwnerBirthDate || ''}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, ibanOwnerBirthDate: e.target.value }))}
                    />
                  </div>











                  <div className="space-y-2">
                    <label htmlFor="kepAddress" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 mr-2 text-green-500" />
                      KEP Adresi
                    </label>
                    <input
                      id="kepAddress"
                      name="kepAddress"
                      type="email"
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="kep@ornek.com"
                      value={storeForm.kepAddress}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, kepAddress: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="storeType" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Building className="w-4 h-4 mr-2 text-green-500" />
                      Mağaza Tipi
                    </label>
                    <select
                      id="storeType"
                      name="storeType"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={storeForm.storeType}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, storeType: e.target.value }))}
                    >
                      <option value="">Seçin...</option>
                      <option value="kozmetik">Kozmetik</option>
                      <option value="tekstil">Tekstil</option>
                      <option value="elektronik">Elektronik</option>
                      <option value="gida">Gıda</option>
                      <option value="market">Market</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="businessType" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FileText className="w-4 h-4 mr-2 text-green-500" />
                      İşletme Türü
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={storeForm.businessType}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, businessType: e.target.value }))}
                    >
                      <option value="">Seçin...</option>
                      <option value="sahis">Şahıs Şirketi</option>
                      <option value="anonim">Anonim Şirket</option>
                      <option value="limited">Limited Şirket</option>
                      <option value="serbest">Serbest Meslek</option>
                    </select>
                  </div>

                  





 <div className="space-y-2">
                    <label htmlFor="taxNumber" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FileText className="w-4 h-4 mr-2 text-green-500" />
                      {storeForm.businessType === 'sahis' ? 'TC Kimlik No' : 'Vergi Numarası'}
                    </label>
                    <input
                      id="taxNumber"
                      name="taxNumber"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={storeForm.businessType === 'sahis' ? '12345678901' : 'TXXXXVXXXXXX'}
                      value={storeForm.taxNumber}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                    />
                  </div>


                  <div className="space-y-2">
                    <label htmlFor="branchReferenceCode" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <IdCard className="w-4 h-4 mr-2 text-green-500" />
                      Şube Referans Kodu
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="branchReferenceCode"
                        name="branchReferenceCode"
                        type="text"
                        readOnly
                        className="flex-1 block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                        value={storeForm.branchReferenceCode}
                        placeholder="Otomatik oluşturulacak..."
                      />
                      {storeForm.branchReferenceCode && (
                        <button
                          type="button"
                          onClick={copyBranchCode}
                          className="inline-flex items-center px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 border-2 border-green-200 dark:border-gray-600"
                          title="Referans kodunu kopyala"
                        >
                          {copySuccess ? (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Kopyalandı!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Kopyala
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Bu kod alt şubelerinizin ana panele bağlanmasını sağlar</p>
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Camera className="w-4 h-4 mr-2 text-green-500" />
                      Mağaza Logosu
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-green-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <label htmlFor="logo-upload" className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                            Dosya seçin
                          </label>
                          <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                          <input
                            id="logo-upload"
                            name="logo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload('logo', e.target.files?.[0] || null)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Max 10MB</p>
                      </div>
                    </div>
                    {storeForm.logo && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={storeForm.logoPreview}
                            alt="Logo ön izleme"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{storeForm.logo.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('logo')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Authorized Persons */}
                <div className="sm:col-span-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Users className="w-4 h-4 mr-2 text-green-500" />
                      Yetkili Kişiler (En az 2 formun ilk başındaki kişi mağaza sahibi olacaktır iban ve vergi bilgileri bu kişi adına kayıt edilecektir)
                    </label>
                    <button
                      type="button"
                      onClick={addAuthorizedPerson}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 dark:text-green-400 bg-green-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      + Kişi Ekle
                    </button>
                  </div>
                  <div className="space-y-3">
                    {storeForm.authorizedPersons.map((person, index) => (
                      <div key={index} className="flex gap-4 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-500 transition-colors duration-200">
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Ad</label>
                          <input
                            type="text"
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Ad"
                            value={person.name}
                            onChange={(e) => updateAuthorizedPerson(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Soyad</label>
                          <input
                            type="text"
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Soyad"
                            value={person.surname}
                            onChange={(e) => updateAuthorizedPerson(index, 'surname', e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Telefon</label>
                          <input
                            type="tel"
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="0555 555 55 55"
                            value={person.phone}
                            onChange={(e) => updateAuthorizedPerson(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">E-posta</label>
                          <input
                            type="email"
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="ornek@email.com"
                            value={person.email}
                            onChange={(e) => updateAuthorizedPerson(index, 'email', e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Kimlik Fotokopisi</label>
                          <div className="relative">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-3 hover:border-green-400 dark:hover:border-green-500 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 cursor-pointer">
                              <div className="text-center">
                                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                                <p className="text-xs text-gray-600 dark:text-gray-400">Dosya seçin</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleAuthorizedPersonFileUpload(index, e.target.files?.[0] || null)}
                              />
                            </div>
                            {person.idCard && (
                              <div className="mt-2 flex items-center justify-between p-2 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-md">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={person.idCardPreview}
                                    alt="Kimlik ön izleme"
                                    className="w-8 h-8 object-cover rounded border border-gray-300 dark:border-gray-600"
                                  />
                                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{person.idCard.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAuthorizedPersonFile(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {storeForm.authorizedPersons.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeAuthorizedPerson(index)}
                            className="self-end p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Belge Yükleme Alanı */}
                <div className="sm:col-span-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-500" />
                    Gerekli Belgeler
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Vergi Levhası */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <FileText className="w-4 h-4 mr-2 text-green-500" />
                        Vergi Levhası Fotokopisi
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-green-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 cursor-pointer">
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <label htmlFor="tax-certificate-upload" className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                              Dosya seçin
                            </label>
                            <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                            <input
                              id="tax-certificate-upload"
                              name="tax-certificate-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="sr-only"
                              onChange={(e) => handleFileUpload('taxCertificate', e.target.files?.[0] || null)}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, PDF • Max 10MB</p>
                        </div>
                      </div>
                      {storeForm.taxCertificate && (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={storeForm.taxCertificatePreview}
                              alt="Vergi levhası ön izleme"
                              className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{storeForm.taxCertificate.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('taxCertificate')}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Kimlik Fotokopisi */}
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <IdCard className="w-4 h-4 mr-2 text-green-500" />
                        Kimlik Fotokopisi
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-green-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 cursor-pointer">
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <label htmlFor="id-card-copy-upload" className="cursor-pointer text-green-600 hover:text-green-700 font-medium">
                              Dosya seçin
                            </label>
                            <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                            <input
                              id="id-card-copy-upload"
                              name="id-card-copy-upload"
                              type="file"
                              accept="image/*,.pdf"
                              className="sr-only"
                              onChange={(e) => handleFileUpload('idCardCopy', e.target.files?.[0] || null)}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, PDF • Max 10MB</p>
                        </div>
                      </div>
                      {storeForm.idCardCopy && (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={storeForm.idCardCopyPreview}
                              alt="Kimlik fotokopisi ön izleme"
                              className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{storeForm.idCardCopy.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('idCardCopy')}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courier Form */}
          {isCourier && (
            <div className="bg-linear-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 border border-orange-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-gray-700 to-gray-700 px-6 py-4">
                <div className="flex items-center">
                  <Bike className="w-5 h-5 text-white mr-3" />
                  <h3 className="text-lg font-semibold text-white">Kurye Bilgileri</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 mr-2 text-orange-500" />
                      Ad
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Adınız"
                      value={courierForm.firstName}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 mr-2 text-orange-500" />
                      Soyad
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Soyadınız"
                      value={courierForm.lastName}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 mr-2 text-orange-500" />
                      Telefon
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="0555 555 55 55"
                      value={courierForm.phone}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Building className="w-4 h-4 mr-2 text-orange-500" />
                      Şirket Türü
                    </label>
                    <select
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={courierForm.corporateType}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, corporateType: e.target.value }))}
                    >
                      <option value="">Şirket Türü Seçin</option>
                      <option value="ANONYMOUS">🏢 Anonim Şirket</option>
                      <option value="PRIVATE">👤 Şahıs Şirketi</option>
                      <option value="LIMITED">🛍️ Limited Şirket</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <IdCard className="w-4 h-4 mr-2 text-orange-500" />
                      {courierForm.corporateType === 'PRIVATE' ? 'TC Kimlik No' : 'Vergi Numarası'}
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={courierForm.corporateType === 'PRIVATE' ? '12345678901' : 'TXXXXVXXXXXX'}
                      value={courierForm.tcNo}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, tcNo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="birthDate" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      Doğum Tarihi
                    </label>
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={courierForm.birthDate}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="licensePlate" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Car className="w-4 h-4 mr-2 text-orange-500" />
                      Araç Plakası
                    </label>
                    <input
                      id="licensePlate"
                      name="licensePlate"
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="34 ABC 123"
                      value={courierForm.licensePlate}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, licensePlate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="vehicleType" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Car className="w-4 h-4 mr-2 text-orange-500" />
                      Araç Tipi
                    </label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={courierForm.vehicleType}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                    >
                      <option value="">Seçin...</option>
                      <option value="motorcycle">🏍️ Motosiklet</option>
                      <option value="bicycle">🚲 Bisiklet</option>
                      <option value="car">🚗 Araba</option>
                      <option value="scooter">🛵 Scooter</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="workingHours" className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      Çalışma Saatleri
                    </label>
                    <select
                      id="workingHours"
                      name="workingHours"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                      value={courierForm.workingHours}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, workingHours: e.target.value }))}
                    >
                      <option value="">Seçin...</option>
                      <option value="full-time">⏰ Tam Zamanlı</option>
                      <option value="part-time">🕐 Yarı Zamanlı</option>
                      <option value="weekends">🎯 Hafta Sonları</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-4">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                      İstanbul Adresi
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">İlçe</label>
                        <select
                          required
                          className="block w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                          value={courierForm.address.district}
                          onChange={(e) => setCourierForm(prev => ({
                            ...prev,
                            address: { ...prev.address, district: e.target.value, neighborhood: '' }
                          }))}
                        >
                          <option value="">İlçe Seçin</option>
                          {districts.map((district) => (
                            <option key={district.name} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mahalle</label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Mahalle adı"
                          value={courierForm.address.neighborhood}
                          onChange={(e) => setCourierForm(prev => ({
                            ...prev,
                            address: { ...prev.address, neighborhood: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cadde/Sokak</label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Cadde/Sokak adı"
                          value={courierForm.address.street}
                          onChange={(e) => setCourierForm(prev => ({
                            ...prev,
                            address: { ...prev.address, street: e.target.value }
                          }))}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Detaylı Adres</label>
                        <input
                          type="text"
                          required
                          className="block w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Kapı no, daire no vb."
                          value={courierForm.address.detailedAddress}
                          onChange={(e) => setCourierForm(prev => ({
                            ...prev,
                            address: { ...prev.address, detailedAddress: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <IdCard className="w-4 h-4 mr-2 text-orange-500" />
                      Kimlik Fotokopisi
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-orange-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <label htmlFor="id-upload" className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                            Dosya seçin
                          </label>
                          <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                          <input
                            id="id-upload"
                            name="id-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload('idCard', e.target.files?.[0] || null)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Max 10MB</p>
                      </div>
                    </div>
                    {courierForm.idCard && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={courierForm.idCardPreview}
                            alt="Kimlik ön izleme"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{courierForm.idCard.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('idCard')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <GraduationCap className="w-4 h-4 mr-2 text-orange-500" />
                      Ehliyet Fotokopisi
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-orange-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <label htmlFor="license-upload" className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                            Dosya seçin
                          </label>
                          <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                          <input
                            id="license-upload"
                            name="license-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload('driversLicense', e.target.files?.[0] || null)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Max 10MB</p>
                      </div>
                    </div>
                    {courierForm.driversLicense && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={courierForm.driversLicensePreview}
                            alt="Ehliyet ön izleme"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{courierForm.driversLicense.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('driversLicense')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FileText className="w-4 h-4 mr-2 text-orange-500" />
                      Vergi Levhası Fotokopisi
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-orange-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <label htmlFor="tax-upload" className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                            Dosya seçin
                          </label>
                          <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                          <input
                            id="tax-upload"
                            name="tax-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload('taxCertificate', e.target.files?.[0] || null)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Max 10MB</p>
                      </div>
                    </div>
                    {courierForm.taxCertificate && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={courierForm.taxCertificatePreview}
                            alt="Vergi levhası ön izleme"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{courierForm.taxCertificate.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('taxCertificate')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Home className="w-4 h-4 mr-2 text-orange-500" />
                      İkametgah Belgesi
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-orange-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <label htmlFor="residence-upload" className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                            Dosya seçin
                          </label>
                          <span className="text-gray-500 dark:text-gray-400"> veya sürükleyip bırakın</span>
                          <input
                            id="residence-upload"
                            name="residence-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleFileUpload('residenceCertificate', e.target.files?.[0] || null)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF • Max 10MB</p>
                      </div>
                    </div>
                    {courierForm.residenceCertificate && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={courierForm.residenceCertificatePreview}
                            alt="İkametgah ön izleme"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{courierForm.residenceCertificate.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('residenceCertificate')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                      IBAN
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      value={courierForm.iban}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, iban: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 mr-2 text-orange-500" />
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      required
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="ornek@email.com"
                      value={courierForm.email}
                      onChange={(e) => setCourierForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <IdCard className="w-4 h-4 mr-2 text-orange-500" />
                      Kurye Referans Kodu
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        readOnly
                        className="flex-1 block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                        value={courierForm.courierReferenceCode}
                        placeholder="Otomatik oluşturulacak..."
                      />
                      {courierForm.courierReferenceCode && (
                        <button
                          type="button"
                          onClick={copyCourierCode}
                          className="inline-flex items-center px-4 py-3 text-sm font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-gray-700 hover:bg-orange-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 border-2 border-orange-200 dark:border-gray-600"
                          title="Referans kodunu kopyala"
                        >
                          {copySuccess ? (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Kopyalandı!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Kopyala
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Bu kod kurye profilinizin benzersiz tanımlayıcısıdır</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy Agreement */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="privacy-policy"
                  name="privacy-policy"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={privacyPolicyAccepted}
                  onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="privacy-policy" className="text-gray-700 dark:text-gray-300 font-medium">
                  Gizlilik Politikasını Kabul Ediyorum
                </label>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Kişisel verilerimin{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                    Gizlilik Politikası
                  </a>
                  {' '}çerçevesinde işlenmesini ve saklanmasını kabul ediyorum. Yummine'nin hizmet şartlarını ve kullanım koşullarını anladım ve kabul ediyorum.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 shadow-lg">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <a
                href="/auth/login?type=partner"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span className="flex items-center">
                  Giriş Yap
                </span>
              </a>

              {/* Hizmet Türü Seçin Toggle */}
              <div className="bg-white dark:bg-gray-800 py-2 px-3 rounded-lg shadow-sm border">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">Hizmet Türü</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${!isCourier ? 'font-medium text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>🏪 Mağaza</span>
                  <button
                    onClick={() => setIsCourier(!isCourier)}
                    className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${
                      isCourier ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  >
                    <div
                      className={`absolute h-3 w-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        isCourier ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                  <span className={`text-xs ${isCourier ? 'font-medium text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>🏍️ Kurye</span>
                </div>
              </div>

              <button
                type="submit"
                form="partner-register-form"
                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  {isCourier ? (
                    <>
                      <Bike className="w-4 h-4 mr-2" />
                      Kurye Olarak Kayıt Ol
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Mağaza Olarak Kayıt Ol
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}