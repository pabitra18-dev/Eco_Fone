
'use server';

import type { Order } from './types';
import { db as adminDb } from './firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { sendOrderConfirmationEmail } from './email';
import { createNotification } from './notifications';

// Data for order creation, before it has an ID or final status
type OrderCreationData = Omit<Order, 'id' | 'orderDate' | 'status'>;

export async function createOrder(data: OrderCreationData, userId: string): Promise<Order> {
    try {
        const ordersCol = adminDb.collection('orders');
        
        let status: Order['status'] = 'Pending Payment';
        if (data.paymentMethod === 'cod') {
             status = 'Pending Payment'; 
        }

        const docRef = await ordersCol.add({
            ...data,
            userId,
            user: { uid: userId },
            orderDate: FieldValue.serverTimestamp(),
            status: status,
        });
        
        const orderSnap = await docRef.get();
        if (!orderSnap.exists) throw new Error("Failed to retrieve newly created order");
        const orderData = orderSnap.data();

        if (!orderData) throw new Error("Order data is missing after creation.");

        const finalOrder: Order = {
            id: orderSnap.id,
            ...orderData,
            orderDate: (orderData.orderDate as Timestamp)?.toDate()?.toISOString() || new Date().toISOString(),
        } as Order;

        await sendOrderConfirmationEmail(finalOrder);

        await createNotification({ forAdmins: true }, {
            title: 'New Order Received!',
            body: `Order #${finalOrder.id.slice(0,7)} for NPR ${finalOrder.totalAmount.toLocaleString()} was placed.`,
            link: '/admin/orders'
        });

        return finalOrder;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const orderRef = adminDb.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
            const data = orderSnap.data();
            if (!data) return null;
            return {
                id: orderSnap.id,
                ...data,
                orderDate: (data.orderDate as Timestamp)?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Order;
        }
        return null;
    } catch (error: any) {
        if (error.code === 'not-found' || error.code === 5) { // 5 is NOT_FOUND for gRPC
            console.error(`Firestore error: Order document with ID ${orderId} was not found. Please ensure it exists.`);
        } else {
            console.error(`Error fetching order ${orderId}:`, error);
        }
        return null;
    }
}

export async function submitPaymentProof(orderId: string, details: {
    esewaTransactionCode: string;
    paymentScreenshotUrl: string;
}) {
    try {
        const orderRef = adminDb.collection("orders").doc(orderId);
        await orderRef.update({
            ...details,
            status: 'Processing',
        });
    } catch (error) {
        console.error(`Error submitting payment proof for order ${orderId}:`, error);
        throw error;
    }
}


export async function getOrders(): Promise<Order[]> {
  try {
    const ordersCol = adminDb.collection('orders');
    const orderSnapshot = await ordersCol.orderBy('orderDate', 'desc').get();
    const orderList = orderSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            orderDate: (data.orderDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Order
        });
    return orderList;
  } catch (error: any) {
    if (error.code === 'not-found' || error.code === 5) {
        console.error("Firestore error: The 'orders' collection was not found. Please ensure you have created a Firestore database and added the collection.");
    } else {
        console.error("Error fetching orders:", error);
    }
    return [];
  }
}
