'use server';

import {revalidatePath} from 'next/cache';
import {db, admin} from './firebaseAdmin';
import type {Announcement} from './types';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuthenticatedUserId } from './auth';

async function logAdminAction(adminId: string | null, action: string, details: object) {
    if (!adminId) return; // Don't log if adminId is not available
    const auditLogRef = db.collection('auditLogs').doc();
    await auditLogRef.set({
        adminId,
        action,
        timestamp: FieldValue.serverTimestamp(),
        ...details,
    });
}

export async function addAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>) {
  try {
    const adminId = await getAuthenticatedUserId();
    const title = data.title;

    const announcementsCol = db.collection('announcements');
    
    await announcementsCol.add({
      ...data,
      isActive: false, // Always add as inactive first
      createdAt: Timestamp.now(),
    });

    await logAdminAction(adminId, 'createAnnouncement', { announcementTitle: title });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/announcements');
    revalidatePath('/admin/audit-log');
    return {success: true};
  } catch (error) {
    console.error('Error adding announcement:', error);
    return {success: false, message: 'Failed to add announcement.'};
  }
}

export async function updateAnnouncement(id: string, data: Partial<Omit<Announcement, 'id' | 'createdAt'>>) {
  try {
    const adminId = await getAuthenticatedUserId();
    const title = data.title || 'Unknown';
    
    const announcementDocRef = db.collection('announcements').doc(id);
    
    // The 'isActive' property should not be updated through this function.
    const { isActive, ...updateData } = data as any;

    await announcementDocRef.update({ ...updateData });
    await logAdminAction(adminId, 'updateAnnouncement', { announcementId: id, announcementTitle: title });
    
    revalidatePath('/', 'layout');
    revalidatePath('/admin/announcements');
    revalidatePath('/admin/audit-log');
    return {success: true};
  } catch (error) {
    console.error(`Error updating announcement ${id}:`, error);
    return {success: false, message: 'Failed to update announcement.'};
  }
}

export async function toggleAnnouncementActive(id: string, activate: boolean) {
    const announcementRef = db.collection('announcements').doc(id);

    if (activate) {
        const batch = db.batch();
        const announcementsCol = db.collection('announcements');
        
        // Deactivate all others
        const activeSnapshot = await announcementsCol.where('isActive', '==', true).get();
        activeSnapshot.forEach(doc => {
            if(doc.id !== id) {
                 batch.update(doc.ref, { isActive: false });
            }
        });
        
        // Activate the target one
        batch.update(announcementRef, { isActive: true });

        await batch.commit();
    } else {
        await announcementRef.update({ isActive: false });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/admin/announcements');
}

export async function deleteAnnouncement(id: string) {
  try {
    const adminId = await getAuthenticatedUserId();
    const announcementDocRef = db.collection('announcements').doc(id);
    const doc = await announcementDocRef.get();
    const title = doc.data()?.title || 'Unknown';
    
    await announcementDocRef.delete();
    await logAdminAction(adminId, 'deleteAnnouncement', { announcementId: id, announcementTitle: title });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/announcements');
    revalidatePath('/admin/audit-log');
    return {success: true};
  } catch (error) {
    console.error(`Error deleting announcement ${id}:`, error);
    return {success: false, message: 'Failed to delete announcement.'};
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const announcementsCollection = db.collection('announcements');
    const q = announcementsCollection.orderBy('createdAt', 'desc');
    const snapshot = await q.get();

    const announcementsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString()
        } as Announcement;
    });
    return announcementsList;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function getActiveAnnouncement(): Promise<Announcement | null> {
  try {
    const q = db.collection('announcements')
      .where('isActive', '==', true)
      .limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const docData = doc.data();
    const createdAtTimestamp = docData.createdAt as Timestamp;

    return {
      id: doc.id,
      title: docData.title,
      content: docData.content,
      imageUrl: docData.imageUrl || null,
      isActive: docData.isActive,
      createdAt: createdAtTimestamp.toDate().toISOString(),
    } as Announcement;
  } catch (error) {
    console.error('Error fetching active announcement:', error);
    return null;
  }
}
