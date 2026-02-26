// lib/session.ts
import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  loginStatus: string;
  lastLoginAt: string;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('userSession');
    
    if (!sessionCookie) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getUserFromSession(): Promise<UserSession | null> {
  return getSession();
}