import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';

async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ message: 'File and type are required' }, { status: 400 });
    }

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
      return NextResponse.json({ message: 'Unauthorized to upload documents for this store' }, { status: 403 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Invalid file type. Only PDF and images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
    }

    // Upload to Firebase Storage
    const bucket = getStorage().bucket();
    const fileName = `documents/${id}/${type}/${Date.now()}_${file.name}`;
    const fileRef = bucket.file(fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: userId,
          storeId: id,
          documentType: type,
        },
      },
    });

    // Get download URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Far future date
    });

    // Save document reference to Firestore
    const documentData = {
      name: file.name,
      url: url,
      type: type,
      uploadedAt: new Date(),
      uploadedBy: userId,
      storeId: id,
    };

    // Remove existing document of the same type
    const existingDocs = await adminDb
      .collection('storeDocuments')
      .where('storeId', '==', id)
      .where('type', '==', type)
      .get();

    const batch = adminDb.batch();
    existingDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Add new document
    const docRef = adminDb.collection('storeDocuments').doc();
    batch.set(docRef, documentData);

    await batch.commit();

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        id: docRef.id,
        ...documentData,
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({
      message: 'Failed to upload document'
    }, { status: 500 });
  }
}