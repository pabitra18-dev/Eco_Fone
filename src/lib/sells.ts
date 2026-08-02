
'use server';
import { db } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { sellRequestSchema, type SellRequestSchemaType } from './types';
import { createNotification } from './notifications';

// Helper function to remove undefined properties from an object
function cleanObject(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

export async function createSellRequest(data: SellRequestSchemaType) {
  const sellsCollection = db.collection('sells');
  const sellDocRef = sellsCollection.doc(); 

  const cleanedData = cleanObject(data);

  const sellData = {
    ...cleanedData,
    createdAt: FieldValue.serverTimestamp(),
  };

  await sellDocRef.set(sellData);

  revalidatePath('/admin/buy');
  revalidatePath('/account/sells');

  await createNotification({ forAdmins: true }, {
    title: 'New Sell Request',
    body: `${data.fullName} wants to sell a ${data.brand} ${data.model}.`,
    link: '/admin/buy'
  });

  return { id: sellDocRef.id };
}
