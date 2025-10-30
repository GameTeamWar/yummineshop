'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

async function sendPasswordEmail({ to, password, additionalData }: { to: string; password: string; additionalData?: any }) {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: to,
      additionalData: { generatedPassword: password, ...additionalData },
    }),
  });
  if (!res.ok) {
    throw new Error('E-posta gönderilemedi');
  }
}

import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, Store, Upload, X, Mail, Lock, Building, Phone, FileText, Users, Camera, CreditCard, Calendar, Car, MapPin, IdCard, GraduationCap, User, Building2, Home } from 'lucide-react';
import { FaMotorcycle } from 'react-icons/fa';
import { BsShop } from 'react-icons/bs';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CourierRegistration from '@/components/general/register/CourierRegistration';
import StoreRegistration from '@/components/general/register/StoreRegistration';
import { toast } from 'react-toastify';

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ['places'];

// Kategori yapısı - create-categories.js'den alınmış
const CATEGORIES_DATA = [
  {
    id: 'giyim',
    name: "Giyim",
    childCategories: ['kadin-giyim', 'erkek-giyim', 'cocuk-giyim', 'buyuk-beden']
  },
  {
    id: 'kadin-giyim',
    name: "Kadın Giyim",
    childCategories: ['kadin-ust-giyim', 'kadin-alt-giyim', 'kadin-dis-giyim', 'kadin-ic-giyim', 'kadin-elbise-tulum']
  },
  {
    id: 'kadin-ust-giyim',
    name: "Üst Giyim",
    productCategories: ['kadin-tisort', 'kadin-bluz', 'kadin-gomlek', 'kadin-sweatshirt', 'kadin-kazak', 'kadin-hirka', 'kadin-atlet-body', 'kadin-crop']
  },
  {
    id: 'kadin-alt-giyim',
    name: "Alt Giyim",
    productCategories: ['kadin-pantolon', 'kadin-jean', 'kadin-etek', 'kadin-sort', 'kadin-tayt-takim']
  },
  {
    id: 'kadin-dis-giyim',
    name: "Dış Giyim",
    productCategories: ['kadin-mont', 'kadin-kaban-palto', 'kadin-yelek', 'kadin-ceket', 'kadin-trencot-yagmurluk']
  },
  {
    id: 'kadin-ic-giyim',
    name: "İç Giyim",
    productCategories: ['kadin-sutyen', 'kadin-kulot', 'kadin-pijama-takimi', 'kadin-gecelik', 'kadin-corap', 'kadin-termal']
  },
  {
    id: 'kadin-elbise-tulum',
    name: "Elbise & Tulum",
    productCategories: ['kadin-gunluk-elbise', 'kadin-abiye', 'kadin-gece-elbisesi', 'kadin-tulum', 'kadin-etnik-elbise']
  },
  {
    id: 'erkek-giyim',
    name: "Erkek Giyim",
    childCategories: ['erkek-ust-giyim', 'erkek-alt-giyim', 'erkek-dis-giyim', 'erkek-ic-giyim', 'erkek-takim-elbise']
  },
  {
    id: 'erkek-ust-giyim',
    name: "Üst Giyim",
    productCategories: ['erkek-tisort', 'erkek-gomlek', 'erkek-polo', 'erkek-sweatshirt', 'erkek-kazak', 'erkek-hirka', 'erkek-atlet']
  },
  {
    id: 'erkek-alt-giyim',
    name: "Alt Giyim",
    productCategories: ['erkek-pantolon', 'erkek-jean', 'erkek-sort', 'erkek-esofman-alti']
  },
  {
    id: 'erkek-dis-giyim',
    name: "Dış Giyim",
    productCategories: ['erkek-mont', 'erkek-kaban', 'erkek-yelek', 'erkek-ceket', 'erkek-yagmurluk']
  },
  {
    id: 'erkek-ic-giyim',
    name: "İç Giyim",
    productCategories: ['erkek-boxer', 'erkek-corap', 'erkek-pijama', 'erkek-ic-camasir', 'erkek-termal']
  },
  {
    id: 'erkek-takim-elbise',
    name: "Takım Elbise",
    productCategories: ['erkek-takim', 'erkek-smokin', 'erkek-yelek-takim', 'erkek-gomlek-kravat']
  },
  {
    id: 'cocuk-giyim',
    name: "Çocuk Giyim",
    childCategories: ['kiz-cocuk', 'erkek-cocuk', 'bebek-giyim']
  },
  {
    id: 'kiz-cocuk',
    name: "Kız Çocuk",
    productCategories: ['kiz-ust-giyim', 'kiz-alt-giyim', 'kiz-elbise', 'kiz-dis-giyim', 'kiz-ic-giyim']
  },
  {
    id: 'erkek-cocuk',
    name: "Erkek Çocuk",
    productCategories: ['erkek-cocuk-ust', 'erkek-cocuk-alt', 'erkek-cocuk-dis', 'erkek-cocuk-ic']
  },
  {
    id: 'bebek-giyim',
    name: "Bebek Giyim",
    productCategories: ['bebek-tulum', 'bebek-body', 'bebek-ust', 'bebek-alt', 'bebek-dis-giyim', 'bebek-takimlari']
  },
  {
    id: 'buyuk-beden',
    name: "Büyük Beden",
    productCategories: ['buyuk-beden-kadin', 'buyuk-beden-erkek']
  },
  {
    id: 'ayakkabi',
    name: "Ayakkabı & Çanta",
    childCategories: ['kadin-ayakkabi', 'erkek-ayakkabi', 'cocuk-ayakkabi', 'cantalar']
  },
  {
    id: 'kadin-ayakkabi',
    name: "Kadın Ayakkabı",
    productCategories: ['kadin-topuklu', 'kadin-sneaker', 'kadin-sandalet', 'kadin-bot-bootie', 'kadin-babet', 'kadin-terlik', 'kadin-spor-ayakkabi', 'kadin-gunluk-ayakkabi']
  },
  {
    id: 'erkek-ayakkabi',
    name: "Erkek Ayakkabı",
    productCategories: ['erkek-sneaker', 'erkek-klasik', 'erkek-bot', 'erkek-sandalet', 'erkek-terlik', 'erkek-spor-ayakkabi', 'erkek-gunluk-ayakkabi', 'erkek-ayakkabi-loafer']
  },
  {
    id: 'cocuk-ayakkabi',
    name: "Çocuk Ayakkabı",
    productCategories: ['cocuk-spor', 'cocuk-sneaker', 'cocuk-sandalet', 'cocuk-bot', 'cocuk-ev-ayakkabisi', 'bebek-ayakkabi']
  },
  {
    id: 'cantalar',
    name: "Çanta",
    productCategories: ['kadin-omuz-canta', 'kadin-el-canta', 'kadin-sirt-canta', 'kadin-bel-canta', 'erkek-evrak-canta', 'erkek-sirt-canta', 'erkek-bel-canta', 'cocuk-canta', 'valiz-seyahat']
  },
  {
    id: 'aksesuar',
    name: "Aksesuar & Takı",
    childCategories: ['kadin-aksesuar', 'erkek-aksesuar', 'taki', 'gozluk-saat']
  },
  {
    id: 'kadin-aksesuar',
    name: "Kadın Aksesuar",
    productCategories: ['kadin-kemer', 'kadin-sal-atki', 'kadin-bere-sapka', 'kadin-eldiven', 'kadin-cuzdan', 'kadin-kart-vizitlik']
  },
  {
    id: 'erkek-aksesuar',
    name: "Erkek Aksesuar",
    productCategories: ['erkek-kemer', 'erkek-kravat-papyon', 'erkek-sal-atki', 'erkek-bere-sapka', 'erkek-eldiven', 'erkek-cuzdan', 'erkek-kol-dugmesi']
  },
  {
    id: 'taki',
    name: "Takı",
    productCategories: ['kolye', 'kupe', 'bileklik', 'yuzuk', 'taki-seti', 'piercing', 'broslar']
  },
  {
    id: 'gozluk-saat',
    name: "Saat & Gözlük",
    productCategories: ['kadin-saat', 'erkek-saat', 'akilli-saat', 'kadin-gunes-gozlugu', 'erkek-gunes-gozlugu', 'gozluk-kiliflari']
  },
  {
    id: 'spor-outdoor',
    name: "Spor & Outdoor",
    childCategories: ['spor-giyim', 'spor-ayakkabi', 'spor-ekipman', 'outdoor']
  },
  {
    id: 'spor-giyim',
    name: "Spor Giyim",
    productCategories: ['kadin-spor', 'erkek-spor', 'spor-sutyen', 'spor-tayt', 'spor-sort', 'spor-tshirt', 'spor-sweatshirt', 'spor-esofman']
  },
  {
    id: 'spor-ayakkabi',
    name: "Spor Ayakkabı",
    productCategories: ['kosu-ayakkabi', 'fitness-ayakkabi', 'basketbol-ayakkabi', 'futbol-krampon', 'tenis-ayakkabi', 'outdoor-ayakkabi']
  },
  {
    id: 'spor-ekipman',
    name: "Spor Ekipman",
    productCategories: ['spor-canta', 'yoga-matt', 'spor-sise', 'fitness-ekipman', 'top-raket', 'kamp-malzemesi']
  },
  {
    id: 'outdoor',
    name: "Outdoor",
    productCategories: ['outdoor-giyim', 'trekking-ayakkabi', 'kamp-ekipman', 'sirt-cantasi', 'termos-matara']
  },
  {
    id: 'kozmetik',
    name: "Kozmetik & Kişisel Bakım",
    childCategories: ['makyaj', 'cilt-bakim', 'sac-bakim', 'kisisel-bakim', 'parfum']
  },
  {
    id: 'makyaj',
    name: "Makyaj",
    productCategories: ['yuz-makyaj', 'goz-makyaj', 'dudak-makyaj', 'tirnak-bakim', 'makyaj-seti', 'makyaj-firca']
  },
  {
    id: 'cilt-bakim',
    name: "Cilt Bakım",
    productCategories: ['yuz-temizleme', 'serum-ampul', 'nemlendirici', 'goz-bakim', 'maske-peeling', 'gunes-koruyucu', 'anti-aging']
  },
  {
    id: 'sac-bakim',
    name: "Saç Bakım",
    productCategories: ['sampuan', 'sac-kremi', 'sac-maske', 'sac-yagi', 'sac-boyasi', 'sac-sekillendirici', 'sac-aksesuari']
  },
  {
    id: 'kisisel-bakim',
    name: "Kişisel Bakım",
    productCategories: ['vucut-bakim', 'agiz-dis-bakim', 'epilasyon-tiras', 'deodorant', 'el-ayak-bakim', 'banyo-dus', 'hijyen']
  },
  {
    id: 'parfum',
    name: "Parfüm & Deodorant",
    productCategories: ['kadin-parfum', 'erkek-parfum', 'unisex-parfum', 'deodorant-spray', 'roll-on', 'parfum-seti']
  },
  {
    id: 'elektronik',
    name: "Elektronik",
    childCategories: ['telefon-tablet', 'bilgisayar', 'ses-goruntu', 'giyilebilir-teknoloji', 'oyun-konsol']
  },
  {
    id: 'telefon-tablet',
    name: "Telefon & Tablet",
    productCategories: ['telefon-kilif', 'ekran-koruyucu', 'sarj-aleti', 'power-bank', 'kablosuz-sarj', 'telefon-tutucu', 'selfie-cubugu']
  },
  {
    id: 'bilgisayar',
    name: "Bilgisayar & Tablet",
    productCategories: ['klavye-mouse', 'laptop-canta', 'laptop-standi', 'usb-hub', 'webcam', 'mousepad', 'canta-kilif']
  },
  {
    id: 'ses-goruntu',
    name: "Ses & Görüntü",
    productCategories: ['kulaklik', 'hoparlor', 'mikrofon', 'kulaklık-kilif']
  },
  {
    id: 'giyilebilir-teknoloji',
    name: "Giyilebilir Teknoloji",
    productCategories: ['akilli-saat', 'akilli-bileklik', 'vr-gozluk', 'saat-kayisi', 'saat-koruyucu']
  },
  {
    id: 'oyun-konsol',
    name: "Oyun & Konsol",
    productCategories: ['oyun-kolu', 'oyun-konsolu-aksesuar', 'gaming-kulaklik', 'gaming-mouse', 'gaming-klavye']
  },
  {
    id: 'ev-yasam',
    name: "Ev & Yaşam",
    childCategories: ['ev-tekstil', 'mutfak', 'banyo', 'dekorasyon', 'mobilya']
  },
  {
    id: 'ev-tekstil',
    name: "Ev Tekstil",
    productCategories: ['nevresim-takimi', 'pike-yorgan', 'yastik-yorgan', 'havlu', 'perde', 'hali-kilim', 'paspas']
  },
  {
    id: 'mutfak',
    name: "Mutfak & Sofra",
    productCategories: ['mutfak-gerec', 'tencere-tava', 'bıcak-seti', 'bardak-fincan', 'tabak-kase', 'saklama-kabi', 'mutfak-tekstil']
  },
  {
    id: 'banyo',
    name: "Banyo",
    productCategories: ['banyo-tekstil', 'banyo-aksesuar', 'banyo-organizeri', 'sabunluk-firca']
  },
  {
    id: 'dekorasyon',
    name: "Dekorasyon",
    productCategories: ['tablo-cerceve', 'vazo', 'mum-mumluk', 'saat', 'ayna', 'dekoratif-obje', 'yapay-cicek', 'yastik-kilif']
  },
  {
    id: 'mobilya',
    name: "Mobilya",
    productCategories: ['koltuk-kanepe', 'masa-sandalye', 'dolap-raf', 'yatak-baza', 'cocuk-mobilya']
  },
  {
    id: 'kitap-hobi',
    name: "Kitap, Müzik & Hobi",
    childCategories: ['kitap', 'kirtasiye', 'hobi', 'muzik-enstruman']
  },
  {
    id: 'kitap',
    name: "Kitap",
    productCategories: ['roman', 'bilim-kurgu', 'cocuk-kitap', 'edebiyat', 'kisisel-gelisim', 'tarih', 'biyografi', 'siir']
  },
  {
    id: 'kirtasiye',
    name: "Kırtasiye & Ofis",
    productCategories: ['defter-bloknot', 'kalem-kaleci', 'dosya-klasor', 'ofis-malzeme', 'ajanda-planlayici']
  },
  {
    id: 'hobi',
    name: "Hobi & Sanat",
    productCategories: ['boyama-resim', 'el-isi', 'puzzle', 'koleksiyon', 'model-maket']
  },
  {
    id: 'muzik-enstruman',
    name: "Müzik & Enstrüman",
    productCategories: ['gitar', 'klavye-piyano', 'davul-vurmali', 'uzeli-enstruman', 'aksesuar-parcalar']
  },
  {
    id: 'oyuncak-bebek',
    name: "Anne, Bebek & Oyuncak",
    childCategories: ['oyuncak', 'bebek-bakim', 'bebek-beslenme', 'anne-bakim']
  },
  {
    id: 'oyuncak',
    name: "Oyuncak",
    productCategories: ['bebek-oyuncak', 'oyuncak-bebek', 'lego-yapboz', 'egitici-oyuncak', 'aktivite-oyuncak', 'arac-oyuncak', 'peluş']
  },
  {
    id: 'bebek-bakim',
    name: "Bebek Bakım",
    productCategories: ['bez-mendil', 'bakim-hijyen', 'banyo-kupesti', 'emzik-biberon', 'bebek-guvenlik']
  },
  {
    id: 'bebek-beslenme',
    name: "Bebek Beslenme",
    productCategories: ['biberon-aksesuar', 'mama-sandalyesi', 'beslenme-seti', 'emzirme']
  },
  {
    id: 'anne-bakim',
    name: "Anne Bakım",
    productCategories: ['hamilelik-giyim', 'emzirme-giyim', 'gogus-pompalari', 'anne-bakim-urun']
  },
  {
    id: 'petshop',
    name: "Pet Shop",
    childCategories: ['kopek-urun', 'kedi-urun', 'kus-balik']
  },
  {
    id: 'kopek-urun',
    name: "Köpek Ürünleri",
    productCategories: ['kopek-mama', 'kopek-tasma', 'kopek-oyuncak', 'kopek-bakim', 'kopek-giyim', 'kopek-yatak']
  },
  {
    id: 'kedi-urun',
    name: "Kedi Ürünleri",
    productCategories: ['kedi-mama', 'kedi-kum', 'kedi-oyuncak', 'kedi-bakim', 'kedi-tirmalama', 'kedi-tasima']
  },
  {
    id: 'kus-balik',
    name: "Kuş & Balık",
    productCategories: ['kus-yem', 'kafes-aksesuar', 'akvaryum', 'balik-yem']
  },
  {
    id: 'otomotiv',
    name: "Otomotiv & Motosiklet",
    childCategories: ['oto-aksesuar', 'oto-bakim', 'oto-yedek', 'motor-aksesuar']
  },
  {
    id: 'oto-aksesuar',
    name: "Oto Aksesuar",
    productCategories: ['oto-koltuk-kilif', 'paspas', 'direksiyon-kilif', 'arac-kokusu', 'arac-telefon-tutucu', 'gunes-koruma']
  },
  {
    id: 'oto-bakim',
    name: "Oto Bakım",
    productCategories: ['arac-temizlik', 'cila-boya', 'cam-temizlik', 'bakim-seti']
  },
  {
    id: 'oto-yedek',
    name: "Yedek Parça",
    productCategories: ['filtre', 'ampul', 'silecek', 'ayna', 'far']
  },
  {
    id: 'motor-aksesuar',
    name: "Motosiklet",
    productCategories: ['motor-kask', 'motor-eldiven', 'motor-mont', 'motor-bot', 'motor-koruma']
  }
];

