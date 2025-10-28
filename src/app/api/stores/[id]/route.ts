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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();

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
      return NextResponse.json({ message: 'Unauthorized to update this store' }, { status: 403 });
    }

    // Update store data
    const allowedFields = [
      'storeName', 'ownerName', 'phone', 'email', 'address',
      'taxNumber', 'businessType', 'description', 'latitude',
      'longitude', 'locationName'
    ];

    const updateFields: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    updateFields.updatedAt = new Date();

    await adminDb.collection('stores').doc(id).update(updateFields);

    return NextResponse.json({
      message: 'Store updated successfully',
      data: updateFields
    });

  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json({
      message: 'Failed to update store'
    }, { status: 500 });
  }
}