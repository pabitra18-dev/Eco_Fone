
import { NextResponse } from 'next/server';
import { getDemandById } from '@/app/account/demands/actions';
import { headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { admin, db } from '@/lib/firebaseAdmin';
import type { Demand } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { getAuthenticatedUserId } from '@/lib/auth';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { id } = params;
    const demandRef = db.collection('demands').doc(id);
    const docSnap = await demandRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ message: 'Demand not found' }, { status: 404 });
    }
    
    const data = docSnap.data();
    if (!data) {
        return NextResponse.json({ message: 'Demand data is empty' }, { status: 404 });
    }
    
    if (data.userId !== userId) {
        return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    const createdAtTimestamp = data.createdAt as Timestamp;
    const createdAt = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString();

    const updatedAtTimestamp = data.updatedAt as Timestamp;
    const updatedAt = updatedAtTimestamp?.toDate ? updatedAtTimestamp.toDate().toISOString() : undefined;

    const demand: Demand = {
      id: docSnap.id,
      ...data,
      createdAt,
      updatedAt,
    } as Demand;
    
    return NextResponse.json(demand);

  } catch (error) {
    console.error("API error fetching demand:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        return NextResponse.json({ success: false, message: "Authentication failed." }, { status: 401 });
    }
    
    const { id } = params;
    const result = await deleteUserDemand(id);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 403 });
    }
  } catch (error: any) {
    console.error('API Error deleting demand:', error);
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete demand.' }, { status: 500 });
  }
}
