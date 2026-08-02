
'use server';

import { createSellRequest as dbCreateSellRequest } from '@/lib/sells';
import { sellRequestSchema } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { admin } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';

// Helper function to remove undefined properties from an object
function cleanObject(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

export async function createSellRequest(idToken: string, formData: FormData) {
  try {
    if (!idToken) {
      return { success: false, message: 'Authentication token is missing.' };
    }
    
    let decodedToken;
    try {
      decodedToken = await getAuth(admin).verifyIdToken(idToken);
    } catch (error) {
      console.error("Error verifying ID token in sell action:", error);
      return { success: false, message: 'Invalid authentication token.' };
    }
    const userId = decodedToken.uid;
    
    const deviceProblemsRaw = formData.get('deviceProblems') as string;
    const accessoriesRaw = formData.get('accessories') as string;

    const sellRequestData = {
      userId: userId,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      storage: formData.get('storage') as string,
      ram: formData.get('ram') || undefined,
      overallCondition: formData.get('overallCondition') as string,
      screenCondition: formData.get('screenCondition') as string,
      batteryHealth: formData.get('batteryHealth') as string | undefined,
      age: Number(formData.get('age')),
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      location: formData.get('location') as string,
      socialMediaPlatform: formData.get('socialMediaPlatform') || undefined,
      socialMediaHandle: formData.get('socialMediaHandle') || undefined,
      additionalInfo: formData.get('additionalInfo') || undefined,
      deviceSwitchesOn: formData.get('deviceSwitchesOn') === 'true',
      isMDMSRegistered: formData.get('isMDMSRegistered') === 'true',
      wasRepaired: formData.get('wasRepaired') === 'true',
      deviceProblems: deviceProblemsRaw ? deviceProblemsRaw.split(',') : [],
      hasOriginalAccessories: formData.get('hasOriginalAccessories') === 'true',
      accessories: accessoriesRaw ? accessoriesRaw.split(',') : [],
      otherAccessory: formData.get('otherAccessory') || undefined,
      hasPurchaseBill: formData.get('hasPurchaseBill') === 'true',
      accessoryDetails: formData.get('accessoryDetails') || undefined,
      imeiMatchesBox: formData.get('imeiMatchesBox') === 'true',
      status: 'pending', // Initial status is always pending
    };
    
    const validatedData = sellRequestSchema.parse(sellRequestData);
    
    const result = await dbCreateSellRequest(validatedData);

    revalidatePath('/admin/buy');
    revalidatePath('/account/sells');
    
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error creating sell request:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to create sell request: ${errorMessage}` };
  }
}
