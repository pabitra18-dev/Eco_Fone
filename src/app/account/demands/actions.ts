
'use server';

import { db, admin } from '@/lib/firebaseAdmin';
import type { Demand } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase-admin/auth';


async function getUserIdFromToken(idToken: string): Promise<string> {
  if (!idToken) {
    throw new Error('ID token must be provided.');
  }
  const decodedToken = await getAuth(admin).verifyIdToken(idToken);
  return decodedToken.uid;
}


export async function getDemandsByUserId(idToken: string): Promise<Demand[]> {
  try {
    const userId = await getUserIdFromToken(idToken);
    const demandsCol = db.collection('demands');
    const q = demandsCol.where("userId", "==", userId);
    const demandSnapshot = await q.get();

    if (demandSnapshot.empty) {
        return [];
    }

    const demandList = demandSnapshot.docs.map(doc => {
      const data = doc.data();
      
      let createdAt: string;
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = (data.createdAt as Timestamp).toDate().toISOString();
      } else if (data.createdAt) {
        createdAt = new Date(data.createdAt).toISOString();
      } else {
        createdAt = new Date().toISOString();
      }
      
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

    demandList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return demandList;
  } catch (error: any) {
    console.error(`Error fetching demands for user:`, error);
    throw new Error('Failed to fetch demands from database.');
  }
}

export async function getDemandById(idToken: string, id: string): Promise<Demand | null> {
  try {
    const userId = await getUserIdFromToken(idToken);
    const demandRef = db.collection('demands').doc(id);
    const docSnap = await demandRef.get();
    
    if (!docSnap.exists) {
        return null;
    }
    
    const data = docSnap.data();
    if (!data) return null;
    
    if (data.userId !== userId) {
        console.warn(`Permission denied: User ${userId} attempted to access demand ${id} owned by ${data.userId}`);
        return null;
    }
    
    let createdAt: string;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAt = (data.createdAt as Timestamp).toDate().toISOString();
    } else {
      createdAt = new Date().toISOString();
    }

    let updatedAt: string | undefined = undefined;
    if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      updatedAt = (data.updatedAt as Timestamp).toDate().toISOString();
    }

    return {
      id: docSnap.id,
      ...data,
      createdAt,
      updatedAt,
    } as Demand;

  } catch (error) {
    console.error('Error fetching demand by ID:', error);
    throw new Error('Failed to fetch demand by ID from database.');
  }
}

export async function deleteUserDemand(idToken: string, id: string) {
  try {
    const userId = await getUserIdFromToken(idToken);
    const demandRef = db.collection('demands').doc(id);
    const docSnap = await demandRef.get();
    
    if (!docSnap.exists || docSnap.data()?.userId !== userId) {
        return { success: false, message: "Permission denied or demand not found." };
    }
    
    await demandRef.delete();
    
    revalidatePath('/account/demands');
    revalidatePath('/admin/demands');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting demand:', error);
    return { success: false, message: error.message || 'Failed to delete demand.' };
  }
}
