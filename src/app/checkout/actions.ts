
'use server';

import { revalidatePath } from 'next/cache';
import { createOrder as dbCreateOrder } from '@/lib/orders';
import type { Order } from '@/lib/types';

export async function initiateOrderForPayment(data: Omit<Order, 'id' | 'orderDate' | 'status'>, userId: string): Promise<Order> {
    try {
        const order = await dbCreateOrder(data, userId);
        revalidatePath('/admin/orders');
        revalidatePath('/account/orders');
        return order;
    } catch (error) {
        console.error('Failed to initiate order:', error);
        throw new Error('Failed to initiate order.');
    }
}
