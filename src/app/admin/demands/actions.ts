"use server";

import type { Demand } from '@/lib/types';
import { db } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { createNotification } from '@/lib/notifications';

export async function getDemands(): Promise<Demand[]> {
  try {
    const demandsCol = db.collection('demands');
    const q = demandsCol.orderBy('createdAt', 'desc');
    const demandSnapshot = await q.get();
    
    if (demandSnapshot.empty) {
        return [];
    }

    const demandList = demandSnapshot.docs.map(doc => {
        const data = doc.data();

        // Explicitly handle createdAt timestamp
        let createdAt: string;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAt = (data.createdAt as Timestamp).toDate().toISOString();
        } else if (data.createdAt) {
          createdAt = new Date(data.createdAt).toISOString();
        } else {
          createdAt = new Date().toISOString();
        }

        // Explicitly handle updatedAt timestamp
        let updatedAt: string | undefined = undefined;
        if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          updatedAt = (data.updatedAt as Timestamp).toDate().toISOString();
        } else if (data.updatedAt) {
          updatedAt = new Date(data.updatedAt).toISOString();
        }

        return { 
            id: doc.id, 
            ...data,
            createdAt: createdAt,
            updatedAt: updatedAt,
        } as Demand;
    });
    return demandList;
  } catch (error: any) {
    if (error.code === 'not-found' || error.code === 5 || error.code === 'permission-denied') { 
        console.error("Firestore error: The 'demands' collection was not found or permissions are insufficient. Please create it in your Firestore database and check security rules.");
    } else {
        console.error("Error fetching demands:", error);
    }
    return [];
  }
}

export async function updateDemandStatus(id: string, status: Demand['status']) {
  try {
    const demandRef = db.collection('demands').doc(id);
    await demandRef.update({ status });
    
    const docSnap = await demandRef.get();
    const demandData = docSnap.data();
    if (demandData?.userId) {
        await createNotification({ userId: demandData.userId }, {
            title: 'Demand Status Updated',
            body: `Your demand for a ${demandData.brand || ''} ${demandData.model || ''} is now '${status}'.`,
            link: `/account/demands`
        });
    }

    revalidatePath('/admin/demands');
    revalidatePath('/account/demands');
    return { success: true };
  } catch (error) {
    console.error('Error updating demand status:', error);
    return { success: false, message: 'Failed to update demand status.' };
  }
}

export async function deleteDemand(id: string) {
  try {
    await db.collection('demands').doc(id).delete();
    revalidatePath('/admin/demands');
    return { success: true };
  } catch (error) {
    console.error('Error deleting demand:', error);
    return { success: false, message: 'Failed to delete demand.' };
  }
}
