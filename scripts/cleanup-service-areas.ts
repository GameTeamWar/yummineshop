const { collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
const { db } = require('../src/lib/firebase.ts');

async function cleanupServiceAreas() {
  try {
    console.log('ServiceAreas koleksiyonunu temizleme işlemi başlatılıyor...');

    const serviceAreasRef = collection(db, 'serviceAreas');
    const snapshot = await getDocs(serviceAreasRef);

    console.log(`${snapshot.size} adet doküman bulundu`);

    const deletePromises = snapshot.docs.map(async (document) => {
      console.log(`Doküman siliniyor: ${document.id}`);
      await deleteDoc(doc(db, 'serviceAreas', document.id));
    });

    await Promise.all(deletePromises);
    console.log('Tüm serviceAreas dokümanları başarıyla silindi');

  } catch (error) {
    console.error('Hata oluştu:', error);
  }
}

// Sadece bu dosya çalıştırıldığında çalışsın
if (require.main === module) {
  cleanupServiceAreas();
}

module.exports = { cleanupServiceAreas };