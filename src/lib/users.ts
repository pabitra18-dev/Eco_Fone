

'use server';

import type { SiteUser } from './types';
import admin, { db } from './firebaseAdmin';

export async function getUsers(): Promise<SiteUser[]> {
  try {
    const usersCol = adminDb.collection('users');
    // Sort by createdAt ascending to get the oldest members first
    const userSnapshot = await usersCol.orderBy('createdAt', 'asc').get();
    const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role || 'User',
            joinedDate: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            avatar: data.avatar || `https://placehold.co/100x100.png?text=${data.name.charAt(0)}`
        } as SiteUser;
    });
    return userList;
  } catch (error: any) {
    if (error.code === 'not-found' || error.code === 5) {
        console.error("Firestore error: The 'users' collection was not found. Please ensure you have created a Firestore database and that users are being added correctly on signup.");
    } else {
        console.error("Error fetching users:", error);
    }
    return [];
  }
}

export async function getAdminSettings(): Promise<{ esewaMobileNumber: string | null }> {
  try {
    const settingsDocRef = adminDb.collection('settings').doc('admin');
    const docSnap = await settingsDocRef.get();

    if (docSnap.exists) {
      const settingsData = docSnap.data();
      return { esewaMobileNumber: settingsData?.esewaMobileNumber || null };
    }
    console.warn("Admin settings document not found.");
    return { esewaMobileNumber: null };
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return { esewaMobileNumber: null };
  }
}

export async function updateUser(userId: string, data: { name?: string; avatar?: string }) {
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        await userDocRef.update(data);

        // Also update the Firebase Auth user profile
        const authUpdate: { displayName?: string, photoURL?: string } = {};
        if (data.name) authUpdate.displayName = data.name;
        if (data.avatar) authUpdate.photoURL = data.avatar;

        if (Object.keys(authUpdate).length > 0) {
            await admin.auth().updateUser(userId, authUpdate);
        }

    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user.");
    }
}
