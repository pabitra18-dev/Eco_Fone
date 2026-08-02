
'use server';

import { updateSettings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebaseAdmin';

const settingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required.'),
  contactEmail: z.string().email('Invalid email address.'),
  contactPhone: z.string().min(1, 'Phone number is required.'),
  insideValleyRate: z.coerce.number().min(0),
  outsideValleyRate: z.coerce.number().min(0),
  socialFacebook: z.string().url().or(z.literal('')),
  socialInstagram: z.string().url().or(z.literal('')),
  socialX: z.string().url().or(z.literal('')),
});

const adminSettingsSchema = z.object({
    esewaMobileNumber: z.string().min(10, 'A valid mobile number is required.'),
});

async function verifyMasterAdmin(): Promise<boolean> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return false;

    try {
        const decodedToken = await getAuth(admin).verifySessionCookie(sessionCookie, true);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        return userDoc.exists && userDoc.data()?.role === 'Master Admin';
    } catch (error) {
        console.error("Master admin verification failed:", error);
        return false;
    }
}


export async function updateSiteSettings(formData: FormData) {
  const data = {
    storeName: formData.get('storeName'),
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone'),
    insideValleyRate: formData.get('insideValleyRate'),
    outsideValleyRate: formData.get('outsideValleyRate'),
    socialFacebook: formData.get('socialFacebook'),
    socialInstagram: formData.get('socialInstagram'),
    socialX: formData.get('socialX'),
  };

  const validated = settingsSchema.safeParse(data);

  if (!validated.success) {
    console.error(validated.error);
    return { success: false, message: 'Invalid data provided.' };
  }

  try {
    await updateSettings(validated.data);
    // Revalidate all paths that might show the footer
    revalidatePath('/', 'layout');
    return { success: true, message: 'Settings updated successfully!' };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, message: 'Failed to update settings.' };
  }
}

export async function updateAdminSettings(formData: FormData) {
    const isMaster = await verifyMasterAdmin();
    if (!isMaster) {
        return { success: false, message: 'Permission denied.' };
    }

    const data = {
        esewaMobileNumber: formData.get('esewaMobileNumber'),
    }

    const validated = adminSettingsSchema.safeParse(data);
    if (!validated.success) {
        console.error(validated.error);
        return { success: false, message: 'Invalid admin data provided.' };
    }

    try {
        const adminSettingsRef = db.collection('settings').doc('admin');
        await adminSettingsRef.set(validated.data, { merge: true });
        revalidatePath('/checkout');
        revalidatePath('/order');
        return { success: true, message: 'Admin settings updated!' };
    } catch (error) {
        console.error('Error updating admin settings:', error);
        return { success: false, message: 'Failed to update admin settings.' };
    }
}