// Seçilen ana kategorilere göre alt kategorileri hesaplayan fonksiyon
function getSubCategoriesForStore(selectedMainCategories: string[]) {
  const subCategories: any[] = [];
  
  selectedMainCategories.forEach(mainCategoryId => {
    const mainCategory = CATEGORIES_DATA.find(cat => cat.id === mainCategoryId);
    if (mainCategory) {
      // Ana kategorinin childCategories'lerini ekle
      if (mainCategory.childCategories) {
        mainCategory.childCategories.forEach(childId => {
          const childCategory = CATEGORIES_DATA.find(cat => cat.id === childId);
          if (childCategory) {
            subCategories.push({
              id: childCategory.id,
              name: childCategory.name,
              parentId: mainCategoryId,
              parentName: mainCategory.name,
              isActive: true,
              order: subCategories.length + 1
            });
            
            // Child kategorinin productCategories'lerini de ekle
            if (childCategory.productCategories) {
              childCategory.productCategories.forEach(productCatId => {
                subCategories.push({
                  id: productCatId,
                  name: productCatId.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' '),
                  parentId: childCategory.id,
                  parentName: childCategory.name,
                  isActive: true,
                  order: subCategories.length + 1
                });
              });
            }
          }
        });
      }
      
      // Ana kategorinin doğrudan productCategories'lerini ekle (eğer childCategories yoksa)
      if (!mainCategory.childCategories && mainCategory.productCategories) {
        mainCategory.productCategories.forEach(productCatId => {
          subCategories.push({
            id: productCatId,
            name: productCatId.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            parentId: mainCategoryId,
            parentName: mainCategory.name,
            isActive: true,
            order: subCategories.length + 1
          });
        });
      }
    }
  });
  
  return subCategories;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isCourier, setIsCourier] = useState<boolean | null>(type === 'courier' ? true : false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  if (!type || (type !== 'customer' && type !== 'partner' && type !== 'courier')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <link rel="stylesheet" href="/403-error.css" />
        <div className="message">You are not authorized.</div>
        <div className="message2">You tried to access a page you did not have prior authorization for.</div>
        <div className="container">
          <div className="neon">403</div>
          <div className="door-frame">
            <div className="door">
              <div className="rectangle"></div>
              <div className="handle"></div>
              <div className="window">
                <div className="eye"></div>
                <div className="eye eye2"></div>
                <div className="leaf"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form validation states
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step state for partner registration
  const [step, setStep] = useState(0);

  // Person state for customer and partner registration
  const [person, setPerson] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    iban: "",
    birthDate: "",
    kepAddress: "",
  });

  // Google Maps - Sadece bir kez yükle
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    id: 'google-maps-script', // Script ID'si ile çakışmayı önle
  });

  // Firebase'den çekilen location verileri
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Customer profile photo
  const [customerProfilePhoto, setCustomerProfilePhoto] = useState<File | null>(null);
  const [customerProfilePhotoPreview, setCustomerProfilePhotoPreview] = useState<string | null>(null);
  const [storeInfo, setStoreInfo] = useState({
    storeName: "",
    taxId: "",
    companyName: "",
    storeType: "",
    branchCount: 1,
    isMainBranch: false,
    branchReferenceCode: "",
    corporateType: "",
    hasBranches: false,
    hasAuthorizedPersons: false,
    logo: null as File | null,
    categories: [] as string[],
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [authorizedPersons, setAuthorizedPersons] = useState<Array<{ firstName: string; lastName: string; phone: string; email: string; role: string; idCard: File | null }>>([]);
  const [documents, setDocuments] = useState({
    idCard: null as File | null,
    driversLicense: null as File | null,
    taxCertificate: null as File | null,
  });
  const [address, setAddress] = useState({
    province: "",
    district: "",
    neighborhood: "",
    street: "",
    detailedAddress: "",
    latitude: 0,
    longitude: 0,
  });

  // Firebase'den şehir, ilçe, mahalle verilerini çek
  useEffect(() => {
    const locationsRef = collection(db, 'locations');
    const unsubscribe = onSnapshot(locationsRef, (querySnapshot) => {
      const citiesData: string[] = [];
      querySnapshot.forEach((doc) => {
        citiesData.push(doc.id);
      });
      setCities(citiesData.sort());
      setLoadingLocations(false);
    }, (error) => {
      console.error('Konum verileri çekilirken hata:', error);
      setLoadingLocations(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Şehir seçildiğinde ilçeleri çek
  const fetchDistricts = async (city: string) => {
    try {
      const cityDoc = await getDoc(doc(db, 'locations', city));
      if (cityDoc.exists()) {
        const data = cityDoc.data();
        let districtsData = data.districts || [];
        
        const uniqueDistrictsMap = new Map();
        districtsData.forEach((district: any) => {
          if (!uniqueDistrictsMap.has(district.name)) {
            uniqueDistrictsMap.set(district.name, district);
          }
        });
        const uniqueDistricts = Array.from(uniqueDistrictsMap.values());
        
        setDistricts(uniqueDistricts.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // İlçe seçildiğinde mahalleleri çek
  const fetchNeighborhoods = async (city: string, districtName: string) => {
    try {
      const cityDoc = await getDoc(doc(db, 'locations', city));
      if (cityDoc.exists()) {
        const data = cityDoc.data();
        const districtsData = data.districts || [];
        const selectedDistrict = districtsData.find((d: any) => d.name === districtName);
        
        if (selectedDistrict && selectedDistrict.neighborhoods) {
          const neighborhoodsData = selectedDistrict.neighborhoods;
          const uniqueNeighborhoods = [...new Set(neighborhoodsData)].sort();
          setNeighborhoods(uniqueNeighborhoods as string[]);
        } else {
          setNeighborhoods([]);
        }
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      setNeighborhoods([]);
    }
  };

  const steps = isCourier ? [
    { title: "Kişi Bilgileri" },
    { title: "Evrak Bilgileri" },
    { title: "Adres Bilgileri" },
  ] : [
    { title: "Kişi Bilgileri" },
    { title: "Mağaza Bilgileri" },
    ...(storeInfo.hasAuthorizedPersons ? [{ title: "Yetkili Kişiler" }] : []),
    { title: "Evrak Bilgileri" },
    { title: "Adres Bilgileri" },
    { title: "Onay" },
  ];

  // Form validation functions
  const validatePersonInfo = () => {
    const errors: {[key: string]: string} = {};
    
    if (!person.firstName.trim()) errors.firstName = "Ad alanı zorunludur";
    if (!person.lastName.trim()) errors.lastName = "Soyad alanı zorunludur";
    if (!person.phone.trim()) errors.phone = "Telefon alanı zorunludur";
    if (!isCourier && !person.iban.trim()) errors.iban = "IBAN alanı zorunludur";
    if (!isCourier && !person.birthDate) errors.birthDate = "Doğum tarihi alanı zorunludur";
    
    // Email validation
    if (!person.email.trim()) {
      errors.email = "E-posta alanı zorunludur";
    } else if (formErrors.email && formErrors.email !== "E-posta alanı zorunludur") {
      errors.email = formErrors.email;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(person.email)) {
        errors.email = "Geçerli bir e-posta adresi giriniz";
      }
    }
    
    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (person.phone && !phoneRegex.test(person.phone.replace(/\s/g, ''))) {
      errors.phone = "Geçerli bir telefon numarası giriniz";
    }

    // Branch validation for store registration
    if (!isCourier && storeInfo.hasBranches && storeInfo.branchCount < 2) {
      errors.branchCount = "Şube sayısı en az 2 olmalıdır";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStoreInfo = () => {
    const errors: {[key: string]: string} = {};
    
    if (!storeInfo.storeName.trim()) errors.storeName = "Mağaza adı zorunludur";
    if (!storeInfo.corporateType) errors.corporateType = "Şirket türü zorunludur";
    if (storeInfo.corporateType && !storeInfo.taxId.trim()) {
      errors.taxId = `${storeInfo.corporateType === "PRIVATE" ? "TC Kimlik Numarası" : "Vergi Kimlik Numarası"} zorunludur`;
    }
    if (storeInfo.corporateType && storeInfo.corporateType !== "PRIVATE" && !storeInfo.companyName.trim()) {
      errors.companyName = "Şirket adı zorunludur";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAuthorizedPersons = () => {
    const errors: {[key: string]: string} = {};
    
    authorizedPersons.forEach((person, index) => {
      if (!person.firstName.trim()) errors[`authFirstName_${index}`] = `Yetkili kişi ${index + 1} adı zorunludur`;
      if (!person.lastName.trim()) errors[`authLastName_${index}`] = `Yetkili kişi ${index + 1} soyadı zorunludur`;
      if (!person.phone.trim()) errors[`authPhone_${index}`] = `Yetkili kişi ${index + 1} telefonu zorunludur`;
      if (!person.email.trim()) errors[`authEmail_${index}`] = `Yetkili kişi ${index + 1} e-posta adresi zorunludur`;
      if (!person.role) errors[`authRole_${index}`] = `Yetkili kişi ${index + 1} rolü zorunludur`;
      if (!person.idCard) errors[`authIdCard_${index}`] = `Yetkili kişi ${index + 1} kimlik fotokopisi zorunludur`;
      
      // Email validation for authorized persons
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (person.email && !emailRegex.test(person.email)) {
        errors[`authEmail_${index}`] = `Yetkili kişi ${index + 1} için geçerli bir e-posta adresi giriniz`;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = () => {
    const errors: {[key: string]: string} = {};
    
    if (!address.province) errors.province = "İl seçimi zorunludur";
    if (!address.district) errors.district = "İlçe seçimi zorunludur";
    if (!address.neighborhood) errors.neighborhood = "Mahalle seçimi zorunludur";
    if (!address.street.trim()) errors.street = "Sokak/Cadde alanı zorunludur";
    if (!address.detailedAddress.trim()) errors.detailedAddress = "Açık adres alanı zorunludur";
    if (!address.latitude || !address.longitude) errors.location = "Harita üzerinden konum seçimi zorunludur";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDocuments = () => {
    const errors: {[key: string]: string} = {};
    
    if (!documents.idCard) errors.idCard = "Kimlik fotoğrafı zorunludur";
    if (!isCourier && !documents.taxCertificate) errors.taxCertificate = "Vergi levhası zorunludur";
    if (isCourier && !documents.driversLicense) errors.driversLicense = "Ehliyet fotoğrafı zorunludur";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = async () => {
    const currentStepTitle = steps[step]?.title;
    let isValid = true;

    switch (currentStepTitle) {
      case "Kişi Bilgileri":
        // Email kontrolü yap
        await checkEmailExists(person.email);
        isValid = validatePersonInfo();
        // Also check if email validation is still in progress or has errors
        if (formErrors.email) {
          isValid = false;
        }
        break;
      case "Mağaza Bilgileri":
        isValid = validateStoreInfo();
        break;
      case "Yetkili Kişiler":
        isValid = validateAuthorizedPersons();
        // Also check if any authorized person email validation has errors
        const hasAuthEmailErrors = Object.keys(formErrors).some(key => key.startsWith('authEmail_') && formErrors[key]);
        if (hasAuthEmailErrors) {
          isValid = false;
        }
        break;
      case "Evrak Bilgileri":
        isValid = validateDocuments();
        break;
      case "Adres Bilgileri":
        isValid = validateAddress();
        break;
    }

    if (isValid) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      setFormErrors({});
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    setFormErrors({});
  };

  // URL parametresine göre isCourier state'ini ayarla
  useEffect(() => {
    if (type === 'courier') {
      setIsCourier(true);
    } else {
      setIsCourier(false);
    }
  }, [type]);

  // Logo preview cleanup
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // 6 haneli rakam içeren şifre oluşturucu
  function generateRandomPassword() {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Kullanıcı ID oluşturucu (6 haneli benzersiz sayı)
  function generateUserId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Cari ID oluşturucu (6 haneli benzersiz sayı)
  function generateBranchReferenceCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // E-posta kontrolü fonksiyonu
  const checkEmailExists = async (email: string, isAuthorizedPerson: boolean = false, personIndex?: number) => {
    const errorKey = personIndex !== undefined ? `authEmail_${personIndex}` : 'email';
    
    if (!email.trim()) {
      setFormErrors(prev => ({ 
        ...prev, 
        [errorKey]: 'E-posta alanı zorunludur' 
      }));
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors(prev => ({ 
        ...prev, 
        [errorKey]: 'Geçerli bir e-posta adresi giriniz' 
      }));
      return;
    }
    
    // Ana e-posta ile yetkili kişi e-postasının aynı olup olmadığını kontrol et
    if (isAuthorizedPerson && person?.email && email.toLowerCase() === person.email.toLowerCase()) {
      setFormErrors(prev => ({ 
        ...prev, 
        [errorKey]: 'Yetkili kişi e-posta adresi ana e-posta ile aynı olamaz.' 
      }));
      return;
    }
    
    try {
      const auth = getAuth();
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setFormErrors(prev => ({ 
          ...prev, 
          [errorKey]: 'Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.' 
        }));
        toast.error('Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        setFormErrors(prev => ({ ...prev, [errorKey]: '' }));
      }
    } catch (error) {
      console.error('E-posta kontrolü hatası:', error);
      // Hata durumunda sessizce geç
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress()) {
      setError("Lütfen tüm adres bilgilerini eksiksiz doldurun.");
      return;
    }

    setIsSubmitting(true);
    
    // Rastgele şifre oluştur
    const randomPassword = generateRandomPassword();

    // Benzersiz kullanıcı ID'si oluştur
    const userId = generateUserId();

    // Cari ID (mağaza için)
    const branchReferenceCode = isCourier ? undefined : storeInfo.branchReferenceCode;

    // Kayıt işlemi
    try {
      await register(person.email, randomPassword, isCourier ? 3 : 1, {
        userId, // Benzersiz kullanıcı ID'si
        firstName: person.firstName,
        lastName: person.lastName,
        phone: person.phone,
        ...(isCourier ? {} : {
          storeName: storeInfo.storeName,
          taxId: storeInfo.taxId,
          companyName: storeInfo.companyName,
          iban: person.iban,
          ibanOwnerBirthDate: person.birthDate,
          kepAddress: person.kepAddress,
          storeType: storeInfo.storeType,
          categories: [], // Kategori seçimi düzenleme modunda yapılacak
          subCategories: [], // Alt kategoriler düzenleme modunda belirlenecek
          branchCount: storeInfo.branchCount,
          isMainBranch: storeInfo.isMainBranch,
          corporateType: storeInfo.corporateType,
          branchReferenceCode,
          logo: storeInfo.logo,
          authorizedPersons: authorizedPersons,
          createdAt: new Date(), // Kayıt tarihi
        }),
        ...address,
        ...documents,
      });
    } catch (err) {
      toast.error('Kayıt işlemi başarısız. Lütfen tekrar deneyin.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsSubmitting(false);
      return;
    }

    // Şifreyi e-posta ile gönder
    try {
      await sendPasswordEmail({ to: person.email, password: randomPassword });
    } catch (err) {
      setError('Şifre e-posta ile gönderilemedi. Lütfen tekrar deneyin.');
      toast.error('Şifre e-posta ile gönderilemedi. Lütfen tekrar deneyin.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsSubmitting(false);
      return;
    }

    // Yetkili kişilere şifre ve yetkilendirme maili gönder
    if (!isCourier && storeInfo.hasAuthorizedPersons) {
      for (const authPerson of authorizedPersons) {
        if (authPerson.email) {
          const authPassword = generateRandomPassword();
          try {
            await sendPasswordEmail({ 
              to: authPerson.email, 
              password: authPassword,
              additionalData: {
                role: authPerson.role,
                storeName: storeInfo.storeName,
                isAuthorized: true
              }
            });
          } catch (err) {
            console.error(`Yetkili kişiye mail gönderilemedi: ${authPerson.email}`, err);
          }
        }
      }
    }

    setIsSubmitting(false);

    // Başarılı kayıt sonrası yönlendirme
    toast.success('Kayıt işlemi başarıyla tamamlandı! Yönlendiriliyorsunuz...', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    if (isCourier) {
      router.push("/partner");
    } else {
      router.push(`/partner/${branchReferenceCode}`);
    }
  };

  const renderStepContent = () => {
    if (isCourier) {
      return (
        <CourierRegistration
          step={step}
          setStep={setStep}
          person={person}
          setPerson={setPerson}
          documents={documents}
          setDocuments={setDocuments}
          address={address}
          setAddress={setAddress}
          formErrors={formErrors}
          checkEmailExists={checkEmailExists}
          cities={cities}
          loadingLocations={loadingLocations}
        />
      );
    } else {
      return (
        <StoreRegistration
          step={step}
          setStep={setStep}
          person={person}
          setPerson={setPerson}
          storeInfo={storeInfo}
          setStoreInfo={setStoreInfo}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          authorizedPersons={authorizedPersons}
          setAuthorizedPersons={setAuthorizedPersons}
          documents={documents}
          setDocuments={setDocuments}
          address={address}
          setAddress={setAddress}
          formErrors={formErrors}
          checkEmailExists={checkEmailExists}
          cities={cities}
          loadingLocations={loadingLocations}
          generateBranchReferenceCode={generateBranchReferenceCode}
          generateRandomPassword={generateRandomPassword}
          sendPasswordEmail={sendPasswordEmail}
        />
      );
    }
  };

  const renderAddressStep = () => {

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold mb-4">Adres Bilgileri</h3>
        <p className="text-sm text-gray-300 mb-4">Harita üzerinden DOĞRU konumunuzu seçin [ÖNERİLEN MANUEL KONUM SEÇİMİDİR ] ve adres bilgilerinizi doldurun.</p>

        {/* Google Maps */}
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative">
          {isLoaded ? (
            <>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{
                  lat: address.latitude || 39.9334,
                  lng: address.longitude || 32.8597
                }}
                zoom={address.latitude ? 15 : 6}
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
                {address.latitude && address.longitude && (
                  <Marker
                    position={{
                      lat: address.latitude,
                      lng: address.longitude
                    }}
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
              className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.province ? 'border-red-500' : 'border-gray-700'
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
              className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.district ? 'border-red-500' : 'border-gray-700'
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
              className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.neighborhood ? 'border-red-500' : 'border-gray-700'
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
              className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.street ? 'border-red-500' : 'border-gray-700'
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
              className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.detailedAddress ? 'border-red-500' : 'border-gray-700'
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
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Seçilen Konum:</h4>
            <div className="text-xs text-gray-400">
              Enlem: {address.latitude.toFixed(6)}, Boylam: {address.longitude.toFixed(6)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStepper = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, idx) => (
        <React.Fragment key={s.title}>
          <div className={`flex flex-col items-center ${idx === step ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx === step ? "border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900" : "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"}`}>
              {idx + 1}
            </div>
            <span className="mt-2 text-xs font-medium">{s.title}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Loading state göster
  if (isCourier === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            suppressHydrationWarning
          ></div>
          <p className="text-gray-600 dark:text-gray-400"></p>
        </div>
      </div>
    );
  }

  // Müşteri kayıt formu
  if (type === 'customer') {
    // Müşteri validasyon fonksiyonları
    const validateCustomerPersonInfo = () => {
      const errors: {[key: string]: string} = {};
      
      if (!person.firstName.trim()) errors.firstName = "Ad alanı zorunludur";
      if (!person.lastName.trim()) errors.lastName = "Soyad alanı zorunludur";
      
      // Email validation
      if (!person.email.trim()) {
        errors.email = "E-posta alanı zorunludur";
      } else if (formErrors.email && formErrors.email !== "E-posta alanı zorunludur") {
        errors.email = formErrors.email;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(person.email)) {
          errors.email = "Geçerli bir e-posta adresi giriniz";
        }
      }
      
      // Phone validation
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!person.phone.trim()) {
        errors.phone = "Telefon alanı zorunludur";
      } else if (!phoneRegex.test(person.phone.replace(/\s/g, ''))) {
        errors.phone = "Geçerli bir telefon numarası giriniz";
      }
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleCustomerSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError('');

      // Final validation - check person info only
      const personValid = validateCustomerPersonInfo();

      if (!personValid) {
        setError('Lütfen tüm alanları doğru şekilde doldurun.');
        setIsSubmitting(false);
        return;
      }

      // Email kontrolü (double check)
      try {
        const auth = getAuth();
        const signInMethods = await fetchSignInMethodsForEmail(auth, person.email);
        if (signInMethods.length > 0) {
          setError('Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.');
          setIsSubmitting(false);
          return;
        }
      } catch (emailError) {
        console.error('E-posta kontrolü hatası:', emailError);
      }

      // Rastgele şifre oluştur
      const randomPassword = generateRandomPassword();

      // Benzersiz kullanıcı ID'si oluştur
      const userId = generateUserId();

      // Müşteri kayıt işlemi (role = 4)
      try {
        await register(person.email, randomPassword, 4, {
          userId, // Benzersiz kullanıcı ID'si
          firstName: person.firstName,
          lastName: person.lastName,
          phone: person.phone,
        });
      } catch (err) {
        toast.error('Kayıt işlemi başarısız. Lütfen tekrar deneyin.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsSubmitting(false);
        return;
      }

      // Şifreyi e-posta ile gönder
      try {
        await sendPasswordEmail({ to: person.email, password: randomPassword });
      } catch (err) {
        setError('Şifre e-posta ile gönderilemedi. Lütfen tekrar deneyin.');
        toast.error('Şifre e-posta ile gönderilemedi. Lütfen tekrar deneyin.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);

      // Başarılı kayıt sonrası yönlendirme
      toast.success('Kayıt işlemi başarıyla tamamlandı! Yönlendiriliyorsunuz...', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Check if user was viewing a product page
      const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
      localStorage.removeItem('redirectAfterAuth');
      router.push(redirectPath);
    };

    const renderCustomerStepContent = () => {
      return (
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                {customerProfilePhotoPreview ? (
                  <img
                    src={customerProfilePhotoPreview}
                    alt="Profil fotoğrafı"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="customer-profile-photo"
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              <input
                id="customer-profile-photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCustomerProfilePhoto(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setCustomerProfilePhotoPreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Name and Surname in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad *</label>
              <input
                type="text"
                value={person.firstName}
                onChange={(e) => setPerson(p => ({ ...p, firstName: e.target.value }))}
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Adınız"
                required
              />
              {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Soyad *</label>
              <input
                type="text"
                value={person.lastName}
                onChange={(e) => setPerson(p => ({ ...p, lastName: e.target.value }))}
                className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Soyadınız"
                required
              />
              {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-posta *</label>
            <input
              type="email"
              value={person.email}
              onChange={(e) => setPerson(p => ({ ...p, email: e.target.value }))}
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="E-posta adresinizi girin"
              required
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefon *</label>
            <input
              type="tel"
              value={person.phone}
              onChange={(e) => setPerson(p => ({ ...p, phone: e.target.value }))}
              className={`w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Telefon numaranızı girin"
              required
            />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen flex items-stretch bg-gray-100 dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
        {/* Sol: SVG ve tanıtım */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gray-900" suppressHydrationWarning>
          <img src="/graphic3.svg" alt="Müşteri Kayıt Görseli" className="w-3/4 max-w-lg mx-auto" />
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Yummine Müşteri Kayıt</h2>
            <p className="text-gray-300 mb-6">Hesabınızı oluşturarak siparişlerinizi takip edin ve daha fazlasını keşfedin.</p>
          </div>
        </div>

        {/* Sağ: Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 bg-white text-gray-900 transition-colors duration-300 overflow-y-auto">
          <div className="max-w-lg w-full mx-auto">
            {/* Mobil için logo */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="text-2xl font-bold text-dark-600">Yummine.com</div>
            </div>

           

            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              {renderCustomerStepContent()}

              {error && (
                <div className="bg-red-100 text-red-700 rounded-lg p-3 flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-gray-500">Hesabınız var mı? </span>
                <Link href="/auth/login?type=customer" className="text-blue-600 hover:text-blue-800">
                  Giriş yapın
                </Link>
              </div>
            </form>
          </div>
        </div>

        <style jsx global>{`
          body {
            background: #f3f4f6;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background: #111827;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-gray-100 dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
      {/* Sol: SVG ve tanıtım */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gray-900" suppressHydrationWarning>
        <img src={isCourier ? '/graphic1.svg' : '/graphic5.svg'} alt="Kayıt Görseli" className="w-3/4 max-w-lg mx-auto" />
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{isCourier ? 'Yummine Kurye Kayıt' : 'Yummine Mağaza Kayıt'}</h2>
          <p className="text-gray-300 mb-6">Adım adım kolay kayıt süreciyle hemen başla!</p>
          <div className="group relative">
            <button
              type="button"
              onClick={() => {
                setIsCourier(!isCourier);
                setStep(0);
                setFormErrors({});
              }}
              className="ml-8 cursor-pointer"
            >
              {isCourier ? (
                <FaMotorcycle className="mr-12 w-12 h-12 hover:scale-125 duration-200 hover:text-blue-500" />
              ) : (
                <BsShop className="mr-12 w-12 h-12 hover:scale-125 duration-200  hover:text-green-500" />
              )}
            </button>
            <span className={`absolute -top-6 left-1/2 -translate-y-1/2 z-20 origin-left scale-0 px-3 rounded-lg border py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 ${
              isCourier 
                ? 'border-blue-400 bg-blue-500 text-white' 
                : 'border-green-400 bg-green-500 text-white'
            }`}>
              {isCourier ? 'Kurye Kaydı' : 'Mağaza Kaydı'}
            </span>
          </div>
        </div>
      </div>
      {/* Sağ: Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-6 py-12 bg-white text-gray-900 transition-colors duration-300">
        <div className="max-w-lg w-full mx-auto">
          {/* Mobil için sabit icon */}
          <div className="md:hidden flex justify-center mb-6">
            <div className="group relative">
              <button
                type="button"
                onClick={() => {
                  setIsCourier(!isCourier);
                  setStep(0);
                  setFormErrors({});
                }}
                className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
              >
                {isCourier ? (
                  <FaMotorcycle className="w-8 h-8 text-blue-500" />
                ) : (
                  <BsShop className="w-8 h-8 text-green-500" />
                )}
              </button>
              <span className={`absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 px-3 rounded-lg border py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100 ${
                isCourier 
                  ? 'border-blue-400 bg-blue-500 text-white' 
                  : 'border-green-400 bg-green-500 text-white'
              }`}>
                {isCourier ? 'KURYE' : 'MAĞAZA'}
              </span>
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{isCourier ? 'Kurye Kayıt' : 'Mağaza Kayıt'}</h1>
            <p className="text-gray-600">Aşağıdaki adımları tamamlayarak kaydınızı oluşturun.</p>
          </div>

          <div className="text-center mb-6">
            <span className="text-gray-500">Hesabınız var mı? </span>
            <Link href="/auth/login?type=partner" className="text-blue-600 hover:text-blue-800">
              Giriş yapmak istiyorum
            </Link>
          </div>

          {renderStepper()}
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderStepContent()}
            {/* Gizlilik politikası ve hata mesajı sadece son adımda */}
            {step === steps.length - 1 && (
              <div className="bg-gray-100 rounded-lg p-4 flex items-start">
                <input
                  id="privacy-policy"
                  name="privacy-policy"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  checked={privacyPolicyAccepted}
                  onChange={e => setPrivacyPolicyAccepted(e.target.checked)}
                />
                <label htmlFor="privacy-policy" className="ml-3 text-sm text-gray-700">
                  Gizlilik Politikasını kabul ediyorum.
                </label>
              </div>
            )}
            {error && (
              <div className="bg-red-100 text-red-700 rounded-lg p-3 flex items-center">
                <X className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            {/* Butonlar */}
            <div className="flex justify-between items-center">
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer"
                >
                  Geri
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-8 py-2 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
                >
                  İleri
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-8 py-2 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        .input {
          @apply w-full px-3 py-2 rounded-md bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500;
        }
        body {
          background: #f3f4f6;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background: #111827;
          }
        }
      `}</style>
    </div>
  );
}