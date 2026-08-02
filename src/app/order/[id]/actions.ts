
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebaseAdmin';
import { uploadImageAndGetUrl } from '@/lib/file-upload';

export async function updateOrderPaymentDetails(orderId: string, formData: FormData): Promise<{success: boolean, message?: string}> {
  const transactionCode = formData.get('esewaTransactionCode') as string;
  const screenshotFile = formData.get('paymentScreenshot') as File;

  if (!transactionCode || !screenshotFile || screenshotFile.size === 0) {
      return { success: false, message: 'Missing transaction code or screenshot.' };
  }

  try {
    // 1. Upload screenshot to the free image host
    const screenshotUrl = await uploadImageAndGetUrl(screenshotFile);

    // 2. Update Firestore document
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({
      esewaTransactionCode: transactionCode,
      paymentScreenshotUrl: screenshotUrl,
      status: 'Processing',
    });
    
    revalidatePath(`/order/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');

    console.log(`Order ${orderId} updated with payment details.`);
    return { success: true };
  } catch (error) {
    console.error(`Error updating order ${orderId} with payment details:`, error);
    return { success: false, message: 'Failed to update payment details.' };
  }
}
