
'use server';
import { submitDemand as dbSubmitDemand, updateDemand as dbUpdateDemand } from '@/lib/demands';
import type { DemandFormValues } from '@/components/demand-form';
import { admin } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';

function cleanObject(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}


export async function submitDemand(data: DemandFormValues, idToken: string, editingId?: string) {
  try {
    let decodedToken;
    try {
        decodedToken = await getAuth(admin).verifyIdToken(idToken);
    } catch (error) {
        throw new Error("User is not authenticated. Please log in again.");
    }
    const userId = decodedToken.uid;
    
    // Construct the final data object, cleaning it up for Firestore
    const finalData: DemandFormValues = {
        ...data,
        brand: data.demandType === 'specific' ? (data.brand === '__other__' ? data.customBrand || '' : data.brand) : undefined,
        model: data.demandType === 'specific' ? (data.model === '__other__' ? data.customModel || '' : data.model) : undefined,
    };
    
    // Remove fields that are not relevant for the specific demand type
    if (finalData.demandType === 'general') {
        delete (finalData as any).brand;
        delete (finalData as any).model;
        delete (finalData as any).customBrand;
        delete (finalData as any).customModel;
    } else {
        delete (finalData as any).categories;
    }
    delete (finalData as any).customBrand;
    delete (finalData as any).customModel;

    const cleanedData = cleanObject(finalData);

    if (editingId) {
        await dbUpdateDemand(editingId, userId, cleanedData as DemandFormValues);
    } else {
        await dbSubmitDemand(userId, cleanedData as DemandFormValues);
    }

    revalidatePath('/admin/demands');
    revalidatePath('/account/demands');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error('Error in submitDemand server action:', errorMessage);
    return { success: false, message: `Failed to submit your demand. ${errorMessage}` };
  }
}
