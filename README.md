# Yummine - E-Ticaret Platformu

Yummine, mağazalar, müşteriler ve kuryeler için kapsamlı bir e-ticaret platformudur. Next.js, Tailwind CSS, Firebase ve Google servisleri ile geliştirilmiştir.

## Özellikler

- **Güvenli Kimlik Doğrulama**: Firebase Authentication ile rol tabanlı erişim
- **Mağaza Yönetimi**: Ürün ekleme, stok kontrolü, sipariş yönetimi
- **Müşteri Alışverişi**: Kolay ürün arama, sepet ve ödeme
- **Kurye Hizmeti**: Harita entegrasyonu ile teslimat yönetimi
- **Admin Paneli**: Kullanıcı ve sistem yönetimi
- **Mobil Uygulamalar**: React Native ile kurye, mağaza ve müşteri uygulamaları
- **Gerçek Zamanlı Bildirimler**: Firebase Cloud Messaging
- **Socket.io Entegrasyonu**: Gerçek zamanlı güncellemeler

## Teknoloji Stack

- **Frontend**: Next.js 15, Tailwind CSS, TypeScript
- **Backend**: Firebase (Firestore, Auth, Storage, Messaging)
- **Haritalar**: Google Maps API
- **Mobil**: React Native / Expo
- **Gerçek Zamanlı**: Socket.io, Firestore onSnapshot

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Firebase konfigürasyonunu ayarlayın (.env.local dosyası mevcut)

3. **VAPID Key Alın** (Bildirimler için gerekli):
   - Firebase Console'a gidin
   - Proje ayarları > Cloud Messaging
   - Web Push certificates bölümünde "Generate Key Pair" tıklayın
   - Oluşan key'i `.env.local`'da `NEXT_PUBLIC_FIREBASE_VAPID_KEY` olarak ayarlayın

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Mobil uygulamalar için:
```bash
cd YummineCourier
npx expo start
```

## Roller

- **Admin (0)**: Sistem yönetimi
- **Mağaza (1)**: Ürün ve sipariş yönetimi
- **Müşteri (2)**: Alışveriş
- **Kurye (3)**: Teslimat
- **Alt Kullanıcı (5)**: Mağaza alt rolleri

## API Anahtarları

- Firebase: Gerçek projeye bağlı
- Google Maps: Places, Maps JavaScript, Geocoding API'leri aktif

## Dağıtım

Vercel, Netlify veya kendi sunucunuzda dağıtabilirsiniz. Firebase hosting önerilir.

## Lisans

Bu proje özel kullanım içindir.
