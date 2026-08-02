
'use server';

import { db } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';
import type { SiteImageKeys } from '@/lib/types';
import { uploadImageAndGetUrl } from '@/lib/file-upload';
import { getSiteImages as getSiteImagesServer } from '@/lib/products';

export async function getSiteImages(): Promise<Record<SiteImageKeys, string>> {
  return await getSiteImagesServer();
}


export async function updateSiteImageAction(formData: FormData): Promise<string> {
    const key = formData.get('key') as SiteImageKeys;
    const file = formData.get('file') as File;

    if (!key || !file) {
        throw new Error('Missing key or file for image update.');
    }

    const publicUrl = await uploadImageAndGetUrl(file);

    // 2. Update Firestore document with new URL
    const docRef = db.collection('site_settings').doc('images');
    await docRef.set({ [key]: publicUrl }, { merge: true });

    // 3. Revalidate relevant paths
    revalidatePath('/why-us');
    revalidatePath('/products');
    revalidatePath('/admin/settings/images');
    
    return publicUrl;
}
