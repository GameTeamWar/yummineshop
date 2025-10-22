// Bu script konum verilerini Firebase'e yüklemek için kullanılır
// Terminal'de çalıştırmak için: node scripts/load-locations.js

const fetch = require('node-fetch');

async function fetchTurkeyLocations() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/bertugfahriozer/il_ilce_mahalle/main/il-ilce-mahalle.json'
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return null;
  }
}

async function loadLocations() {
  try {
    console.log('Konum verileri yükleniyor...');

    // API'ye POST isteği gönder
    const response = await fetch('http://localhost:3000/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Başarılı:', result.message);
      console.log(`📊 ${result.cities} şehir verisi yüklendi`);
      console.log(`🔗 Kaynak: ${result.source}`);
    } else {
      console.error('❌ Hata:', result.error);
    }

  } catch (error) {
    console.error('Script hatası:', error);
  }
}

// Script çalıştır
loadLocations();