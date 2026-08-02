
import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/products';
import type { Product } from '@/lib/types';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const product: Product | undefined = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error(`Error fetching product by slug in API route:`, error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
