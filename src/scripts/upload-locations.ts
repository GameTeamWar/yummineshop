import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// İstanbul ilçe ve mahalle verileri
const istanbulData = {
  districts: [
    {
      name: "Kadıköy",
      neighborhoods: [
        "Acıbadem", "Bostancı", "Caddebostan", "Caferağa", "Erenköy", "Fenerbahçe",
        "Feneryolu", "Göztepe", "Hasanpaşa", "Kadıköy", "Kalamış", "Kozyatağı",
        "Merdivenköy", "Osmanağa", "Rasihbey", "Sahrayıcedid", "Suadiye", "Zühtüpaşa"
      ]
    },
    {
      name: "Üsküdar",
      neighborhoods: [
        "Acıbadem", "Ahmediye", "Altunizade", "Beylerbeyi", "Bulgurlu", "Burhaniye",
        "Çengelköy", "Çınar", "Ferah", "Harem", "İcadiye", "Kandilli", "Kısıklı",
        "Kuzguncuk", "Libadiye", "Selamiçeşme", "Ünalan", "Üsküdar", "Vaniköy"
      ]
    },
    {
      name: "Beşiktaş",
      neighborhoods: [
        "Abbasağa", "Arnavutköy", "Bebek", "Beşiktaş", "Cihannüma", "Dikilitaş",
        "Etiler", "Gayrettepe", "Levent", "Levazım", "Maçka", "Ortaköy", "Rumelihisarı",
        "Sinanpaşa", "Türkali", "Ulus", "Yıldız"
      ]
    },
    {
      name: "Şişli",
      neighborhoods: [
        "19 Mayıs", "Bozkurt", "Cumhuriyet", "Duatepe", "Ergenekon", "Esentepe",
        "Feriköy", "Gülbahar", "Halaskargazi", "Halide Edip Adıvar", "Halil Rıfat Paşa",
        "Harbiye", "İzzetpaşa", "Kaptanpaşa", "Kocatepe", "Kurtuluş", "Mecidiyeköy",
        "Meşrutiyet", "Mim Kemal Öke", "Murat", "Nişantaşı", "Okçular", "Paşa",
        "Şişli", "Teşvikiye", "Tophane", "Yayla"
      ]
    },
    {
      name: "Beyoğlu",
      neighborhoods: [
        "Asmalımescit", "Bereketzade", "Bereketzade", "Cihangir", "Çukur", "Emek",
        "Evliya Çelebi", "Fatih", "Hacıahmet", "Halıcıoğlu", "Hasköy", "Hüseyinağa",
        "İstiklal", "Kadı", "Kamer Hatun", "Katip Mustafa Çelebi", "Kılıç Ali Paşa",
        "Kocatepe", "Kulaksız", "Kuloğlu", "Müeyyedzade", "Piyalepaşa", "Sütlüce",
        "Sururi", "Şahkulu", "Tomtom", "Yeniköy"
      ]
    },
    {
      name: "Fatih",
      neighborhoods: [
        "Aksaray", "Akşemsettin", "Ali Kuşçu", "Atikali", "Ayvansaray", "Balat",
        "Beyazıt", "Binbirdirek", "Cankurtaran", "Cerrahpaşa", "Çapa", "Derviş Ali",
        "Emin Sinan", "Hacı Kadın", "Haseki Sultan", "Hırka-i Şerif", "Hocapaşa",
        "İskenderpaşa", "Kadırga", "Karaköy", "Kemalpaşa", "Kıztaşı", "Kocamustafapaşa",
        "Kumkapı", "Mevlanakapı", "Mimar Hayrettin", "Mimar Kemalettin", "Molla Fenari",
        "Molla Gürani", "Müftü", "Nişanca", "Rüstempaşa", "Sarıdemir", "Sarıgüzel",
        "Sefaköy", "Seyyid Ömer", "Silivrikapı", "Sultan Ahmet", "Sururi", "Şehremini",
        "Şehsuvar Bey", "Topkapı", "Yavuz Sinan", "Yedikule", "Yenikapı", "Zeyrek"
      ]
    },
    {
      name: "Bakırköy",
      neighborhoods: [
        "Ataköy", "Bakırköy", "Başakşehir", "Başakşehir", "Cevizlik", "Kartaltepe",
        "Osmaniye", "Yenimahalle", "Yeşilköy", "Yeşilyurt", "Zeytinlik"
      ]
    },
    {
      name: "Avcılar",
      neighborhoods: [
        "Ambarlı", "Avcılar", "Beylikdüzü", "Cihangir", "Denizköşkler", "Firuzköy",
        "Gümüşpala", "Mustafa Kemal Paşa", "Tahtakale", "Yeşilbağlar"
      ]
    },
    {
      name: "Beylikdüzü",
      neighborhoods: [
        "Adnan Kahveci", "Barış", "Beylikdüzü", "Büyükçekmece", "Cumhuriyet", "Dereağzı",
        "Gürpınar", "Kavaklı", "Kumburgaz", "Marmara", "Yakuplu"
      ]
    },
    {
      name: "Büyükçekmece",
      neighborhoods: [
        "Ahmediye", "Alibeyköy", "Büyükçekmece", "Çakmaklı", "Çatalca", "Fatih",
        "Güzelce", "Halkalı", "İnceğiz", "Kamiloba", "Karacaköy", "Kumburgaz",
        "Mimarsinan", "Mustafakemalpaşa", "Orta", "Pınarca", "Sultançiftliği", "Tepecik"
      ]
    }
  ]
};

