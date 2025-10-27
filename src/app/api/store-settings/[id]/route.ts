import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { StoreSettings } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<StoreSettings> = await request.json();
    const { id } = params;

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    delete updateData.id;
    delete updateData.createdAt;

    await adminDb.collection('storeSettings').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}