
'use server';
import { db } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import type { SiteUser } from './types';

export interface NotificationPayload {
    title: string;
    body: string;
    link?: string;
}

export async function createNotification(
    target: { userId?: string; forAdmins?: boolean },
    payload: NotificationPayload
) {
    const notificationData = {
        ...payload,
        createdAt: FieldValue.serverTimestamp(),
        read: false,
    };

    if (target.userId) {
        const userNotifs = db.collection('users').doc(target.userId).collection('notifications');
        await userNotifs.add(notificationData);
    }

    if (target.forAdmins) {
        const usersRef = db.collection('users');
        const q = usersRef.where('role', 'in', ['Admin', 'Master Admin']);
        const adminSnapshot = await q.get();

        if (adminSnapshot.empty) {
            console.log('No admins found to notify.');
            return;
        }

        const batch = db.batch();
        adminSnapshot.forEach(adminDoc => {
            const notifRef = adminDoc.ref.collection('notifications').doc();
            batch.set(notifRef, notificationData);
        });
        await batch.commit();
    }
}
