import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // Verify that the user owns this store
    const storeDoc = await adminDb.collection('stores').doc(id).get();
    if (!storeDoc.exists) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404 });
    }

    const storeData = storeDoc.data();
    if (storeData?.ownerId !== userId) {
      return NextResponse.json({ message: 'Unauthorized to view documents for this store' }, { status: 403 });
    }

    // Get documents
    const documentsSnapshot = await adminDb
      .collection('storeDocuments')
      .where('storeId', '==', id)
      .orderBy('uploadedAt', 'desc')
      .get();

    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({
      message: 'Failed to fetch documents'
    }, { status: 500 });
  }
}