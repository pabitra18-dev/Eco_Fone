
'use server';

import { db, admin } from '@/lib/firebaseAdmin';
import type { Order } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { Timestamp } from 'firebase-admin/firestore';

export async function getOrdersByUserId(idToken: string): Promise<Order[]> {
    if (!idToken) {
        console.log("No ID token provided.");
        return [];
    }

    try {
        const decodedToken = await getAuth(admin).verifyIdToken(idToken);
        const userId = decodedToken.uid;
        
        console.log(`Fetching orders for userId: ${userId}`);
        const ordersCol = db.collection('orders');
        
        // This single query should be sufficient with correct data structure
        const query = ordersCol.where("userId", "==", userId);
        
        const orderSnapshot = await query.get();

        if (orderSnapshot.empty) {
            console.log("No orders found for this user.");
            return [];
        }

        let orders: Order[] = orderSnapshot.docs.map(doc => {
            const data = doc.data();
            const orderDate = data.orderDate as Timestamp;
            return {
                id: doc.id,
                ...data,
                orderDate: orderDate?.toDate ? orderDate.toDate().toISOString() : new Date().toISOString(),
            } as Order;
        });

        orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        console.log(`Successfully fetched ${orders.length} orders.`);
        return orders;

    } catch (error) {
        console.error("FATAL: Error fetching user orders:", error);
        // It's better to throw the error so the client can handle it
        throw new Error("Failed to fetch orders.");
    }
}
