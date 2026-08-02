
'use server';

import { db } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import type { Sell } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';

export async function getAllBuyRequests(): Promise<Sell[]> {
  try {
    const sellsRef = db.collection('sells');
    const snapshot = await sellsRef.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return [];
    }

    const sells: Sell[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const createdAt = (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
      sells.push({ id: doc.id, ...data, createdAt } as Sell);
    });

    return sells;
  } catch (error) {
    console.error('Error fetching all buy requests:', error);
    throw new Error('Failed to fetch all buy requests.');
  }
}

export async function updateBuyRequestStatus(id: string, status: string, acceptedPrice?: number) {
    try {
        const sellRef = db.collection('sells').doc(id);
        const updateData: { status: string; acceptedPrice?: number } = { status };
        
        if ((status === 'accepted' || status === 'negotiating') && acceptedPrice !== undefined) {
            updateData.acceptedPrice = acceptedPrice;
        }

        await sellRef.update(updateData);
        revalidatePath('/admin/buy');
        revalidatePath('/account/sells');

        const sellDoc = await sellRef.get();
        const sellData = sellDoc.data();
        if (sellData?.userId) {
            let body = `The status of your sell request for ${sellData.brand} ${sellData.model} has been updated to '${status}'.`;
            if (status === 'negotiating' && acceptedPrice) {
                body = `We have a new offer of NPR ${acceptedPrice.toLocaleString()} for your ${sellData.brand} ${sellData.model}. Please review it in your account.`
            }
            await createNotification({ userId: sellData.userId }, {
                title: 'Sell Request Update',
                body: body,
                link: `/account/sells`
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating buy request status:', error);
        return { success: false, message: 'Failed to update status.' };
    }
}

export async function deleteBuyRequest(id: string) {
    try {
        await db.collection('sells').doc(id).delete();
        revalidatePath('/admin/buy');
        return { success: true };
    } catch (error) {
        console.error('Error deleting buy request:', error);
        return { success: false, message: 'Failed to delete request.' };
    }
}
