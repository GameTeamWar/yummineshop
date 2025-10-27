import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Option } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<Option> = await request.json();
    const { id } = params;

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    delete updateData.id;
    delete updateData.createdAt;

    await adminDb.collection('options').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating option:', error);
    return NextResponse.json({ error: 'Failed to update option' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await adminDb.collection('options').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}