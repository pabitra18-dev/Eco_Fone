
'use server';

import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { admin } from '@/lib/firebaseAdmin';

export async function getAuthenticatedUserId(): Promise<string | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    // verifySessionCookie() checks if the cookie is expired, revoked, etc.
    const decodedToken = await auth(admin).verifySessionCookie(
      sessionCookie,
      true // checkRevoked must be true
    );
    return decodedToken.uid;
  } catch (error) {
    // Session cookie is invalid or expired.
    console.error('Session cookie verification failed:', error);
    return null;
  }
}