// Diğer şehirler için örnek veri
const ankaraData = {
  districts: [
    {
      name: "Çankaya",
      neighborhoods: [
        "Ağaçlı", "Akyurt", "Anıttepe", "Aşağı Dikmen", "Ataşehir", "Bahçelievler",
        "Balgat", "Çankaya", "Çukurambar", "Dikmen", "Emek", "Gaziosmanpaşa",
        "Güneşevler", "İlkadım", "Kavaklıdere", "Kızılırmak", "Kocatepe", "Maltepe",
        "Mamak", "Mühürdar", "Oran", "Öveçler", "Pursaklar", "Sıhhiye", "Tandoğan",
        "Ümitköy", "Yıldızevler", "Yukarı Dikmen"
      ]
    },
    {
      name: "Keçiören",
      neighborhoods: [
        "Aktepe", "Aşağı Eğlence", "Ata", "Atatürk", "Başak", "Çalseki", "Çiğdem",
        "Dede Korkut", "Etlik", "Gülhane", "Gültepe", "İncirli", "Kale", "Karacaören",
        "Kazım Karabekir", "Keçiören", "Kemal Türkler", "Kentkoop", "Kızılcaşar",
        "Kocatepe", "Koru", "Kuzey", "Lalahan", "Mamak", "Mühürdar", "Osmangazi",
        "Özerler", "Pınarbaşı", "Sarıbeyler", "Tepebaşı", "Yenimahalle"
      ]
    }
  ]
};

const izmirData = {
  districts: [
    {
      name: "Konak",
      neighborhoods: [
        "Alsancak", "Asmalımescit", "Atatürk", "Bahribaba", "Basmane", "Çankaya",
        "Göztepe", "Gültepe", "Hatay", "İzmir", "Karaköy", "Karataş", "Kemeraltı",
        "Konak", "Kültürpark", "Mersinli", "Montreux", "Narlıdere", "Pınarbaşı",
        "Sahilevleri", "Şair Eşref", "Turgut Reis", "Uğur Mumcu", "Üçkuyular"
      ]
    },
    {
      name: "Karşıyaka",
      neighborhoods: [
        "Alaybey", "Bahçelievler", "Bostanlı", "Çarşı", "Çiğli", "Donanmacı", "Eğitim",
        "Göztepe", "İnönü", "İsmet İnönü", "Karşıyaka", "Kızılay", "Mavişehir",
        "Nergiz", "Örnekköy", "Örnekköy", "Sahilevleri", "Yalı", "Yenimahalle"
      ]
    }
  ]
};

async function uploadLocationData() {
  try {
    console.log('Konum verileri yükleniyor...');

    // İstanbul verilerini yükle
    await setDoc(doc(db, 'locations', 'İstanbul'), istanbulData);
    console.log('İstanbul verileri yüklendi');

    // Ankara verilerini yükle
    await setDoc(doc(db, 'locations', 'Ankara'), ankaraData);
    console.log('Ankara verileri yüklendi');

    // İzmir verilerini yükle
    await setDoc(doc(db, 'locations', 'İzmir'), izmirData);
    console.log('İzmir verileri yüklendi');

    console.log('Tüm konum verileri başarıyla yüklendi!');
  } catch (error) {
    console.error('Konum verileri yüklenirken hata:', error);
  }
}

// Script çalıştır
uploadLocationData();
