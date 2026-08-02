
'use server';

import {revalidatePath} from 'next/cache';
import type {Order} from '@/lib/types';
import {db, admin} from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { createNotification } from '@/lib/notifications';


async function getAuthenticatedAdminId(): Promise<string | null> {
    const sessionCookie = (await cookies()).get('session')?.value;

    if (!sessionCookie) {
        return null; 
    }

    try {
        const decodedClaims = await getAuth(admin).verifySessionCookie(sessionCookie, true); 
        
        const userDoc = await db.collection('users').doc(decodedClaims.uid).get();
        if (!userDoc.exists) {
            return null;
        }

        const userData = userDoc.data();
        if (userData?.role !== 'Admin' && userData?.role !== 'Master Admin') {
             console.warn(`User ${decodedClaims.uid} attempted admin action without admin role.`);
             return null;
        }
        
        return decodedClaims.uid;
    } catch (error) {
        console.error("Authentication failed: Session cookie verification error:", error);
        return null;
    }
}

async function logAdminAction(adminId: string, action: string, details: object) {
    if (!adminId) return;
    const auditLogRef = db.collection('auditLogs').doc();
    await auditLogRef.set({
        adminId,
        action,
        timestamp: FieldValue.serverTimestamp(),
        ...details,
    });
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
) {
    
  try {
    const adminId = await getAuthenticatedAdminId();
    
    if (!adminId) {
        throw new Error("Authentication failed: User is not authorized as an admin.");
    }
    
    const orderRef = db.collection('orders').doc(orderId);
    
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
        throw new Error("Order not found.");
    }
    const oldStatus = orderSnap.data()?.status;

    await orderRef.update({status});
    
    await logAdminAction(adminId, 'orderStatusUpdate', {
        orderId,
        oldStatus,
        newStatus: status,
        details: `Updated orderId #${orderId.slice(0,7)} status from '${oldStatus}' to '${status}'`
    });

    const orderData = orderSnap.data();
    if(orderData?.userId){
        await createNotification({ userId: orderData.userId }, {
            title: 'Order Status Updated',
            body: `Your order #${orderId.slice(0,7)} is now '${status}'.`,
            link: `/order/${orderId}`
        });
    }

    revalidatePath('/admin/orders');
    revalidatePath('/account/orders'); 

    return {success: true};
  } catch (error: any) {
    console.error('CRITICAL: Failed to update order status:', error);
    return {success: false, message: error.message || 'Failed to update order status.'};
  }
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
        const adminId = await getAuthenticatedAdminId();
        if (!adminId) {
            return { success: false, message: 'Authorization Failed.' };
        }
        
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return { success: false, message: 'Order not found.' };
        }
        
        await orderRef.delete();
        await logAdminAction(adminId, 'deleteOrder', { orderId });
        
        revalidatePath('/admin/orders');
        return { success: true };

    } catch(error: any) {
        console.error("Error deleting order:", error);
        return { success: false, message: 'Failed to delete order.' };
    }
}

export async function deleteAllOrders(): Promise<{ success: boolean; message?: string }> {
    try {
        const adminId = await getAuthenticatedAdminId();
        if (!adminId) {
            return { success: false, message: 'Authorization Failed.' };
        }

        const ordersQuery = db.collection('orders');
        const snapshot = await ordersQuery.get();

        if (snapshot.empty) {
            return { success: true, message: 'No orders to delete.' };
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        await logAdminAction(adminId, 'deleteAllOrders', { count: snapshot.size });

        revalidatePath('/admin/orders');
        revalidatePath('/account/orders');
        return { success: true };

    } catch (error: any) {
        console.error("Error deleting all orders:", error);
        return { success: false, message: 'An error occurred while deleting all orders.' };
    }
}
