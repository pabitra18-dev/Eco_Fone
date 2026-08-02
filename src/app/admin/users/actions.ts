
'use server';

import { db, admin } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';
import type { SiteUser } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

const PERMANENT_ADMIN_EMAILS = ["bhattaaryan123@gmail.com", "bibek976171@gmail.com"];

async function verifyMasterAdminAndGetId(): Promise<string | null> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedToken = await getAuth(admin).verifySessionCookie(sessionCookie, true);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists && userDoc.data()?.role === 'Master Admin') {
            return decodedToken.uid;
        }
        return null;
    } catch (error) {
        console.error("Master admin verification failed:", error);
        return null;
    }
}

async function logAdminAction(adminId: string, action: string, details: object) {
    const auditLogRef = db.collection('auditLogs').doc();
    await auditLogRef.set({
        adminId,
        action,
        timestamp: FieldValue.serverTimestamp(),
        ...details,
    });
}

export async function changeUserRole(targetUserId: string, newRole: 'Admin' | 'User'): Promise<{ success: boolean; message?: string }> {
    const masterAdminId = await verifyMasterAdminAndGetId();
    if (!masterAdminId) {
        return { success: false, message: 'Permission denied. Not a Master Admin.' };
    }
    
    if (!targetUserId) {
        return { success: false, message: 'User ID is required.' };
    }

    try {
        const userRef = db.collection('users').doc(targetUserId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return { success: false, message: 'Target user not found.' };
        }
        
        const targetUserEmail = userDoc.data()?.email;
        if (PERMANENT_ADMIN_EMAILS.includes(targetUserEmail)) {
            return { success: false, message: 'This user is a permanent admin and their role cannot be changed.' };
        }

        const oldRole = userDoc.data()?.role || 'User';

        await userRef.update({ role: newRole });

        await logAdminAction(masterAdminId, 'changeUserRole', {
            targetUserId,
            targetUserEmail: userDoc.data()?.email,
            oldRole,
            newRole,
        });

        revalidatePath('/admin/users');
        revalidatePath('/admin/audit-log');
        return { success: true };
    } catch (error) {
        console.error('Error changing user role:', error);
        return { success: false, message: 'Failed to change user role.' };
    }
}

export async function deleteUser(targetUserId: string): Promise<{ success: boolean; message?: string }> {
    const masterAdminId = await verifyMasterAdminAndGetId();
    if (!masterAdminId) {
        return { success: false, message: 'Permission denied. Not a Master Admin.' };
    }

    if (!targetUserId) {
        return { success: false, message: 'User ID is required.' };
    }

    try {
        const userRef = db.collection('users').doc(targetUserId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return { success: false, message: 'Target user not found.' };
        }
        
        const userData = userDoc.data();
        if (PERMANENT_ADMIN_EMAILS.includes(userData?.email)) {
            return { success: false, message: 'This user is a permanent admin and cannot be deleted.' };
        }

        // Delete from Firestore
        await userRef.delete();
        
        // Delete from Firebase Authentication
        await getAuth(admin).deleteUser(targetUserId);

        await logAdminAction(masterAdminId, 'deleteUser', {
            deletedUserId: targetUserId,
            deletedUserEmail: userData?.email,
        });

        revalidatePath('/admin/users');
        revalidatePath('/admin/audit-log');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: 'Failed to delete user.' };
    }
}
