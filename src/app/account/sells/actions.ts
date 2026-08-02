
'use server';

import { db, admin } from '@/lib/firebaseAdmin';
import type { Sell } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';
import { createNotification } from '@/lib/notifications';

async function getUserIdFromToken(idToken: string): Promise<string> {
  if (!idToken) {
    throw new Error('ID token must be provided.');
  }
  const decodedToken = await getAuth(admin).verifyIdToken(idToken);
  return decodedToken.uid;
}

export async function getSellRequestsByUserId(idToken: string): Promise<Sell[]> {
  try {
    const userId = await getUserIdFromToken(idToken);
    const sellsRef = db.collection('sells');
    const q = sellsRef.where('userId', '==', userId);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return [];
    }

    const requests: Sell[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
      requests.push({
        id: doc.id,
        ...data,
        createdAt,
      } as Sell);
    });
    
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return requests;
  } catch (error) {
    console.error('Error fetching sell requests for user:', error);
    throw new Error(`Failed to fetch sell requests.`);
  }
}

async function updateSellRequest(idToken: string, sellId: string, data: Partial<Sell>) {
    const userId = await getUserIdFromToken(idToken);
    const sellRef = db.collection('sells').doc(sellId);
    const doc = await sellRef.get();
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Permission denied or request not found.");
    }
    await sellRef.update(data);
    revalidatePath('/account/sells');
    revalidatePath('/admin/buy');
}

export async function acceptOffer(idToken: string, sellId: string) {
    await updateSellRequest(idToken, sellId, { status: 'accepted' });
    await createNotification({ forAdmins: true }, {
        title: 'Offer Accepted by User',
        body: `A user has accepted the offer for sell request #${sellId.slice(0,7)}.`,
        link: `/admin/buy`
    });
    return { success: true };
}

export async function declineOffer(idToken: string, sellId: string) {
    await updateSellRequest(idToken, sellId, { status: 'rejected' });
    await createNotification({ forAdmins: true }, {
        title: 'Offer Declined by User',
        body: `A user has declined the offer for sell request #${sellId.slice(0,7)}.`,
        link: `/admin/buy`
    });
    return { success: true };
}

export async function negotiateOffer(idToken: string, sellId: string, priceRange: [number, number], reason?: string) {
    const updateData: Partial<Sell> = {
        negotiationPriceRange: priceRange,
        status: 'negotiating',
    };
    if (reason) {
        updateData.negotiationReason = reason;
    }
    
    await updateSellRequest(idToken, sellId, updateData);

    await createNotification({ forAdmins: true }, {
        title: 'User Counter-Offer',
        body: `A user is negotiating the price for sell request #${sellId.slice(0,7)}.`,
        link: `/admin/buy`
    });

    return { success: true };
}
