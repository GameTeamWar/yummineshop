require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Firebase Admin SDK başlatma - .env dosyasından bilgiler
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: "fbsvc", // Firebase default
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL.replace('@', '%40')}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Detaylı kategori yapısı - Motor kurye ile taşınabilecek ürünler
const categories = [
  {
    id: 'kadin-erkek-giyim',
    name: "Kadın & Erkek Giyim",
    icon: "👕",
    color: "#FF6B9D",
    courierCompatible: true,
    isActive: true,
    order: 1,
    childCategories: ['erkek-giyim', 'kadin-giyim', 'unisex-giyim']
  },
  {
    id: 'erkek-giyim',
    name: "Erkek Giyim",
    icon: "👔",
    color: "#4A90E2",
    courierCompatible: true,
    isActive: true,
    order: 2,
    childCategories: ['erkek-tisort', 'erkek-gomlek', 'erkek-pantolon', 'erkek-ceket', 'erkek-mont', 'erkek-sweatshirt', 'erkek-esofman', 'erkek-sort', 'erkek-kazak', 'erkek-atlet', 'erkek-pijama', 'erkek-corap', 'erkek-ic-giyim']
  },
  {
    id: 'erkek-tisort',
    name: "Erkek Tişört",
    icon: "👕",
    color: "#7ED321",
    courierCompatible: true,
    isActive: true,
    order: 3,
    productCategories: ['tisort-kisa-kollu', 'tisort-uzun-kollu', 'tisort-polo', 'tisort-atlet', 'tisort-baskili', 'tisort-sportif']
  },
  {
    id: 'erkek-gomlek',
    name: "Erkek Gömlek",
    icon: "👔",
    color: "#BD10E0",
    courierCompatible: true,
    isActive: true,
    order: 4,
    productCategories: ['gomlek-keten', 'gomlek-pamuk', 'gomlek-resmi', 'gomlek-kasikli', 'gomlek-yelekli']
  },
  {
    id: 'erkek-pantolon',
    name: "Erkek Pantolon",
    icon: "👖",
    color: "#F5A623",
    courierCompatible: true,
    isActive: true,
    order: 5,
    productCategories: ['pantolon-jean', 'pantolon-kumas', 'pantolon-chino', 'pantolon-kargo', 'pantolon-sort', 'pantolon-yogun']
  },
  {
    id: 'erkek-ceket',
    name: "Erkek Ceket",
    icon: "🧥",
    color: "#D0021B",
    courierCompatible: true,
    isActive: true,
    order: 6,
    productCategories: ['ceket-blazer', 'ceket-yelek', 'ceket-mont', 'ceket-kaban', 'ceket-somunlu']
  },
  {
    id: 'erkek-mont',
    name: "Erkek Mont",
    icon: "🧥",
    color: "#9013FE",
    courierCompatible: true,
    isActive: true,
    order: 7,
    productCategories: ['mont-kislik', 'mont-yagmur', 'mont-deri', 'mont-kumas', 'mont-puffer']
  },
  {
    id: 'erkek-sweatshirt',
    name: "Erkek Sweatshirt",
    icon: "👕",
    color: "#50E3C2",
    courierCompatible: true,
    isActive: true,
    order: 8,
    productCategories: ['sweatshirt-basic', 'sweatshirt-hoodie', 'sweatshirt-zip', 'sweatshirt-kanguru', 'sweatshirt-baskili']
  },
  {
    id: 'erkek-esofman',
    name: "Erkek Eşofman",
    icon: "👖",
    color: "#B8E986",
    courierCompatible: true,
    isActive: true,
    order: 9,
    productCategories: ['esofman-takim', 'esofman-ust', 'esofman-alt', 'esofman-sportif']
  },
  {
    id: 'erkek-sort',
    name: "Erkek Şort",
    icon: "🩳",
    color: "#FF9500",
    courierCompatible: true,
    isActive: true,
    order: 10,
    productCategories: ['sort-jean', 'sort-kumas', 'sort-bermuda', 'sort-yuzme']
  },
  {
    id: 'erkek-kazak',
    name: "Erkek Kazak",
    icon: "🧶",
    color: "#FF6B9D",
    courierCompatible: true,
    isActive: true,
    order: 11,
    productCategories: ['kazak-yun', 'kazak-pamuk', 'kazak-triko', 'kazak-hirka', 'kazak-sweater']
  },
  {
    id: 'erkek-atlet',
    name: "Erkek Atlet",
    icon: "👕",
    color: "#4A90E2",
    courierCompatible: true,
    isActive: true,
    order: 12,
    productCategories: ['atlet-beyaz', 'atlet-renkli', 'atlet-sportif', 'atlet-viskoz']
  },
  {
    id: 'erkek-pijama',
    name: "Erkek Pijama",
    icon: "👔",
    color: "#7ED321",
    courierCompatible: true,
    isActive: true,
    order: 13,
    productCategories: ['pijama-takim', 'pijama-ust', 'pijama-alt', 'pijama-kislik']
  },
  {
    id: 'erkek-corap',
    name: "Erkek Çorap",
    icon: "🧦",
    color: "#BD10E0",
    courierCompatible: true,
    isActive: true,
    order: 14,
    productCategories: ['corap-sportif', 'corap-gunluk', 'corap-kislik', 'corap-cizgili']
  },
  {
    id: 'erkek-ic-giyim',
    name: "Erkek İç Giyim",
    icon: "👙",
    color: "#F5A623",
    courierCompatible: true,
    isActive: true,
    order: 15,
    productCategories: ['ic-giyim-kulot', 'ic-giyim-atlet', 'ic-giyim-fanila', 'ic-giyim-boxer']
  },
  {
    id: 'kadin-giyim',
    name: "Kadın Giyim",
    icon: "👗",
    color: "#FF6B9D",
    courierCompatible: true,
    isActive: true,
    order: 16,
    childCategories: ['kadin-elbise', 'kadin-tisort', 'kadin-bluz', 'kadin-gomlek', 'kadin-pantolon', 'kadin-etek', 'kadin-ceket', 'kadin-mont', 'kadin-sweatshirt', 'kadin-kazak', 'kadin-tayt', 'kadin-pijama', 'kadin-corap', 'kadin-ic-giyim']
  },
  {
    id: 'kadin-elbise',
    name: "Kadın Elbise",
    icon: "👗",
    color: "#FF1493",
    courierCompatible: true,
    isActive: true,
    order: 17,
    productCategories: ['elbise-gunluk', 'elbise-parti', 'elbise-uzun', 'elbise-kisa', 'elbise-yazlik', 'elbise-kislik', 'elbise-abiye']
  },
  {
    id: 'kadin-tisort',
    name: "Kadın Tişört",
    icon: "👚",
    color: "#32CD32",
    courierCompatible: true,
    isActive: true,
    order: 18,
    productCategories: ['tisort-kadin-kisa', 'tisort-kadin-uzun', 'tisort-kadin-baskili', 'tisort-kadin-sportif']
  },
  {
    id: 'kadin-bluz',
    name: "Kadın Bluz",
    icon: "👚",
    color: "#FF69B4",
    courierCompatible: true,
    isActive: true,
    order: 19,
    productCategories: ['bluz-keten', 'bluz-ipek', 'bluz-viskoz', 'bluz-resmi', 'bluz-gunluk']
  },
  {
    id: 'kadin-gomlek',
    name: "Kadın Gömlek",
    icon: "👔",
    color: "#8A2BE2",
    courierCompatible: true,
    isActive: true,
    order: 20,
    productCategories: ['gomlek-kadin-keten', 'gomlek-kadin-pamuk', 'gomlek-kadin-resmi', 'gomlek-kadin-kasikli']
  },
  {
    id: 'kadin-pantolon',
    name: "Kadın Pantolon",
    icon: "👖",
    color: "#DC143C",
    courierCompatible: true,
    isActive: true,
    order: 21,
    productCategories: ['pantolon-kadin-jean', 'pantolon-kadin-kumas', 'pantolon-kadin-dar', 'pantolon-kadin-genis', 'pantolon-kadin-sort']
  },
  {
    id: 'kadin-etek',
    name: "Kadın Etek",
    icon: "👗",
    color: "#FF4500",
    courierCompatible: true,
    isActive: true,
    order: 22,
    productCategories: ['etek-mini', 'etek-midi', 'etek-maxi', 'etek-kalem', 'etek-yayvan', 'etek-tulum']
  },
  {
    id: 'kadin-ceket',
    name: "Kadın Ceket",
    icon: "🧥",
    color: "#4169E1",
    courierCompatible: true,
    isActive: true,
    order: 23,
    productCategories: ['ceket-kadin-blazer', 'ceket-kadin-yelek', 'ceket-kadin-mont', 'ceket-kadin-kaban', 'ceket-kadin-deri']
  },
  {
    id: 'kadin-mont',
    name: "Kadın Mont",
    icon: "🧥",
    color: "#9932CC",
    courierCompatible: true,
    isActive: true,
    order: 24,
    productCategories: ['mont-kadin-kislik', 'mont-kadin-yagmur', 'mont-kadin-deri', 'mont-kadin-kumas', 'mont-kadin-puffer']
  },
  {
    id: 'kadin-sweatshirt',
    name: "Kadın Sweatshirt",
    icon: "👚",
    color: "#00CED1",
    courierCompatible: true,
    isActive: true,
    order: 25,
    productCategories: ['sweatshirt-kadin-basic', 'sweatshirt-kadin-hoodie', 'sweatshirt-kadin-zip', 'sweatshirt-kadin-baskili']
  },
  {
    id: 'kadin-kazak',
    name: "Kadın Kazak",
    icon: "🧶",
    color: "#FF6347",
    courierCompatible: true,
    isActive: true,
    order: 26,
    productCategories: ['kazak-kadin-yun', 'kazak-kadin-pamuk', 'kazak-kadin-triko', 'kazak-kadin-hirka', 'kazak-kadin-sweater']
  },
  {
    id: 'kadin-tayt',
    name: "Kadın Tayt",
    icon: "👖",
    color: "#20B2AA",
    courierCompatible: true,
    isActive: true,
    order: 27,
    productCategories: ['tayt-sportif', 'tayt-gunluk', 'tayt-kislik', 'tayt-siyah', 'tayt-renkli']
  },
  {
    id: 'kadin-pijama',
    name: "Kadın Pijama",
    icon: "👗",
    color: "#FF69B4",
    courierCompatible: true,
    isActive: true,
    order: 28,
    productCategories: ['pijama-kadin-takim', 'pijama-kadin-ust', 'pijama-kadin-alt', 'pijama-kadin-kislik']
  },
  {
    id: 'kadin-corap',
    name: "Kadın Çorap",
    icon: "🧦",
    color: "#9370DB",
    courierCompatible: true,
    isActive: true,
    order: 29,
    productCategories: ['corap-kadin-sportif', 'corap-kadin-gunluk', 'corap-kadin-kislik', 'corap-kadin-cizgili', 'corap-kadin-file']
  },
  {
    id: 'kadin-ic-giyim',
    name: "Kadın İç Giyim",
    icon: "👙",
    color: "#FF1493",
    courierCompatible: true,
    isActive: true,
    order: 30,
    productCategories: ['ic-giyim-kadin-kulot', 'ic-giyim-kadin-sutyen', 'ic-giyim-kadin-fanila', 'ic-giyim-kadin-pijama', 'ic-giyim-kadin-korse']
  },
  {
    id: 'unisex-giyim',
    name: "Unisex Giyim",
    icon: "👕",
    color: "#808080",
    courierCompatible: true,
    isActive: true,
    order: 31,
    childCategories: ['unisex-tisort', 'unisex-sweatshirt', 'unisex-pantolon', 'unisex-esofman', 'unisex-sort']
  },
  {
    id: 'unisex-tisort',
    name: "Unisex Tişört",
    icon: "👕",
    color: "#708090",
    courierCompatible: true,
    isActive: true,
    order: 32,
    productCategories: ['tisort-unisex-basic', 'tisort-unisex-baskili', 'tisort-unisex-sportif']
  },
  {
    id: 'unisex-sweatshirt',
    name: "Unisex Sweatshirt",
    icon: "👕",
    color: "#778899",
    courierCompatible: true,
    isActive: true,
    order: 33,
    productCategories: ['sweatshirt-unisex-hoodie', 'sweatshirt-unisex-zip', 'sweatshirt-unisex-basic']
  },
  {
    id: 'unisex-pantolon',
    name: "Unisex Pantolon",
    icon: "👖",
    color: "#696969",
    courierCompatible: true,
    isActive: true,
    order: 34,
    productCategories: ['pantolon-unisex-jean', 'pantolon-unisex-kargo', 'pantolon-unisex-sort']
  },
  {
    id: 'unisex-esofman',
    name: "Unisex Eşofman",
    icon: "👖",
    color: "#A9A9A9",
    courierCompatible: true,
    isActive: true,
    order: 35,
    productCategories: ['esofman-unisex-takim', 'esofman-unisex-ust', 'esofman-unisex-alt']
  },
  {
    id: 'unisex-sort',
    name: "Unisex Şort",
    icon: "🩳",
    color: "#D3D3D3",
    courierCompatible: true,
    isActive: true,
    order: 36,
    productCategories: ['sort-unisex-jean', 'sort-unisex-kumas', 'sort-unisex-yuzme']
  },
  {
    id: 'ayakkabi',
    name: "Ayakkabı",
    icon: "👟",
    color: "#8B4513",
    courierCompatible: true,
    isActive: true,
    order: 37,
    childCategories: ['erkek-ayakkabi', 'kadin-ayakkabi', 'unisex-ayakkabi']
  },
  {
    id: 'erkek-ayakkabi',
    name: "Erkek Ayakkabı",
    icon: "👞",
    color: "#654321",
    courierCompatible: true,
    isActive: true,
    order: 38,
    productCategories: ['ayakkabi-erkek-spor', 'ayakkabi-erkek-gunluk', 'ayakkabi-erkek-resmi', 'ayakkabi-erkek-bot', 'ayakkabi-erkek-terlik', 'ayakkabi-erkek-sandalet']
  },
  {
    id: 'kadin-ayakkabi',
    name: "Kadın Ayakkabı",
    icon: "👠",
    color: "#D2691E",
    courierCompatible: true,
    isActive: true,
    order: 39,
    productCategories: ['ayakkabi-kadin-topuklu', 'ayakkabi-kadin-spor', 'ayakkabi-kadin-gunluk', 'ayakkabi-kadin-bot', 'ayakkabi-kadin-terlik', 'ayakkabi-kadin-sandalet', 'ayakkabi-kadin-babet']
  },
  {
    id: 'unisex-ayakkabi',
    name: "Unisex Ayakkabı",
    icon: "👟",
    color: "#A0522D",
    courierCompatible: true,
    isActive: true,
    order: 40,
    productCategories: ['ayakkabi-unisex-spor', 'ayakkabi-unisex-gunluk', 'ayakkabi-unisex-terlik', 'ayakkabi-unisex-sandalet']
  },
  {
    id: 'aksesuar',
    name: "Aksesuar",
    icon: "🕶️",
    color: "#FFD700",
    courierCompatible: true,
    isActive: true,
    order: 41,
    childCategories: ['erkek-aksesuar', 'kadin-aksesuar', 'unisex-aksesuar']
  },
  {
    id: 'erkek-aksesuar',
    name: "Erkek Aksesuar",
    icon: "👔",
    color: "#FFA500",
    courierCompatible: true,
    isActive: true,
    order: 42,
    productCategories: ['aksesuar-erkek-saat', 'aksesuar-erkek-cuzdan', 'aksesuar-erkek-kemer', 'aksesuar-erkek-sapka', 'aksesuar-erkek-gozluk', 'aksesuar-erkek-kravat', 'aksesuar-erkek-papyon']
  },
  {
    id: 'kadin-aksesuar',
    name: "Kadın Aksesuar",
    icon: "💍",
    color: "#FF69B4",
    courierCompatible: true,
    isActive: true,
    order: 43,
    productCategories: ['aksesuar-kadin-canta', 'aksesuar-kadin-kupe', 'aksesuar-kadin-kolye', 'aksesuar-kadin-saat', 'aksesuar-kadin-gozluk', 'aksesuar-kadin-sapka', 'aksesuar-kadin-kemer', 'aksesuar-kadin-eldiven']
  },
  {
    id: 'unisex-aksesuar',
    name: "Unisex Aksesuar",
    icon: "🕶️",
    color: "#FFFF00",
    courierCompatible: true,
    isActive: true,
    order: 44,
    productCategories: ['aksesuar-unisex-saat', 'aksesuar-unisex-cuzdan', 'aksesuar-unisex-kemer', 'aksesuar-unisex-sapka', 'aksesuar-unisex-gozluk', 'aksesuar-unisex-canta']
  },
  {
    id: 'kisisel-bakim',
    name: "Kişisel Bakım",
    icon: "🧴",
    color: "#00CED1",
    courierCompatible: true,
    isActive: true,
    order: 45,
    childCategories: ['erkek-bakim', 'kadin-bakim', 'unisex-bakim']
  },
  {
    id: 'erkek-bakim',
    name: "Erkek Kişisel Bakım",
    icon: "🧴",
    color: "#40E0D0",
    courierCompatible: true,
    isActive: true,
    order: 46,
    productCategories: ['bakim-erkek-parfum', 'bakim-erkek-tiras', 'bakim-erkek-sac', 'bakim-erkek-cilt', 'bakim-erkek-deodorant', 'bakim-erkek-sampuan']
  },
  {
    id: 'kadin-bakim',
    name: "Kadın Kişisel Bakım",
    icon: "💄",
    color: "#FF1493",
    courierCompatible: true,
    isActive: true,
    order: 47,
    productCategories: ['bakim-kadin-parfum', 'bakim-kadin-makyaj', 'bakim-kadin-sac', 'bakim-kadin-cilt', 'bakim-kadin-deodorant', 'bakim-kadin-sampuan', 'bakim-kadin-vucut']
  },
  {
    id: 'unisex-bakim',
    name: "Unisex Kişisel Bakım",
    icon: "🧴",
    color: "#87CEEB",
    courierCompatible: true,
    isActive: true,
    order: 48,
    productCategories: ['bakim-unisex-parfum', 'bakim-unisex-sac', 'bakim-unisex-cilt', 'bakim-unisex-deodorant', 'bakim-unisex-sampuan', 'bakim-unisex-vucut']
  },
  {
    id: 'spor-malzemeleri',
    name: "Spor Malzemeleri",
    icon: "⚽",
    color: "#32CD32",
    courierCompatible: true,
    isActive: true,
    order: 49,
    childCategories: ['spor-giyim', 'spor-ayakkabi', 'spor-aksesuar']
  },
  {
    id: 'spor-giyim',
    name: "Spor Giyim",
    icon: "👕",
    color: "#228B22",
    courierCompatible: true,
    isActive: true,
    order: 50,
    productCategories: ['spor-tisort', 'spor-sweatshirt', 'spor-pantolon', 'spor-sort', 'spor-esofman', 'spor-mayo', 'spor-kulot']
  },
  {
    id: 'spor-ayakkabi',
    name: "Spor Ayakkabı",
    icon: "👟",
    color: "#006400",
    courierCompatible: true,
    isActive: true,
    order: 51,
    productCategories: ['spor-ayakkabi-kosu', 'spor-ayakkabi-futbol', 'spor-ayakkabi-basketbol', 'spor-ayakkabi-tenis', 'spor-ayakkabi-fitness']
  },
  {
    id: 'spor-aksesuar',
    name: "Spor Aksesuar",
    icon: "💪",
    color: "#008000",
    courierCompatible: true,
    isActive: true,
    order: 52,
    productCategories: ['spor-sise', 'spor-havlu', 'spor-canta', 'spor-eldiven', 'spor-bandaj', 'spor-matt']
  },
  {
    id: 'elektronik-aksesuar',
    name: "Elektronik Aksesuar",
    icon: "📱",
    color: "#1E90FF",
    courierCompatible: true,
    isActive: true,
    order: 53,
    childCategories: ['telefon-aksesuar', 'bilgisayar-aksesuar', 'kulaklik', 'sarj-cihazlari']
  },
  {
    id: 'telefon-aksesuar',
    name: "Telefon Aksesuar",
    icon: "📱",
    color: "#4169E1",
    courierCompatible: true,
    isActive: true,
    order: 54,
    productCategories: ['kılıf', 'ekran-koruyucu', 'sarj-kablosu', 'power-bank', 'kulaklık', 'selfie-çubuğu', 'telefon-standı']
  },
  {
    id: 'bilgisayar-aksesuar',
    name: "Bilgisayar Aksesuar",
    icon: "💻",
    color: "#000080",
    courierCompatible: true,
    isActive: true,
    order: 55,
    productCategories: ['mouse', 'klavye', 'mouse-pad', 'usb-bellegi', 'harici-disk', 'kulaklık', 'webcam']
  },
  {
    id: 'kulaklik',
    name: "Kulaklık",
    icon: "🎧",
    color: "#8A2BE2",
    courierCompatible: true,
    isActive: true,
    order: 56,
    productCategories: ['kulaklık-wireless', 'kulaklık-wired', 'kulaklık-bluetooth', 'kulaklık-over-ear', 'kulaklık-in-ear']
  },
  {
    id: 'sarj-cihazlari',
    name: "Şarj Cihazları",
    icon: "🔌",
    color: "#FF4500",
    courierCompatible: true,
    isActive: true,
    order: 57,
    productCategories: ['sarj-adaptoru', 'power-bank', 'kablosuz-sarj', 'sarj-kablosu', 'multi-sarj']
  },
  {
    id: 'kitap-kirtasiye',
    name: "Kitap & Kırtasiye",
    icon: "📚",
    color: "#8B4513",
    courierCompatible: true,
    isActive: true,
    order: 58,
    childCategories: ['kitap', 'kirtasiye', 'oyuncak']
  },
  {
    id: 'kitap',
    name: "Kitap",
    icon: "📖",
    color: "#654321",
    courierCompatible: true,
    isActive: true,
    order: 59,
    productCategories: ['roman', 'çocuk-kitabı', 'eğitim-kitabı', 'bilim-kurgu', 'tarih', 'biyografi', 'şiir', 'ders-kitabı']
  },
  {
    id: 'kirtasiye',
    name: "Kırtasiye",
    icon: "✏️",
    color: "#D2691E",
    courierCompatible: true,
    isActive: true,
    order: 60,
    productCategories: ['defter', 'kalem', 'silgi', 'cetvel', 'makas', 'boya', 'kağıt', 'dosya']
  },
  {
    id: 'oyuncak',
    name: "Oyuncak",
    icon: "🧸",
    color: "#FF6347",
    courierCompatible: true,
    isActive: true,
    order: 61,
    productCategories: ['oyuncak-araba', 'oyuncak-bebek', 'lego', 'puzzle', 'oyun-kartı', 'top', 'bisiklet']
  },
  {
    id: 'ev-yasam',
    name: "Ev & Yaşam",
    icon: "🏠",
    color: "#DEB887",
    courierCompatible: true,
    isActive: true,
    order: 62,
    childCategories: ['mutfak', 'dekorasyon', 'temizlik', 'banyo']
  },
  {
    id: 'mutfak',
    name: "Mutfak",
    icon: "🍳",
    color: "#F4A460",
    courierCompatible: true,
    isActive: true,
    order: 63,
    productCategories: ['bardak', 'çatal-kaşık', 'tencere', 'tava', 'tabak', 'kase', 'mutfak-robotu', 'blender']
  },
  {
    id: 'dekorasyon',
    name: "Dekorasyon",
    icon: "🖼️",
    color: "#D2B48C",
    courierCompatible: true,
    isActive: true,
    order: 64,
    productCategories: ['tablo', 'vazo', 'mum', 'yastık', 'halı', 'perde', 'çerçeve', 'saksı']
  },
  {
    id: 'temizlik',
    name: "Temizlik",
    icon: "🧽",
    color: "#708090",
    courierCompatible: true,
    isActive: true,
    order: 65,
    productCategories: ['deterjan', 'temizlik-bezi', 'fırça', 'çöp-torbası', 'temizlik-spray', 'bulaşık-makinesi-tableti']
  },
  {
    id: 'banyo',
    name: "Banyo",
    icon: "🛁",
    color: "#87CEEB",
    courierCompatible: true,
    isActive: true,
    order: 66,
    productCategories: ['havlu', 'sabun', 'şamuan', 'diş-fırçası', 'diş-macunu', 'banyo-paspası', 'duş-perdesi']
  },
  {
    id: 'hobi-sanat',
    name: "Hobi & Sanat",
    icon: "🎨",
    color: "#FF69B4",
    courierCompatible: true,
    isActive: true,
    order: 67,
    childCategories: ['sanat-malzemeleri', 'muzik', 'fotografcilik']
  },
  {
    id: 'sanat-malzemeleri',
    name: "Sanat Malzemeleri",
    icon: "🎨",
    color: "#FF1493",
    courierCompatible: true,
    isActive: true,
    order: 68,
    productCategories: ['boya', 'fırça', 'tuval', 'kalem', 'kağıt', 'heykel-macunu', 'palet']
  },
  {
    id: 'muzik',
    name: "Müzik",
    icon: "🎵",
    color: "#9370DB",
    courierCompatible: true,
    isActive: true,
    order: 69,
    productCategories: ['gitar', 'piyano', 'davul', 'mikrofon', 'kulaklık', 'müzik-kutusu']
  },
  {
    id: 'fotografcilik',
    name: "Fotoğrafçılık",
    icon: "📷",
    color: "#8B008B",
    courierCompatible: true,
    isActive: true,
    order: 70,
    productCategories: ['fotoğraf-makinesi', 'lens', 'tripod', 'hafıza-kartı', 'çanta', 'flaş']
  }
];

