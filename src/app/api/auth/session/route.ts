import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import admin from '@/lib/firebaseAdmin'; // Fixed: Import default admin correctly

export const dynamic = 'force-dynamic'; // Ensures Vercel doesn't statically pre-render this route

// This route handles creating a session cookie upon successful login.
export async function POST(request) { // Fixed: Removed TypeScript ': Request' type declaration
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ success: false, message: 'Missing ID token' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await getAuth(admin).createSessionCookie(idToken, { expiresIn });
    
    // In Next.js App Router, cookies().set() takes separate arguments (name, value, options)
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge in Next.js cookies expects seconds, not milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ success: false, message: 'Failed to create session' }, { status: 500 });
  }
}

// This route handles clearing the session cookie upon logout.
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
}
