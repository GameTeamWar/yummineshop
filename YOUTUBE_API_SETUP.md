# YouTube API Kurulumu - Yorum Videoları

Bu kılavuz, ürün yorumlarına video ekleme özelliği için YouTube API'sinin nasıl kurulacağını açıklar.

## 🚀 Kurulum Adımları

### 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Sol üstte "Select a project" > "New Project" tıklayın
3. Proje adını girin (örn: "yummineshop-youtube")
4. Proje oluşturulduktan sonra seçin

### 2. YouTube Data API v3 Etkinleştirme

1. Sol menüden "APIs & Services" > "Library" tıklayın
2. Arama kutusuna "YouTube Data API v3" yazın
3. "YouTube Data API v3" seçeneğini bulun ve "Enable" tıklayın

### 3. OAuth Consent Screen Oluşturma

1. Sol menüden "APIs & Services" > "OAuth consent screen" tıklayın
2. User Type olarak "External" seçin
3. App name: "Yummine Shop"
4. User support email: Sizin email adresiniz
5. Developer contact information: Sizin email adresiniz
6. "Save and Continue" tıklayın
7. Scopes sayfasında "Save and Continue" (şimdilik scope eklemeyeceğiz)
8. Test users ekleyin (kendi email adresinizi)
9. "Save and Continue" tıklayın

### 4. OAuth 2.0 Client ID Oluşturma

1. Sol menüden "APIs & Services" > "Credentials" tıklayın
2. Üstte "+ CREATE CREDENTIALS" > "OAuth 2.0 Client IDs" tıklayın
3. Application type: "Web application"
4. Name: "Yummine Shop Web Client"
5. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/youtube/callback`
   - Production: `https://yourdomain.com/api/auth/youtube/callback`
6. "Create" tıklayın
7. Client ID ve Client Secret'ı kaydedin

### 5. Environment Variables Ayarlama

`.env.local` dosyasına aşağıdaki değerleri ekleyin:

```bash
# YouTube API Configuration
YT_CLIENT_ID=your_client_id_here
YT_CLIENT_SECRET=your_client_secret_here
YT_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
```

### 6. Yetkilendirme ve Token Alma

YouTube API'ye erişim için bir kez yetkilendirme yapmanız gerekir:

1. Aşağıdaki URL'i tarayıcınızda açın:
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/auth/youtube/callback&scope=https://www.googleapis.com/auth/youtube.upload&response_type=code&access_type=offline
```

2. YouTube hesabınıza giriş yapın
3. İzinleri onaylayın
4. Redirect URL'den authorization code'u alın
5. Code'u kullanarak access token ve refresh token alın

### 7. Token'ları Environment Variables'a Ekleme

Aldığınız token'ları `.env.local` dosyasına ekleyin:

```bash
YT_ACCESS_TOKEN=your_access_token_here
YT_REFRESH_TOKEN=your_refresh_token_here
```

## 📋 API Özellikleri

### Video Yükleme
- **Privacy**: Unlisted (sadece link ile erişilebilir)
- **Maksimum boyut**: YouTube limitlerine tabii
- **Desteklenen formatlar**: MP4, AVI, MOV, WMV, FLV, WebM

### Görsel Yükleme
- **Maksimum boyut**: 5MB
- **Desteklenen formatlar**: JPG, PNG, GIF, WebP
- **Depolama**: `public/reviews/` klasörü

## 🔧 Teknik Detaylar

### API Routes
- `POST /api/upload-youtube` - Video yükleme
- `POST /api/upload-image` - Görsel yükleme

### Güvenlik
- Video yüklemeleri YouTube'un unlisted privacy ayarıyla yapılır
- Görseller local storage'da saklanır
- Dosya boyutu ve tip kontrolleri yapılır

### Hata Yönetimi
- Network hatalarında kullanıcı dostu mesajlar
- Geçersiz dosya formatlarında uyarı
- Yükleme sırasında loading göstergeleri

## 🚨 Önemli Notlar

1. **Quota Limitleri**: YouTube API'nin günlük kota limitleri vardır
2. **Token Refresh**: Access token'lar zamanla expires olur, refresh token ile yenilenir
3. **Production**: Production'da HTTPS kullanın ve gerçek domain ekleyin
4. **Güvenlik**: Client secret'ı asla client-side kodda kullanmayın

## 🐛 Sorun Giderme

### "Access blocked" hatası
- OAuth consent screen'de test user olarak email'inizi ekleyin

### "Invalid scope" hatası
- Scope'u doğru şekilde ayarladığınızdan emin olun: `https://www.googleapis.com/auth/youtube.upload`

### Token expired hatası
- Refresh token kullanarak yeni access token alın

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Google Cloud Console'daki API dashboard'u kontrol edin
2. YouTube API quota kullanımını kontrol edin
3. Browser console'da hata mesajlarını inceleyin