// Ürün kategorileri (productCategories koleksiyonu için)
const productCategories = [
  // Tişört kategorileri
  { id: 'tisort-kisa-kollu', name: 'Kısa Kollu Tişört', icon: '👕', color: '#7ED321', isActive: true, order: 1 },
  { id: 'tisort-uzun-kollu', name: 'Uzun Kollu Tişört', icon: '👕', color: '#7ED321', isActive: true, order: 2 },
  { id: 'tisort-polo', name: 'Polo Tişört', icon: '👕', color: '#7ED321', isActive: true, order: 3 },
  { id: 'tisort-atlet', name: 'Atlet', icon: '👕', color: '#7ED321', isActive: true, order: 4 },
  { id: 'tisort-baskili', name: 'Baskılı Tişört', icon: '👕', color: '#7ED321', isActive: true, order: 5 },
  { id: 'tisort-sportif', name: 'Sportif Tişört', icon: '👕', color: '#7ED321', isActive: true, order: 6 },

  // Gömlek kategorileri
  { id: 'gomlek-keten', name: 'Keten Gömlek', icon: '👔', color: '#BD10E0', isActive: true, order: 7 },
  { id: 'gomlek-pamuk', name: 'Pamuk Gömlek', icon: '👔', color: '#BD10E0', isActive: true, order: 8 },
  { id: 'gomlek-resmi', name: 'Resmi Gömlek', icon: '👔', color: '#BD10E0', isActive: true, order: 9 },
  { id: 'gomlek-kasikli', name: 'Kaşıklı Gömlek', icon: '👔', color: '#BD10E0', isActive: true, order: 10 },
  { id: 'gomlek-yelekli', name: 'Yelekli Gömlek', icon: '👔', color: '#BD10E0', isActive: true, order: 11 },

  // Pantolon kategorileri
  { id: 'pantolon-jean', name: 'Jean Pantolon', icon: '👖', color: '#F5A623', isActive: true, order: 12 },
  { id: 'pantolon-kumas', name: 'Kumaş Pantolon', icon: '👖', color: '#F5A623', isActive: true, order: 13 },
  { id: 'pantolon-chino', name: 'Chino Pantolon', icon: '👖', color: '#F5A623', isActive: true, order: 14 },
  { id: 'pantolon-kargo', name: 'Kargo Pantolon', icon: '👖', color: '#F5A623', isActive: true, order: 15 },
  { id: 'pantolon-sort', name: 'Şort', icon: '👖', color: '#F5A623', isActive: true, order: 16 },
  { id: 'pantolon-yogun', name: 'Yoğun Pantolon', icon: '👖', color: '#F5A623', isActive: true, order: 17 },

  // Kadın giyim kategorileri devamı...
  { id: 'elbise-gunluk', name: 'Günlük Elbise', icon: '👗', color: '#FF1493', isActive: true, order: 18 },
  { id: 'elbise-parti', name: 'Parti Elbisesi', icon: '👗', color: '#FF1493', isActive: true, order: 19 },
  { id: 'elbise-uzun', name: 'Uzun Elbise', icon: '👗', color: '#FF1493', isActive: true, order: 20 },
  { id: 'elbise-kisa', name: 'Kısa Elbise', icon: '👗', color: '#FF1493', isActive: true, order: 21 },
  { id: 'elbise-yazlik', name: 'Yazlık Elbise', icon: '👗', color: '#FF1493', isActive: true, order: 22 },
  { id: 'elbise-kislik', name: 'Kışlık Elbise', icon: '👗', color: '#FF1493', isActive: true, order: 23 },
  { id: 'elbise-abiye', name: 'Abiye Elbise', icon: '👗', color: '#FF1493', isActive: true, order: 24 },

  // Kadın tişört kategorileri
  { id: 'tisort-kadin-kisa', name: 'Kadın Kısa Kollu Tişört', icon: '👚', color: '#32CD32', isActive: true, order: 25 },
  { id: 'tisort-kadin-uzun', name: 'Kadın Uzun Kollu Tişört', icon: '👚', color: '#32CD32', isActive: true, order: 26 },
  { id: 'tisort-kadin-baskili', name: 'Kadın Baskılı Tişört', icon: '👚', color: '#32CD32', isActive: true, order: 27 },
  { id: 'tisort-kadin-sportif', name: 'Kadın Sportif Tişört', icon: '👚', color: '#32CD32', isActive: true, order: 28 },

  // Kadın bluz kategorileri
  { id: 'bluz-keten', name: 'Keten Bluz', icon: '👚', color: '#FF69B4', isActive: true, order: 29 },
  { id: 'bluz-ipek', name: 'İpek Bluz', icon: '👚', color: '#FF69B4', isActive: true, order: 30 },
  { id: 'bluz-viskoz', name: 'Viskoz Bluz', icon: '👚', color: '#FF69B4', isActive: true, order: 31 },
  { id: 'bluz-resmi', name: 'Resmi Bluz', icon: '👚', color: '#FF69B4', isActive: true, order: 32 },
  { id: 'bluz-gunluk', name: 'Günlük Bluz', icon: '👚', color: '#FF69B4', isActive: true, order: 33 },

  // Kadın gömlek kategorileri
  { id: 'gomlek-kadin-keten', name: 'Kadın Keten Gömlek', icon: '👔', color: '#8A2BE2', isActive: true, order: 34 },
  { id: 'gomlek-kadin-pamuk', name: 'Kadın Pamuk Gömlek', icon: '👔', color: '#8A2BE2', isActive: true, order: 35 },
  { id: 'gomlek-kadin-resmi', name: 'Kadın Resmi Gömlek', icon: '👔', color: '#8A2BE2', isActive: true, order: 36 },
  { id: 'gomlek-kadin-kasikli', name: 'Kadın Kaşıklı Gömlek', icon: '👔', color: '#8A2BE2', isActive: true, order: 37 },

  // Kadın pantolon kategorileri
  { id: 'pantolon-kadin-jean', name: 'Kadın Jean Pantolon', icon: '👖', color: '#DC143C', isActive: true, order: 38 },
  { id: 'pantolon-kadin-kumas', name: 'Kadın Kumaş Pantolon', icon: '👖', color: '#DC143C', isActive: true, order: 39 },
  { id: 'pantolon-kadin-dar', name: 'Kadın Dar Pantolon', icon: '👖', color: '#DC143C', isActive: true, order: 40 },
  { id: 'pantolon-kadin-genis', name: 'Kadın Geniş Pantolon', icon: '👖', color: '#DC143C', isActive: true, order: 41 },
  { id: 'pantolon-kadin-sort', name: 'Kadın Şort', icon: '👖', color: '#DC143C', isActive: true, order: 42 },

  // Kadın etek kategorileri
  { id: 'etek-mini', name: 'Mini Etek', icon: '👗', color: '#FF4500', isActive: true, order: 43 },
  { id: 'etek-midi', name: 'Midi Etek', icon: '👗', color: '#FF4500', isActive: true, order: 44 },
  { id: 'etek-maxi', name: 'Maxi Etek', icon: '👗', color: '#FF4500', isActive: true, order: 45 },
  { id: 'etek-kalem', name: 'Kalem Etek', icon: '👗', color: '#FF4500', isActive: true, order: 46 },
  { id: 'etek-yayvan', name: 'Yayvan Etek', icon: '👗', color: '#FF4500', isActive: true, order: 47 },
  { id: 'etek-tulum', name: 'Tulum Etek', icon: '👗', color: '#FF4500', isActive: true, order: 48 },

  // Kadın ceket kategorileri
  { id: 'ceket-kadin-blazer', name: 'Kadın Blazer', icon: '🧥', color: '#4169E1', isActive: true, order: 49 },
  { id: 'ceket-kadin-yelek', name: 'Kadın Yelek', icon: '🧥', color: '#4169E1', isActive: true, order: 50 },
  { id: 'ceket-kadin-mont', name: 'Kadın Mont', icon: '🧥', color: '#4169E1', isActive: true, order: 51 },
  { id: 'ceket-kadin-kaban', name: 'Kadın Kaban', icon: '🧥', color: '#4169E1', isActive: true, order: 52 },
  { id: 'ceket-kadin-deri', name: 'Kadın Deri Ceket', icon: '🧥', color: '#4169E1', isActive: true, order: 53 },

  // Kadın mont kategorileri
  { id: 'mont-kadin-kislik', name: 'Kadın Kışlık Mont', icon: '🧥', color: '#9932CC', isActive: true, order: 54 },
  { id: 'mont-kadin-yagmur', name: 'Kadın Yağmurluk', icon: '🧥', color: '#9932CC', isActive: true, order: 55 },
  { id: 'mont-kadin-deri', name: 'Kadın Deri Mont', icon: '🧥', color: '#9932CC', isActive: true, order: 56 },
  { id: 'mont-kadin-kumas', name: 'Kadın Kumaş Mont', icon: '🧥', color: '#9932CC', isActive: true, order: 57 },
  { id: 'mont-kadin-puffer', name: 'Kadın Puffer Mont', icon: '🧥', color: '#9932CC', isActive: true, order: 58 },

  // Kadın sweatshirt kategorileri
  { id: 'sweatshirt-kadin-basic', name: 'Kadın Basic Sweatshirt', icon: '👚', color: '#00CED1', isActive: true, order: 59 },
  { id: 'sweatshirt-kadin-hoodie', name: 'Kadın Hoodie', icon: '👚', color: '#00CED1', isActive: true, order: 60 },
  { id: 'sweatshirt-kadin-zip', name: 'Kadın Zip Sweatshirt', icon: '👚', color: '#00CED1', isActive: true, order: 61 },
  { id: 'sweatshirt-kadin-baskili', name: 'Kadın Baskılı Sweatshirt', icon: '👚', color: '#00CED1', isActive: true, order: 62 },

  // Kadın kazak kategorileri
  { id: 'kazak-kadin-yun', name: 'Kadın Yün Kazak', icon: '🧶', color: '#FF6347', isActive: true, order: 63 },
  { id: 'kazak-kadin-pamuk', name: 'Kadın Pamuk Kazak', icon: '🧶', color: '#FF6347', isActive: true, order: 64 },
  { id: 'kazak-kadin-triko', name: 'Kadın Triko Kazak', icon: '🧶', color: '#FF6347', isActive: true, order: 65 },
  { id: 'kazak-kadin-hirka', name: 'Kadın Hırka', icon: '🧶', color: '#FF6347', isActive: true, order: 66 },
  { id: 'kazak-kadin-sweater', name: 'Kadın Sweater', icon: '🧶', color: '#FF6347', isActive: true, order: 67 },

  // Kadın tayt kategorileri
  { id: 'tayt-sportif', name: 'Kadın Spor Tayt', icon: '👖', color: '#20B2AA', isActive: true, order: 68 },
  { id: 'tayt-gunluk', name: 'Kadın Günlük Tayt', icon: '👖', color: '#20B2AA', isActive: true, order: 69 },
  { id: 'tayt-kislik', name: 'Kadın Kışlık Tayt', icon: '👖', color: '#20B2AA', isActive: true, order: 70 },
  { id: 'tayt-siyah', name: 'Kadın Siyah Tayt', icon: '👖', color: '#20B2AA', isActive: true, order: 71 },
  { id: 'tayt-renkli', name: 'Kadın Renkli Tayt', icon: '👖', color: '#20B2AA', isActive: true, order: 72 },

  // Kadın pijama kategorileri
  { id: 'pijama-kadin-takim', name: 'Kadın Pijama Takımı', icon: '👗', color: '#FF69B4', isActive: true, order: 73 },
  { id: 'pijama-kadin-ust', name: 'Kadın Pijama Üstü', icon: '👗', color: '#FF69B4', isActive: true, order: 74 },
  { id: 'pijama-kadin-alt', name: 'Kadın Pijama Altı', icon: '👗', color: '#FF69B4', isActive: true, order: 75 },
  { id: 'pijama-kadin-kislik', name: 'Kadın Kışlık Pijama', icon: '👗', color: '#FF69B4', isActive: true, order: 76 },

  // Kadın çorap kategorileri
  { id: 'corap-kadin-sportif', name: 'Kadın Spor Çorap', icon: '🧦', color: '#9370DB', isActive: true, order: 77 },
  { id: 'corap-kadin-gunluk', name: 'Kadın Günlük Çorap', icon: '🧦', color: '#9370DB', isActive: true, order: 78 },
  { id: 'corap-kadin-kislik', name: 'Kadın Kışlık Çorap', icon: '🧦', color: '#9370DB', isActive: true, order: 79 },
  { id: 'corap-kadin-cizgili', name: 'Kadın Çizgili Çorap', icon: '🧦', color: '#9370DB', isActive: true, order: 80 },
  { id: 'corap-kadin-file', name: 'Kadın File Çorap', icon: '🧦', color: '#9370DB', isActive: true, order: 81 },

  // Kadın iç giyim kategorileri
  { id: 'ic-giyim-kadin-kulot', name: 'Kadın Kulot', icon: '👙', color: '#FF1493', isActive: true, order: 82 },
  { id: 'ic-giyim-kadin-sutyen', name: 'Kadın Sütyen', icon: '👙', color: '#FF1493', isActive: true, order: 83 },
  { id: 'ic-giyim-kadin-fanila', name: 'Kadın Fanila', icon: '👙', color: '#FF1493', isActive: true, order: 84 },
  { id: 'ic-giyim-kadin-pijama', name: 'Kadın İç Pijama', icon: '👙', color: '#FF1493', isActive: true, order: 85 },
  { id: 'ic-giyim-kadin-korse', name: 'Kadın Korse', icon: '👙', color: '#FF1493', isActive: true, order: 86 },

  // Unisex kategorileri
  { id: 'tisort-unisex-basic', name: 'Unisex Basic Tişört', icon: '👕', color: '#708090', isActive: true, order: 87 },
  { id: 'tisort-unisex-baskili', name: 'Unisex Baskılı Tişört', icon: '👕', color: '#708090', isActive: true, order: 88 },
  { id: 'tisort-unisex-sportif', name: 'Unisex Sportif Tişört', icon: '👕', color: '#708090', isActive: true, order: 89 },

  { id: 'sweatshirt-unisex-hoodie', name: 'Unisex Hoodie', icon: '👕', color: '#778899', isActive: true, order: 90 },
  { id: 'sweatshirt-unisex-zip', name: 'Unisex Zip Sweatshirt', icon: '👕', color: '#778899', isActive: true, order: 91 },
  { id: 'sweatshirt-unisex-basic', name: 'Unisex Basic Sweatshirt', icon: '👕', color: '#778899', isActive: true, order: 92 },

  { id: 'pantolon-unisex-jean', name: 'Unisex Jean Pantolon', icon: '👖', color: '#696969', isActive: true, order: 93 },
  { id: 'pantolon-unisex-kargo', name: 'Unisex Kargo Pantolon', icon: '👖', color: '#696969', isActive: true, order: 94 },
  { id: 'pantolon-unisex-sort', name: 'Unisex Şort', icon: '👖', color: '#696969', isActive: true, order: 95 },

  { id: 'esofman-unisex-takim', name: 'Unisex Eşofman Takımı', icon: '👖', color: '#A9A9A9', isActive: true, order: 96 },
  { id: 'esofman-unisex-ust', name: 'Unisex Eşofman Üstü', icon: '👖', color: '#A9A9A9', isActive: true, order: 97 },
  { id: 'esofman-unisex-alt', name: 'Unisex Eşofman Altı', icon: '👖', color: '#A9A9A9', isActive: true, order: 98 },

  { id: 'sort-unisex-jean', name: 'Unisex Jean Şort', icon: '🩳', color: '#D3D3D3', isActive: true, order: 99 },
  { id: 'sort-unisex-kumas', name: 'Unisex Kumaş Şort', icon: '🩳', color: '#D3D3D3', isActive: true, order: 100 },
  { id: 'sort-unisex-yuzme', name: 'Unisex Yüzme Şortu', icon: '🩳', color: '#D3D3D3', isActive: true, order: 101 },

  // Ayakkabı kategorileri
  { id: 'ayakkabi-erkek-spor', name: 'Erkek Spor Ayakkabı', icon: '👞', color: '#654321', isActive: true, order: 102 },
  { id: 'ayakkabi-erkek-gunluk', name: 'Erkek Günlük Ayakkabı', icon: '👞', color: '#654321', isActive: true, order: 103 },
  { id: 'ayakkabi-erkek-resmi', name: 'Erkek Resmi Ayakkabı', icon: '👞', color: '#654321', isActive: true, order: 104 },
  { id: 'ayakkabi-erkek-bot', name: 'Erkek Bot', icon: '👞', color: '#654321', isActive: true, order: 105 },
  { id: 'ayakkabi-erkek-terlik', name: 'Erkek Terlik', icon: '👞', color: '#654321', isActive: true, order: 106 },
  { id: 'ayakkabi-erkek-sandalet', name: 'Erkek Sandalet', icon: '👞', color: '#654321', isActive: true, order: 107 },

  { id: 'ayakkabi-kadin-topuklu', name: 'Kadın Topuklu Ayakkabı', icon: '👠', color: '#D2691E', isActive: true, order: 108 },
  { id: 'ayakkabi-kadin-spor', name: 'Kadın Spor Ayakkabı', icon: '👠', color: '#D2691E', isActive: true, order: 109 },
  { id: 'ayakkabi-kadin-gunluk', name: 'Kadın Günlük Ayakkabı', icon: '👠', color: '#D2691E', isActive: true, order: 110 },
  { id: 'ayakkabi-kadin-bot', name: 'Kadın Bot', icon: '👠', color: '#D2691E', isActive: true, order: 111 },
  { id: 'ayakkabi-kadin-terlik', name: 'Kadın Terlik', icon: '👠', color: '#D2691E', isActive: true, order: 112 },
  { id: 'ayakkabi-kadin-sandalet', name: 'Kadın Sandalet', icon: '👠', color: '#D2691E', isActive: true, order: 113 },
  { id: 'ayakkabi-kadin-babet', name: 'Kadın Babet', icon: '👠', color: '#D2691E', isActive: true, order: 114 },

  { id: 'ayakkabi-unisex-spor', name: 'Unisex Spor Ayakkabı', icon: '👟', color: '#A0522D', isActive: true, order: 115 },
  { id: 'ayakkabi-unisex-gunluk', name: 'Unisex Günlük Ayakkabı', icon: '👟', color: '#A0522D', isActive: true, order: 116 },
  { id: 'ayakkabi-unisex-terlik', name: 'Unisex Terlik', icon: '👟', color: '#A0522D', isActive: true, order: 117 },
  { id: 'ayakkabi-unisex-sandalet', name: 'Unisex Sandalet', icon: '👟', color: '#A0522D', isActive: true, order: 118 },

  // Aksesuar kategorileri
  { id: 'aksesuar-erkek-saat', name: 'Erkek Saat', icon: '👔', color: '#FFA500', isActive: true, order: 119 },
  { id: 'aksesuar-erkek-cuzdan', name: 'Erkek Cüzdan', icon: '👔', color: '#FFA500', isActive: true, order: 120 },
  { id: 'aksesuar-erkek-kemer', name: 'Erkek Kemer', icon: '👔', color: '#FFA500', isActive: true, order: 121 },
  { id: 'aksesuar-erkek-sapka', name: 'Erkek Şapka', icon: '👔', color: '#FFA500', isActive: true, order: 122 },
  { id: 'aksesuar-erkek-gozluk', name: 'Erkek Güneş Gözlüğü', icon: '👔', color: '#FFA500', isActive: true, order: 123 },
  { id: 'aksesuar-erkek-kravat', name: 'Erkek Kravat', icon: '👔', color: '#FFA500', isActive: true, order: 124 },
  { id: 'aksesuar-erkek-papyon', name: 'Erkek Papyon', icon: '👔', color: '#FFA500', isActive: true, order: 125 },

  { id: 'aksesuar-kadin-canta', name: 'Kadın Çanta', icon: '💍', color: '#FF69B4', isActive: true, order: 126 },
  { id: 'aksesuar-kadin-kupe', name: 'Kadın Küpe', icon: '💍', color: '#FF69B4', isActive: true, order: 127 },
  { id: 'aksesuar-kadin-kolye', name: 'Kadın Kolye', icon: '💍', color: '#FF69B4', isActive: true, order: 128 },
  { id: 'aksesuar-kadin-saat', name: 'Kadın Saat', icon: '💍', color: '#FF69B4', isActive: true, order: 129 },
  { id: 'aksesuar-kadin-gozluk', name: 'Kadın Güneş Gözlüğü', icon: '💍', color: '#FF69B4', isActive: true, order: 130 },
  { id: 'aksesuar-kadin-sapka', name: 'Kadın Şapka', icon: '💍', color: '#FF69B4', isActive: true, order: 131 },
  { id: 'aksesuar-kadin-kemer', name: 'Kadın Kemer', icon: '💍', color: '#FF69B4', isActive: true, order: 132 },
  { id: 'aksesuar-kadin-eldiven', name: 'Kadın Eldiven', icon: '💍', color: '#FF69B4', isActive: true, order: 133 },

  { id: 'aksesuar-unisex-saat', name: 'Unisex Saat', icon: '🕶️', color: '#FFFF00', isActive: true, order: 134 },
  { id: 'aksesuar-unisex-cuzdan', name: 'Unisex Cüzdan', icon: '🕶️', color: '#FFFF00', isActive: true, order: 135 },
  { id: 'aksesuar-unisex-kemer', name: 'Unisex Kemer', icon: '🕶️', color: '#FFFF00', isActive: true, order: 136 },
  { id: 'aksesuar-unisex-sapka', name: 'Unisex Şapka', icon: '🕶️', color: '#FFFF00', isActive: true, order: 137 },
  { id: 'aksesuar-unisex-gozluk', name: 'Unisex Güneş Gözlüğü', icon: '🕶️', color: '#FFFF00', isActive: true, order: 138 },
  { id: 'aksesuar-unisex-canta', name: 'Unisex Çanta', icon: '🕶️', color: '#FFFF00', isActive: true, order: 139 },

  // Kişisel bakım kategorileri
  { id: 'bakim-erkek-parfum', name: 'Erkek Parfüm', icon: '🧴', color: '#40E0D0', isActive: true, order: 140 },
  { id: 'bakim-erkek-tiras', name: 'Erkek Tıraş Ürünleri', icon: '🧴', color: '#40E0D0', isActive: true, order: 141 },
  { id: 'bakim-erkek-sac', name: 'Erkek Saç Bakımı', icon: '🧴', color: '#40E0D0', isActive: true, order: 142 },
  { id: 'bakim-erkek-cilt', name: 'Erkek Cilt Bakımı', icon: '🧴', color: '#40E0D0', isActive: true, order: 143 },
  { id: 'bakim-erkek-deodorant', name: 'Erkek Deodorant', icon: '🧴', color: '#40E0D0', isActive: true, order: 144 },
  { id: 'bakim-erkek-sampuan', name: 'Erkek Şampuan', icon: '🧴', color: '#40E0D0', isActive: true, order: 145 },

  { id: 'bakim-kadin-parfum', name: 'Kadın Parfüm', icon: '💄', color: '#FF1493', isActive: true, order: 146 },
  { id: 'bakim-kadin-makyaj', name: 'Kadın Makyaj', icon: '💄', color: '#FF1493', isActive: true, order: 147 },
  { id: 'bakim-kadin-sac', name: 'Kadın Saç Bakımı', icon: '💄', color: '#FF1493', isActive: true, order: 148 },
  { id: 'bakim-kadin-cilt', name: 'Kadın Cilt Bakımı', icon: '💄', color: '#FF1493', isActive: true, order: 149 },
  { id: 'bakim-kadin-deodorant', name: 'Kadın Deodorant', icon: '💄', color: '#FF1493', isActive: true, order: 150 },
  { id: 'bakim-kadin-sampuan', name: 'Kadın Şampuan', icon: '💄', color: '#FF1493', isActive: true, order: 151 },
  { id: 'bakim-kadin-vucut', name: 'Kadın Vücut Bakımı', icon: '💄', color: '#FF1493', isActive: true, order: 152 },

  { id: 'bakim-unisex-parfum', name: 'Unisex Parfüm', icon: '🧴', color: '#87CEEB', isActive: true, order: 153 },
  { id: 'bakim-unisex-sac', name: 'Unisex Saç Bakımı', icon: '🧴', color: '#87CEEB', isActive: true, order: 154 },
  { id: 'bakim-unisex-cilt', name: 'Unisex Cilt Bakımı', icon: '🧴', color: '#87CEEB', isActive: true, order: 155 },
  { id: 'bakim-unisex-deodorant', name: 'Unisex Deodorant', icon: '🧴', color: '#87CEEB', isActive: true, order: 156 },
  { id: 'bakim-unisex-sampuan', name: 'Unisex Şampuan', icon: '🧴', color: '#87CEEB', isActive: true, order: 157 },
  { id: 'bakim-unisex-vucut', name: 'Unisex Vücut Bakımı', icon: '🧴', color: '#87CEEB', isActive: true, order: 158 },

  // Spor malzemeleri kategorileri
  { id: 'spor-tisort', name: 'Spor Tişört', icon: '👕', color: '#228B22', isActive: true, order: 159 },
  { id: 'spor-sweatshirt', name: 'Spor Sweatshirt', icon: '👕', color: '#228B22', isActive: true, order: 160 },
  { id: 'spor-pantolon', name: 'Spor Pantolon', icon: '👖', color: '#228B22', isActive: true, order: 161 },
  { id: 'spor-sort', name: 'Spor Şort', icon: '🩳', color: '#228B22', isActive: true, order: 162 },
  { id: 'spor-esofman', name: 'Spor Eşofman', icon: '👖', color: '#228B22', isActive: true, order: 163 },
  { id: 'spor-mayo', name: 'Spor Mayo', icon: '🏊', color: '#228B22', isActive: true, order: 164 },
  { id: 'spor-kulot', name: 'Spor Kulot', icon: '👙', color: '#228B22', isActive: true, order: 165 },

  { id: 'spor-ayakkabi-kosu', name: 'Koşu Ayakkabı', icon: '👟', color: '#006400', isActive: true, order: 166 },
  { id: 'spor-ayakkabi-futbol', name: 'Futbol Ayakkabı', icon: '👟', color: '#006400', isActive: true, order: 167 },
  { id: 'spor-ayakkabi-basketbol', name: 'Basketbol Ayakkabı', icon: '👟', color: '#006400', isActive: true, order: 168 },
  { id: 'spor-ayakkabi-tenis', name: 'Tenis Ayakkabı', icon: '👟', color: '#006400', isActive: true, order: 169 },
  { id: 'spor-ayakkabi-fitness', name: 'Fitness Ayakkabı', icon: '👟', color: '#006400', isActive: true, order: 170 },

  { id: 'spor-sise', name: 'Spor Şişe', icon: '💪', color: '#008000', isActive: true, order: 171 },
  { id: 'spor-havlu', name: 'Spor Havlu', icon: '💪', color: '#008000', isActive: true, order: 172 },
  { id: 'spor-canta', name: 'Spor Çanta', icon: '💪', color: '#008000', isActive: true, order: 173 },
  { id: 'spor-eldiven', name: 'Spor Eldiven', icon: '💪', color: '#008000', isActive: true, order: 174 },
  { id: 'spor-bandaj', name: 'Spor Bandaj', icon: '💪', color: '#008000', isActive: true, order: 175 },
  { id: 'spor-matt', name: 'Spor Mat', icon: '💪', color: '#008000', isActive: true, order: 176 },

  // Elektronik aksesuar kategorileri
  { id: 'kılıf', name: 'Telefon Kılıfı', icon: '📱', color: '#4169E1', isActive: true, order: 177 },
  { id: 'ekran-koruyucu', name: 'Ekran Koruyucu', icon: '📱', color: '#4169E1', isActive: true, order: 178 },
  { id: 'sarj-kablosu', name: 'Şarj Kablosu', icon: '📱', color: '#4169E1', isActive: true, order: 179 },
  { id: 'power-bank', name: 'Power Bank', icon: '📱', color: '#4169E1', isActive: true, order: 180 },
  { id: 'kulaklık', name: 'Kulaklık', icon: '📱', color: '#4169E1', isActive: true, order: 181 },
  { id: 'selfie-çubuğu', name: 'Selfie Çubuğu', icon: '📱', color: '#4169E1', isActive: true, order: 182 },
  { id: 'telefon-standı', name: 'Telefon Standı', icon: '📱', color: '#4169E1', isActive: true, order: 183 },

  { id: 'mouse', name: 'Mouse', icon: '💻', color: '#000080', isActive: true, order: 184 },
  { id: 'klavye', name: 'Klavye', icon: '💻', color: '#000080', isActive: true, order: 185 },
  { id: 'mouse-pad', name: 'Mouse Pad', icon: '💻', color: '#000080', isActive: true, order: 186 },
  { id: 'usb-bellegi', name: 'USB Bellek', icon: '💻', color: '#000080', isActive: true, order: 187 },
  { id: 'harici-disk', name: 'Harici Disk', icon: '💻', color: '#000080', isActive: true, order: 188 },
  { id: 'webcam', name: 'Webcam', icon: '💻', color: '#000080', isActive: true, order: 189 },

  { id: 'kulaklık-wireless', name: 'Wireless Kulaklık', icon: '🎧', color: '#8A2BE2', isActive: true, order: 190 },
  { id: 'kulaklık-wired', name: 'Wired Kulaklık', icon: '🎧', color: '#8A2BE2', isActive: true, order: 191 },
  { id: 'kulaklık-bluetooth', name: 'Bluetooth Kulaklık', icon: '🎧', color: '#8A2BE2', isActive: true, order: 192 },
  { id: 'kulaklık-over-ear', name: 'Over-Ear Kulaklık', icon: '🎧', color: '#8A2BE2', isActive: true, order: 193 },
  { id: 'kulaklık-in-ear', name: 'In-Ear Kulaklık', icon: '🎧', color: '#8A2BE2', isActive: true, order: 194 },

  { id: 'sarj-adaptoru', name: 'Şarj Adaptörü', icon: '🔌', color: '#FF4500', isActive: true, order: 195 },
  { id: 'kablosuz-sarj', name: 'Kablosuz Şarj', icon: '🔌', color: '#FF4500', isActive: true, order: 196 },
  { id: 'multi-sarj', name: 'Multi Şarj Cihazı', icon: '🔌', color: '#FF4500', isActive: true, order: 197 },

  // Kitap & kırtasiye kategorileri
  { id: 'roman', name: 'Roman', icon: '📖', color: '#654321', isActive: true, order: 198 },
  { id: 'çocuk-kitabı', name: 'Çocuk Kitabı', icon: '📖', color: '#654321', isActive: true, order: 199 },
  { id: 'eğitim-kitabı', name: 'Eğitim Kitabı', icon: '📖', color: '#654321', isActive: true, order: 200 },
  { id: 'bilim-kurgu', name: 'Bilim Kurgu', icon: '📖', color: '#654321', isActive: true, order: 201 },
  { id: 'tarih', name: 'Tarih Kitabı', icon: '📖', color: '#654321', isActive: true, order: 202 },
  { id: 'biyografi', name: 'Biyografi', icon: '📖', color: '#654321', isActive: true, order: 203 },
  { id: 'şiir', name: 'Şiir Kitabı', icon: '📖', color: '#654321', isActive: true, order: 204 },
  { id: 'ders-kitabı', name: 'Ders Kitabı', icon: '📖', color: '#654321', isActive: true, order: 205 },

  { id: 'defter', name: 'Defter', icon: '✏️', color: '#D2691E', isActive: true, order: 206 },
  { id: 'kalem', name: 'Kalem', icon: '✏️', color: '#D2691E', isActive: true, order: 207 },
  { id: 'silgi', name: 'Silgi', icon: '✏️', color: '#D2691E', isActive: true, order: 208 },
  { id: 'cetvel', name: 'Cetvel', icon: '✏️', color: '#D2691E', isActive: true, order: 209 },
  { id: 'makas', name: 'Makas', icon: '✏️', color: '#D2691E', isActive: true, order: 210 },
  { id: 'boya', name: 'Boya', icon: '✏️', color: '#D2691E', isActive: true, order: 211 },
  { id: 'kağıt', name: 'Kağıt', icon: '✏️', color: '#D2691E', isActive: true, order: 212 },
  { id: 'dosya', name: 'Dosya', icon: '✏️', color: '#D2691E', isActive: true, order: 213 },

  { id: 'oyuncak-araba', name: 'Oyuncak Araba', icon: '🧸', color: '#FF6347', isActive: true, order: 214 },
  { id: 'oyuncak-bebek', name: 'Oyuncak Bebek', icon: '🧸', color: '#FF6347', isActive: true, order: 215 },
  { id: 'lego', name: 'Lego', icon: '🧸', color: '#FF6347', isActive: true, order: 216 },
  { id: 'puzzle', name: 'Puzzle', icon: '🧸', color: '#FF6347', isActive: true, order: 217 },
  { id: 'oyun-kartı', name: 'Oyun Kartı', icon: '🧸', color: '#FF6347', isActive: true, order: 218 },
  { id: 'top', name: 'Top', icon: '🧸', color: '#FF6347', isActive: true, order: 219 },
  { id: 'bisiklet', name: 'Bisiklet', icon: '🧸', color: '#FF6347', isActive: true, order: 220 },

  // Ev & yaşam kategorileri
  { id: 'bardak', name: 'Bardak', icon: '🍳', color: '#F4A460', isActive: true, order: 221 },
  { id: 'çatal-kaşık', name: 'Çatal Kaşık', icon: '🍳', color: '#F4A460', isActive: true, order: 222 },
  { id: 'tencere', name: 'Tencere', icon: '🍳', color: '#F4A460', isActive: true, order: 223 },
  { id: 'tava', name: 'Tava', icon: '🍳', color: '#F4A460', isActive: true, order: 224 },
  { id: 'tabak', name: 'Tabak', icon: '🍳', color: '#F4A460', isActive: true, order: 225 },
  { id: 'kase', name: 'Kase', icon: '🍳', color: '#F4A460', isActive: true, order: 226 },
  { id: 'mutfak-robotu', name: 'Mutfak Robotu', icon: '🍳', color: '#F4A460', isActive: true, order: 227 },
  { id: 'blender', name: 'Blender', icon: '🍳', color: '#F4A460', isActive: true, order: 228 },

  { id: 'tablo', name: 'Tablo', icon: '🖼️', color: '#D2B48C', isActive: true, order: 229 },
  { id: 'vazo', name: 'Vazo', icon: '🖼️', color: '#D2B48C', isActive: true, order: 230 },
  { id: 'mum', name: 'Mum', icon: '🖼️', color: '#D2B48C', isActive: true, order: 231 },
  { id: 'yastık', name: 'Yastık', icon: '🖼️', color: '#D2B48C', isActive: true, order: 232 },
  { id: 'halı', name: 'Halı', icon: '🖼️', color: '#D2B48C', isActive: true, order: 233 },
  { id: 'perde', name: 'Perde', icon: '🖼️', color: '#D2B48C', isActive: true, order: 234 },
  { id: 'çerçeve', name: 'Çerçeve', icon: '🖼️', color: '#D2B48C', isActive: true, order: 235 },
  { id: 'saksı', name: 'Saksı', icon: '🖼️', color: '#D2B48C', isActive: true, order: 236 },

  { id: 'deterjan', name: 'Deterjan', icon: '🧽', color: '#708090', isActive: true, order: 237 },
  { id: 'temizlik-bezi', name: 'Temizlik Bezi', icon: '🧽', color: '#708090', isActive: true, order: 238 },
  { id: 'fırça', name: 'Fırça', icon: '🧽', color: '#708090', isActive: true, order: 239 },
  { id: 'çöp-torbası', name: 'Çöp Torbası', icon: '🧽', color: '#708090', isActive: true, order: 240 },
  { id: 'temizlik-spray', name: 'Temizlik Spray', icon: '🧽', color: '#708090', isActive: true, order: 241 },
  { id: 'bulaşık-makinesi-tableti', name: 'Bulaşık Makinesi Tableti', icon: '🧽', color: '#708090', isActive: true, order: 242 },

  { id: 'havlu', name: 'Havlu', icon: '🛁', color: '#87CEEB', isActive: true, order: 243 },
  { id: 'sabun', name: 'Sabun', icon: '🛁', color: '#87CEEB', isActive: true, order: 244 },
  { id: 'şamuan', name: 'Şampuan', icon: '🛁', color: '#87CEEB', isActive: true, order: 245 },
  { id: 'diş-fırçası', name: 'Diş Fırçası', icon: '🛁', color: '#87CEEB', isActive: true, order: 246 },
  { id: 'diş-macunu', name: 'Diş Macunu', icon: '🛁', color: '#87CEEB', isActive: true, order: 247 },
  { id: 'banyo-paspası', name: 'Banyo Paspası', icon: '🛁', color: '#87CEEB', isActive: true, order: 248 },
  { id: 'duş-perdesi', name: 'Duş Perdesi', icon: '🛁', color: '#87CEEB', isActive: true, order: 249 },

  // Hobi & sanat kategorileri
  { id: 'boya', name: 'Boya', icon: '🎨', color: '#FF1493', isActive: true, order: 250 },
  { id: 'fırça', name: 'Fırça', icon: '🎨', color: '#FF1493', isActive: true, order: 251 },
  { id: 'tuval', name: 'Tuval', icon: '🎨', color: '#FF1493', isActive: true, order: 252 },
  { id: 'kalem', name: 'Kalem', icon: '🎨', color: '#FF1493', isActive: true, order: 253 },
  { id: 'kağıt', name: 'Kağıt', icon: '🎨', color: '#FF1493', isActive: true, order: 254 },
  { id: 'heykel-macunu', name: 'Heykel Macunu', icon: '🎨', color: '#FF1493', isActive: true, order: 255 },
  { id: 'palet', name: 'Palet', icon: '🎨', color: '#FF1493', isActive: true, order: 256 },

  { id: 'gitar', name: 'Gitar', icon: '🎵', color: '#9370DB', isActive: true, order: 257 },
  { id: 'piyano', name: 'Piyano', icon: '🎵', color: '#9370DB', isActive: true, order: 258 },
  { id: 'davul', name: 'Davul', icon: '🎵', color: '#9370DB', isActive: true, order: 259 },
  { id: 'mikrofon', name: 'Mikrofon', icon: '🎵', color: '#9370DB', isActive: true, order: 260 },
  { id: 'müzik-kutusu', name: 'Müzik Kutusu', icon: '🎵', color: '#9370DB', isActive: true, order: 261 },

  { id: 'fotoğraf-makinesi', name: 'Fotoğraf Makinesi', icon: '📷', color: '#8B008B', isActive: true, order: 262 },
  { id: 'lens', name: 'Lens', icon: '📷', color: '#8B008B', isActive: true, order: 263 },
  { id: 'tripod', name: 'Tripod', icon: '📷', color: '#8B008B', isActive: true, order: 264 },
  { id: 'hafıza-kartı', name: 'Hafıza Kartı', icon: '📷', color: '#8B008B', isActive: true, order: 265 },
  { id: 'çanta', name: 'Fotoğraf Çantası', icon: '📷', color: '#8B008B', isActive: true, order: 266 },
  { id: 'flaş', name: 'Flaş', icon: '📷', color: '#8B008B', isActive: true, order: 267 },

  // Erkek giyim devamı
  { id: 'ceket-blazer', name: 'Blazer Ceket', icon: '🧥', color: '#D0021B', isActive: true, order: 268 },
  { id: 'ceket-yelek', name: 'Yelek', icon: '🧥', color: '#D0021B', isActive: true, order: 269 },
  { id: 'ceket-mont', name: 'Mont', icon: '🧥', color: '#D0021B', isActive: true, order: 270 },
  { id: 'ceket-kaban', name: 'Kaban', icon: '🧥', color: '#D0021B', isActive: true, order: 271 },
  { id: 'ceket-somunlu', name: 'Şömünlü Ceket', icon: '🧥', color: '#D0021B', isActive: true, order: 272 },

  { id: 'mont-kislik', name: 'Kışlık Mont', icon: '🧥', color: '#9013FE', isActive: true, order: 273 },
  { id: 'mont-yagmur', name: 'Yağmurluk', icon: '🧥', color: '#9013FE', isActive: true, order: 274 },
  { id: 'mont-deri', name: 'Deri Mont', icon: '🧥', color: '#9013FE', isActive: true, order: 275 },
  { id: 'mont-kumas', name: 'Kumaş Mont', icon: '🧥', color: '#9013FE', isActive: true, order: 276 },
  { id: 'mont-puffer', name: 'Puffer Mont', icon: '🧥', color: '#9013FE', isActive: true, order: 277 },

  { id: 'sweatshirt-basic', name: 'Basic Sweatshirt', icon: '👕', color: '#50E3C2', isActive: true, order: 278 },
  { id: 'sweatshirt-hoodie', name: 'Hoodie', icon: '👕', color: '#50E3C2', isActive: true, order: 279 },
  { id: 'sweatshirt-zip', name: 'Zip Sweatshirt', icon: '👕', color: '#50E3C2', isActive: true, order: 280 },
  { id: 'sweatshirt-kanguru', name: 'Kanguru Sweatshirt', icon: '👕', color: '#50E3C2', isActive: true, order: 281 },
  { id: 'sweatshirt-baskili', name: 'Baskılı Sweatshirt', icon: '👕', color: '#50E3C2', isActive: true, order: 282 },

  { id: 'esofman-takim', name: 'Eşofman Takımı', icon: '👖', color: '#B8E986', isActive: true, order: 283 },
  { id: 'esofman-ust', name: 'Eşofman Üstü', icon: '👖', color: '#B8E986', isActive: true, order: 284 },
  { id: 'esofman-alt', name: 'Eşofman Altı', icon: '👖', color: '#B8E986', isActive: true, order: 285 },
  { id: 'esofman-sportif', name: 'Sportif Eşofman', icon: '👖', color: '#B8E986', isActive: true, order: 286 },

  { id: 'sort-jean', name: 'Jean Şort', icon: '🩳', color: '#FF9500', isActive: true, order: 287 },
  { id: 'sort-kumas', name: 'Kumaş Şort', icon: '🩳', color: '#FF9500', isActive: true, order: 288 },
  { id: 'sort-bermuda', name: 'Bermuda Şort', icon: '🩳', color: '#FF9500', isActive: true, order: 289 },
  { id: 'sort-yuzme', name: 'Yüzme Şortu', icon: '🩳', color: '#FF9500', isActive: true, order: 290 },

  { id: 'kazak-yun', name: 'Yün Kazak', icon: '🧶', color: '#FF6B9D', isActive: true, order: 291 },
  { id: 'kazak-pamuk', name: 'Pamuk Kazak', icon: '🧶', color: '#FF6B9D', isActive: true, order: 292 },
  { id: 'kazak-triko', name: 'Triko Kazak', icon: '🧶', color: '#FF6B9D', isActive: true, order: 293 },
  { id: 'kazak-hirka', name: 'Hırka', icon: '🧶', color: '#FF6B9D', isActive: true, order: 294 },
  { id: 'kazak-sweater', name: 'Sweater', icon: '🧶', color: '#FF6B9D', isActive: true, order: 295 },

  { id: 'atlet-beyaz', name: 'Beyaz Atlet', icon: '👕', color: '#4A90E2', isActive: true, order: 296 },
  { id: 'atlet-renkli', name: 'Renkli Atlet', icon: '👕', color: '#4A90E2', isActive: true, order: 297 },
  { id: 'atlet-sportif', name: 'Sportif Atlet', icon: '👕', color: '#4A90E2', isActive: true, order: 298 },
  { id: 'atlet-viskoz', name: 'Viskoz Atlet', icon: '👕', color: '#4A90E2', isActive: true, order: 299 },

  { id: 'pijama-takim', name: 'Pijama Takımı', icon: '👔', color: '#7ED321', isActive: true, order: 300 },
  { id: 'pijama-ust', name: 'Pijama Üstü', icon: '👔', color: '#7ED321', isActive: true, order: 300 },
  { id: 'pijama-alt', name: 'Pijama Altı', icon: '👔', color: '#7ED321', isActive: true, order: 301 },
  { id: 'pijama-kislik', name: 'Kışlık Pijama', icon: '👔', color: '#7ED321', isActive: true, order: 302 },

  { id: 'corap-sportif', name: 'Sportif Çorap', icon: '🧦', color: '#BD10E0', isActive: true, order: 303 },
  { id: 'corap-gunluk', name: 'Günlük Çorap', icon: '🧦', color: '#BD10E0', isActive: true, order: 304 },
  { id: 'corap-kislik', name: 'Kışlık Çorap', icon: '🧦', color: '#BD10E0', isActive: true, order: 305 },
  { id: 'corap-cizgili', name: 'Çizgili Çorap', icon: '🧦', color: '#BD10E0', isActive: true, order: 306 },

  { id: 'ic-giyim-kulot', name: 'Kulot', icon: '👙', color: '#F5A623', isActive: true, order: 307 },
  { id: 'ic-giyim-atlet', name: 'İç Atlet', icon: '👙', color: '#F5A623', isActive: true, order: 308 },
  { id: 'ic-giyim-fanila', name: 'Fanila', icon: '👙', color: '#F5A623', isActive: true, order: 309 },
  { id: 'ic-giyim-boxer', name: 'Boxer', icon: '👙', color: '#F5A623', isActive: true, order: 310 }
];

// Ana kategorileri ve ürün kategorilerini Firebase'e yükleme
async function uploadCategories() {
  try {
    console.log('Kategoriler yükleniyor...');

    // Ana kategorileri yükle
    const categoriesRef = db.collection('categories');
    for (const category of categories) {
      await categoriesRef.doc(category.id).set({
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Kategori yüklendi: ${category.name}`);
    }

    // Ürün kategorilerini yükle
    const productCategoriesRef = db.collection('productCategories');
    for (const productCategory of productCategories) {
      await productCategoriesRef.doc(productCategory.id).set({
        ...productCategory,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Ürün kategorisi yüklendi: ${productCategory.name}`);
    }

    console.log('Tüm kategoriler başarıyla yüklendi!');
    console.log(`Toplam ${categories.length} ana kategori ve ${productCategories.length} ürün kategorisi yüklendi.`);

  } catch (error) {
    console.error('Kategori yükleme hatası:', error);
  }
}

// Script çalıştır
uploadCategories();