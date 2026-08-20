import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getProductBySlug, updateProduct, deleteProduct, archiveProduct, restoreProduct, permanentDeleteProduct } from '@/services/dbService';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let product = await getProductBySlug(id);
    if (!product) {
      product = await getProductById(id);
    }

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateProduct(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found or update failed' }, { status: 404 });
    }

    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/products');
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    let updated = null;
    if (body.action === 'archive' || body.status === 'ARCHIVED') {
      updated = await archiveProduct(id);
    } else if (body.action === 'restore' || body.status === 'ACTIVE') {
      updated = await restoreProduct(id);
    } else {
      updated = await updateProduct(id, body);
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found or update failed' }, { status: 404 });
    }

    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/products');
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json({ success: false, error: 'Product ID is missing.' }, { status: 400 });
    }

    let success = false;
    if (permanent) {
      success = await permanentDeleteProduct(id);
    } else {
      success = await deleteProduct(id, false); // Archive
    }

    if (!success) {
      return NextResponse.json({ success: false, error: 'Product not found or action failed.' }, { status: 404 });
    }

    // Invalidate static & dynamic Next.js page caches
    try {
      revalidatePath('/admin/products');
      revalidatePath('/shop');
      revalidatePath('/products');
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'Product permanently deleted successfully' : 'Product archived successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error processing request' }, { status: 500 });
  }
}
