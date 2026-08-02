'use server';

import { db } from '@/lib/firebaseAdmin';

export interface AdminNotificationCounts {
    orders: number;
    sells: number;
    demands: number;
}

export async function getNotificationCounts(): Promise<AdminNotificationCounts> {
    try {
        const ordersRef = db.collection('orders');
        const sellsRef = db.collection('sells');
        const demandsRef = db.collection('demands');

        // Define which statuses are considered "active" notifications for an admin
        const ordersQuery = ordersRef.where('status', 'in', ['Pending Payment', 'Payment Verified', 'Processing']);
        const sellsQuery = sellsRef.where('status', 'in', ['pending', 'negotiating']);
        const demandsQuery = demandsRef.where('status', '==', 'new');

        // Use efficient .count() queries
        const [ordersSnapshot, sellsSnapshot, demandsSnapshot] = await Promise.all([
            ordersQuery.count().get(),
            sellsQuery.count().get(),
            demandsQuery.count().get(),
        ]);

        return {
            orders: ordersSnapshot.data().count,
            sells: sellsSnapshot.data().count,
            demands: demandsSnapshot.data().count,
        };
    } catch (error) {
        console.error("Error fetching notification counts:", error);
        // Return 0 on error to prevent crashing the UI
        return {
            orders: 0,
            sells: 0,
            demands: 0,
        };
    }
}
