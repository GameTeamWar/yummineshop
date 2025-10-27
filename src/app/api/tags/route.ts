import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Tag } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const tagsRef = adminDb.collection('tags');
    const snapshot = await tagsRef.where('partnerId', '==', partnerId).get();

    const tags: Tag[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      tags.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Tag);
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

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
      const existingDoc = await adminDb.collection('tags').doc(numericId).get();
      isUnique = !existingDoc.exists;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique ID' }, { status: 500 });
    }

    const tagData = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('tags').doc(numericId).set(tagData);

    return NextResponse.json({
      id: numericId,
      ...tagData,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, id, ...updateData } = body;

    if (!partnerId || !id) {
      return NextResponse.json({ error: 'Partner ID and Tag ID required' }, { status: 400 });
    }

    const tagRef = adminDb.collection('tags').doc(id);

    // Check if tag exists and belongs to the partner
    const tagDoc = await tagRef.get();
    if (!tagDoc.exists) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const tagData = tagDoc.data();
    if (tagData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await tagRef.update({
      ...updateData,
      updatedAt: new Date(),
    });

    // Get updated tag
    const updatedDoc = await tagRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt.toDate(),
      updatedAt: updatedData?.updatedAt.toDate(),
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId');

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Tag ID and Partner ID required' }, { status: 400 });
    }

    const tagRef = adminDb.collection('tags').doc(id);

    // Check if tag exists and belongs to the partner
    const tagDoc = await tagRef.get();
    if (!tagDoc.exists) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const tagData = tagDoc.data();
    if (tagData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await tagRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}