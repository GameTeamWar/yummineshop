import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Category } from '@/types';

// Kategori ismini title case'e çeviren fonksiyon
const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const categoriesRef = adminDb.collection('categories');
    const snapshot = await categoriesRef.where('partnerId', '==', partnerId).get();

    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Category);
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

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
      const existingDoc = await adminDb.collection('categories').doc(numericId).get();
      isUnique = !existingDoc.exists;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique ID' }, { status: 500 });
    }

    const categoryData = {
      ...body,
      name: toTitleCase(body.name), // Kategori adını title case'e çevir
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection('categories').doc(numericId).set(categoryData);

    return NextResponse.json({
      id: numericId,
      ...categoryData,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, id, ...updateData } = body;

    if (!partnerId || !id) {
      return NextResponse.json({ error: 'Partner ID and Category ID required' }, { status: 400 });
    }

    const categoryRef = adminDb.collection('categories').doc(id);

    // Check if category exists and belongs to the partner
    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const categoryData = categoryDoc.data();
    if (categoryData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await categoryRef.update({
      ...updateData,
      ...(updateData.name && { name: toTitleCase(updateData.name) }), // Kategori adı varsa title case'e çevir
      updatedAt: new Date(),
    });

    // Get updated category
    const updatedDoc = await categoryRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt.toDate(),
      updatedAt: updatedData?.updatedAt.toDate(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const partnerId = searchParams.get('partnerId');

    if (!id || !partnerId) {
      return NextResponse.json({ error: 'Category ID and Partner ID required' }, { status: 400 });
    }

    const categoryRef = adminDb.collection('categories').doc(id);

    // Check if category exists and belongs to the partner
    const categoryDoc = await categoryRef.get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const categoryData = categoryDoc.data();
    if (categoryData?.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await categoryRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}