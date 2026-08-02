import { NextResponse } from 'next/server';
import { getProducts as getServerProducts } from '@/lib/products';
import type { Product } from '@/lib/types';

export async function GET() {
  try {
    // This now correctly uses the server-side function which can be cached
    const productList: Product[] = await getServerProducts();
    return NextResponse.json(productList);
  } catch (error: any) {
    console.error("Error fetching products in API route:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
