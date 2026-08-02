
'use server';

import { cache } from 'react';
import { db } from './firebaseAdmin';
import type { SiteSettings } from './types';

const SETTINGS_COLLECTION = 'settings';
const SITE_SETTINGS_DOC = 'site';

export const getSettings = cache(async (): Promise<Partial<SiteSettings>> => {
  try {
    const docRef = db.collection(SETTINGS_COLLECTION).doc(SITE_SETTINGS_DOC);
    const docSnap = await docRef.get();
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return empty object on error to prevent site crash
    return {};
  }
});

export async function updateSettings(data: SiteSettings): Promise<void> {
  try {
    const docRef = db.collection(SETTINGS_COLLECTION).doc(SITE_SETTINGS_DOC);
    await docRef.set(data, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Could not update settings in database.');
  }
}
