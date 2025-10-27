import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Option } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const optionsRef = adminDb.collection('options');
    const snapshot = await optionsRef.where('partnerId', '==', partnerId).get();

    const options: Option[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      options.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Option);
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Option, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    if (!body.partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    // Generate a unique 11-digit numeric ID
    let numericId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      // Generate 11-digit number
      numericId = Math.floor(Math.random() * 90000000000 + 10000000000).toString();
      
      // Check if this ID already exists
      const existingDoc = await adminDb.collection('options').doc(numericId).get();
      isUnique = !existingDoc.exists;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique ID' }, { status: 500 });
    }

    const optionData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('options').doc(numericId).set(optionData);

    return NextResponse.json({
      id: numericId,
      ...optionData,
    });
  } catch (error) {
    console.error('Error creating option:', error);
    return NextResponse.json({ error: 'Failed to create option' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, id, ...updateData } = body;

    if (!partnerId || !id) {
      return NextResponse.json({ error: 'Partner ID and Option ID required' }, { status: 400 });
    }

    const optionRef = adminDb.collection('options').doc(id);

    // Check if option exists and belongs to the partner
    const optionDoc = await optionRef.get();
    if (!optionDoc.exists) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    const optionData = optionDoc.data();
    if (optionData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await optionRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    // Get updated option
    const updatedDoc = await optionRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt.toDate(),
      updatedAt: updatedData?.updatedAt.toDate(),
    });
  } catch (error) {
    console.error('Error updating option:', error);
    return NextResponse.json({ error: 'Failed to update option' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId');

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Option ID and Partner ID required' }, { status: 400 });
    }

    const optionRef = adminDb.collection('options').doc(id);

    // Check if option exists and belongs to the partner
    const optionDoc = await optionRef.get();
    if (!optionDoc.exists) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    const optionData = optionDoc.data();
    if (optionData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await optionRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
  }
}