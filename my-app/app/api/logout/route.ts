// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('userSession');
    
    if (sessionCookie) {
      // Parse the session data
      const sessionData = JSON.parse(sessionCookie.value);
      
      // Update user's login status in database
      await connectDB();
      const user = await User.findById(sessionData.id);
      if (user) {
        await user.updateLoginStatus('logged-out');
        console.log(`User ${user.username} logged out successfully`);
      }
    }
    
    // Clear the session cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    response.cookies.delete('userSession');
    
    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}