const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Firebase Admin initialize
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function extractAndUploadCategories() {
  console.log('📂 Trendyol kategorilerini çıkarıp Firebase\'e yüklüyor...\n');

  try {
    // HTML dosyasını oku
    const htmlPath = path.join(__dirname, 'trendyol_categories.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Cheerio ile parse et
    const $ = cheerio.load(htmlContent);

    const siteCategories = [];
    const productCategories = [];

    // Her kategori öğesini işle
    $('.category-item').each((index, element) => {
      const $element = $(element);

      // Ana kategori adını al (site category)
      const siteCategoryName = $element.find('.category-titles').text().trim();

      if (siteCategoryName) {
        const siteCategory = {
          name: siteCategoryName,
          description: `${siteCategoryName} kategorisindeki mağazalar`,
          icon: getCategoryIcon(siteCategoryName),
          color: getCategoryColor(siteCategoryName),
          isActive: true,
          sortOrder: index + 1,
          storeCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        siteCategories.push(siteCategory);

        // Alt kategorileri al (product categories)
        const subCategories = [];
        $element.find('.category-sub-title').each((subIndex, subElement) => {
          const subCategoryName = $(subElement).find('a').attr('title') || $(subElement).find('a').text().trim();

          if (subCategoryName) {
            const productCategory = {
              name: subCategoryName,
              description: `${subCategoryName} ürünleri`,
              parentId: null, // Daha sonra site kategori ID'si ile güncellenecek
              isActive: true,
              sortOrder: subIndex + 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            subCategories.push(productCategory);
          }
        });

        productCategories.push(...subCategories);
      }
    });

    console.log(`📊 Bulunan site kategorileri: ${siteCategories.length}`);
    console.log(`📊 Bulunan ürün kategorileri: ${productCategories.length}\n`);

    // Site kategorilerini yükle
    console.log('🏪 Site kategorilerini yüklüyor...');
    const siteCategoryRefs = [];
    for (const category of siteCategories) {
      const docRef = await db.collection('siteCategories').add(category);
      siteCategoryRefs.push({ id: docRef.id, name: category.name });
      console.log(`✅ ${category.name} site kategorisi eklendi (ID: ${docRef.id})`);
    }

    // Ürün kategorilerini yükle ve parent ID'lerini ayarla
    console.log('\n🛍️ Ürün kategorilerini yüklüyor...');
    let productIndex = 0;
    for (let i = 0; i < siteCategories.length; i++) {
      const siteCategoryRef = siteCategoryRefs[i];
      const subCategoriesCount = $('.category-item').eq(i).find('.category-sub-title').length;

      for (let j = 0; j < subCategoriesCount; j++) {
        const productCategory = productCategories[productIndex];
        productCategory.parentId = siteCategoryRef.id;

        const docRef = await db.collection('productCategories').add(productCategory);
        console.log(`✅ ${productCategory.name} ürün kategorisi eklendi (Parent: ${siteCategoryRef.name}, ID: ${docRef.id})`);
        productIndex++;
      }
    }

    console.log('\n🎉 Tüm kategoriler başarıyla yüklendi!');
    console.log(`📊 Toplam site kategorisi: ${siteCategories.length}`);
    console.log(`📊 Toplam ürün kategorisi: ${productCategories.length}`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
  }
}

// Kategori için ikon önerisi
function getCategoryIcon(categoryName) {
  const iconMap = {
    'Kadın Giyim': '👗',
    'Erkek Giyim': '👔',
    'Ayakkabı': '👟',
    'Aksesuar & Çanta': '👜',
    'Anne & Bebek': '👶',
    'Çocuk': '🧒',
    'Ev & Yaşam': '🏠',
    'Elektronik': '📱',
    'Spor & Outdoor': '⚽',
    'Kozmetik & Kişisel Bakım': '💄',
    'Süpermarket': '🛒',
    'Kitap, Müzik, Film, Hobi': '📚',
    'Otomotiv & Motosiklet': '🚗',
  };

  return iconMap[categoryName] || '📦';
}

// Kategori için renk önerisi
function getCategoryColor(categoryName) {
  const colorMap = {
    'Kadın Giyim': '#FF6B9D',
    'Erkek Giyim': '#4A90E2',
    'Ayakkabı': '#F5A623',
    'Aksesuar & Çanta': '#E94B3C',
    'Anne & Bebek': '#50E3C2',
    'Çocuk': '#B8E986',
    'Ev & Yaşam': '#9013FE',
    'Elektronik': '#7ED321',
    'Spor & Outdoor': '#D0021B',
    'Kozmetik & Kişisel Bakım': '#F8E71C',
    'Süpermarket': '#BD10E0',
    'Kitap, Müzik, Film, Hobi': '#417505',
    'Otomotiv & Motosiklet': '#9B9B9B',
  };

  return colorMap[categoryName] || '#DDA0DD';
}

extractAndUploadCategories();