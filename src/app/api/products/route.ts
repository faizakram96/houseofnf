import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/services/dbService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const featuredOnly = searchParams.get('featured') === 'true';
    const newArrivalsOnly = searchParams.get('new') === 'true';
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const data = await getProducts({
      categorySlug,
      featuredOnly,
      newArrivalsOnly,
      search,
      sortBy,
      limit,
    });

    return NextResponse.json({ success: true, data: data.products, total: data.total });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.pricing?.price) {
      return NextResponse.json({ success: false, error: 'Product name and price are required.' }, { status: 400 });
    }

    const newProduct = await createProduct(body);
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
