
'use server';

import { getAuth } from 'firebase-admin/auth';
import { admin, db } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';
import { uploadImageAndGetUrl } from '@/lib/file-upload';

export async function updateUserProfile(idToken: string, formData: FormData) {
  try {
    const decodedToken = await getAuth(admin).verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const name = formData.get('name') as string;
    const profileImageFile = formData.get('profileImage') as File | null;
    
    let photoURL = formData.get('currentPhotoUrl') as string | undefined;

    if (profileImageFile && profileImageFile.size > 0) {
      photoURL = await uploadImageAndGetUrl(profileImageFile);
    }
    
    const updateData: { displayName?: string, photoURL?: string } = {};
    if (name) updateData.displayName = name;
    if (photoURL) updateData.photoURL = photoURL;
    
    // Update Firebase Authentication user
    await getAuth(admin).updateUser(userId, updateData);
    
    // Update Firestore user document
    const userDocRef = db.collection('users').doc(userId);
    const firestoreUpdateData: { name?: string, avatar?: string } = {};
    if (name) firestoreUpdateData.name = name;
    if (photoURL) firestoreUpdateData.avatar = photoURL;
    
    if(Object.keys(firestoreUpdateData).length > 0) {
        await userDocRef.update(firestoreUpdateData);
    }

    revalidatePath('/account/profile');
    revalidatePath('/admin/layout'); // To refresh avatar in admin header
    revalidatePath('/common/header'); // To refresh avatar in main header
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message || "Failed to update profile." };
  }
}
