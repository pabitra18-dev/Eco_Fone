
'use server';

import { db } from '@/lib/firebaseAdmin';
import type { Order, Sell } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

export type SaleRecord = {
  id: string;
  type: 'Order' | 'Purchase'; // 'Order' is a sale TO a customer, 'Purchase' is a buy FROM a customer
  date: string;
  customerName: string;
  items: string;
  amount: number;
  status: string;
};

async function getOrders(): Promise<SaleRecord[]> {
  const ordersRef = db.collection('orders');
  const snapshot = await ordersRef.orderBy('orderDate', 'desc').get();
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Order;
    return {
      id: doc.id,
      type: 'Order',
      date: (data.orderDate as unknown as Timestamp).toDate().toISOString(),
      customerName: data.shippingAddress.name,
      items: data.items.map(i => i.productName).join(', '),
      amount: data.totalAmount,
      status: data.status,
    };
  });
}

async function getPurchases(): Promise<SaleRecord[]> {
  const sellsRef = db.collection('sells');
  // Filter for completed purchases
  const q = sellsRef.where('status', 'in', ['accepted', 'completed']).orderBy('createdAt', 'desc');
  const snapshot = await q.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Sell;
    // The createdAt field might be a Timestamp or an ISO string depending on how it was set.
    const dateObject = (data.createdAt as unknown as Timestamp)?.toDate ? (data.createdAt as unknown as Timestamp).toDate() : new Date(data.createdAt);
    return {
      id: doc.id,
      type: 'Purchase',
      date: dateObject.toISOString(),
      customerName: data.fullName,
      items: `${data.brand} ${data.model}`,
      amount: data.acceptedPrice || 0, // Use accepted price, which is cost to business
      status: data.status,
    };
  });
}

export async function getAllSalesData(): Promise<SaleRecord[]> {
  try {
    const [orders, purchases] = await Promise.all([getOrders(), getPurchases()]);
    
    const combined = [...orders, ...purchases];
    
    // Sort combined data by date, descending
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return combined;
  } catch (error) {
    console.error("Error fetching all sales data:", error);
    return [];
  }
}
