const admin = require('firebase-admin');
const serviceAccount = require('../yuminiserviceaccount-be273-firebase-adminsdk-fbsvc-3781e0b272.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Function to generate 11-digit ID (like Turkish ID)
function generate11DigitId() {
  // Simple random 11-digit number
  return Math.floor(Math.random() * 90000000000) + 10000000000;
}

// Function to check if ID is unique
async function isIdUnique(id) {
  const storesRef = db.collection('stores');
  const storesSnapshot = await storesRef.get();

  for (const storeDoc of storesSnapshot.docs) {
    const productsRef = storeDoc.ref.collection('products');
    const productDoc = await productsRef.doc(id.toString()).get();
    if (productDoc.exists) {
      return false;
    }
  }
  return true;
}

// Function to generate unique 11-digit ID
async function generateUnique11DigitId() {
  let id;
  let attempts = 0;
  do {
    id = generate11DigitId();
    attempts++;
    if (attempts > 1000) {
      throw new Error('Could not generate unique ID after 1000 attempts');
    }
  } while (!(await isIdUnique(id)));
  return id;
}

async function updateProductIds() {
  try {
    const storesRef = db.collection('stores');
    const storesSnapshot = await storesRef.get();

    console.log('Updating product IDs to 11-digit format...');

    for (const storeDoc of storesSnapshot.docs) {
      console.log(`Processing store: ${storeDoc.id}`);

      const productsRef = storeDoc.ref.collection('products');
      const productsSnapshot = await productsRef.get();

      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const newId = await generateUnique11DigitId();

        console.log(`Updating product ${productDoc.id} to new ID ${newId}`);

        // Create new document with new ID
        await productsRef.doc(newId.toString()).set(productData);

        // Delete old document
        await productsRef.doc(productDoc.id).delete();

        console.log(`Product ${productDoc.id} updated to ${newId}`);
      }
    }

    console.log('All product IDs updated successfully!');
  } catch (error) {
    console.error('Error updating product IDs:', error);
  } finally {
    admin.app().delete();
  }
}

updateProductIds();