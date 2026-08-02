
'use server';

import { cache } from 'react';
import type { Product, SiteImageKeys } from './types';
import { db as adminDb } from './firebaseAdmin';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import imageData from '@/lib/placeholder-images.json';

export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const productsCol = adminDb.collection('products');
    const productSnapshot = await productsCol.orderBy('name').get();
    const productList = productSnapshot.docs.map(
      doc => ({id: doc.id, ...doc.data()} as Product)
    );
    return productList;
  } catch (error: any) {
    if (error.code === 'not-found' || error.code === 5) {
      console.error(
        "Firestore error: The 'products' collection was not found. Please ensure you have created a Firestore database and populated it with data."
      );
    } else {
      console.error('Error fetching products:', error);
    }
    return [];
  }
});

export const getProductById = cache(async (id: string): Promise<Product | undefined> => {
  try {
    const productDocRef = adminDb.collection('products').doc(id);
    const productSnap = await productDocRef.get();
    if (productSnap.exists) {
      return {id: productSnap.id, ...productSnap.data()} as Product;
    }
    return undefined;
  } catch (error: any) {
    if (error.code === 'not-found' || error.code === 5) {
      console.error(`Firestore error: Product with ID ${id} was not found.`);
    } else {
      console.error(`Error fetching product with ID ${id}:`, error);
    }
    return undefined;
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
    try {
        const productsRef = adminDb.collection('products');
        const querySnapshot = await productsRef.where('slug', '==', slug).limit(1).get();

        if (querySnapshot.empty) {
            console.log(`No product found with slug: ${slug}`);
            return undefined;
        }
        
        const productDoc = querySnapshot.docs[0];
        return { id: productDoc.id, ...productDoc.data() } as Product;

    } catch (error) {
        console.error(`Error fetching product by slug ${slug}:`, error);
        return undefined;
    }
});


export async function updateProductFeaturedStatus(
  id: string,
  featured: boolean
): Promise<Product | undefined> {
  try {
    const productDocRef = adminDb.collection('products').doc(id);
    await productDocRef.update({featured});
    return await getProductById(id);
  } catch (error) {
    console.error(`Error updating featured status for product ${id}:`, error);
    return undefined;
  }
}

export async function setHeroProduct(productId: string): Promise<void> {
  const batch = adminDb.batch();
  const productsRef = adminDb.collection('products');

  // 1. Find the current hero product and unset it
  const q = productsRef.where('hero', '==', true);
  const querySnapshot = await q.get();
  querySnapshot.forEach(doc => {
    batch.update(doc.ref, {hero: false});
  });

  // 2. Set the new hero product
  const newHeroRef = adminDb.collection('products').doc(productId);
  batch.update(newHeroRef, {hero: true});

  // 3. Commit the batch
  await batch.commit();
}

export async function createProduct(data: Omit<Product, 'id' | 'slug'>, slug: string) {
  try {
    const productsCol = adminDb.collection('products');
    const docRef = await productsCol.add({ ...data, slug });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>) {
  try {
    const productDocRef = adminDb.collection('products').doc(id);
    await productDocRef.update(data);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    const productDocRef = adminDb.collection('products').doc(id);
    await productDocRef.delete();
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}

export async function getSiteImages(): Promise<Record<SiteImageKeys, string>> {
    const defaultImages = {
        whyUsHero: imageData.whyUsHero.src,
        reviewerAvatar1: imageData.reviewerAvatar1.src,
    };
  try {
    const docRef = adminDb.collection('site_settings').doc('images');
    const doc = await docRef.get();
    if (!doc.exists) {
      return defaultImages;
    }
    return { ...defaultImages, ...doc.data() } as Record<SiteImageKeys, string>;
  } catch (error) {
    console.error("Error fetching site images:", error);
    return defaultImages;
  }
}
