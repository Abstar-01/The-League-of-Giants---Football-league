import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';
import { cookies } from 'next/headers';

async function getUserFromSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie.value);
    return sessionData;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const reminders = await Reminder.find({ userId: user.id })
      .sort({ reminderDate: 1 })
      .lean();

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      matchId, 
      homeTeam, 
      awayTeam, 
      league, 
      gameDate, 
      gameTime, 
      reminderTitle, 
      reminderNote, 
      reminderDate 
    } = body;

    if (!matchId || !homeTeam || !awayTeam || !league || !gameDate || !reminderTitle || !reminderDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingReminder = await Reminder.findOne({
      userId: user.id,
      matchId
    });

    if (existingReminder) {
      return NextResponse.json(
        { error: 'Reminder already exists for this match' },
        { status: 409 }
      );
    }

    const reminder = new Reminder({
      userId: user.id,
      matchId,
      homeTeam,
      awayTeam,
      league,
      gameDate,
      gameTime: gameTime || 'TBD',
      reminderTitle,
      reminderNote: reminderNote || '',
      reminderDate
    });

    await reminder.save();

    const savedReminder = reminder.toObject();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Reminder created successfully',
        reminder: savedReminder
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A reminder for this match already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

// Update an existing reminder
export async function PUT(request: Request) {
  try {
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      matchId, 
      reminderTitle, 
      reminderNote, 
      reminderDate 
    } = body;

    if (!matchId || !reminderTitle || !reminderDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const reminder = await Reminder.findOneAndUpdate(
      { userId: user.id, matchId },
      {
        reminderTitle,
        reminderNote: reminderNote || '',
        reminderDate
      },
      { new: true } // Return the updated document
    );

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Reminder updated successfully',
        reminder: reminder.toObject()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

// Delete a reminder
export async function DELETE(request: Request) {
  try {
    const user = await getUserFromSession();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete the reminder
    const reminder = await Reminder.findOneAndDelete({
      userId: user.id,
      matchId
    });

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Reminder deleted successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}