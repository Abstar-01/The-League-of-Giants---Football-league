import mongoose from 'mongoose';

export interface IReminder {
  userId: mongoose.Types.ObjectId;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  gameDate: string;
  gameTime: string;
  reminderTitle: string;
  reminderNote: string;
  reminderDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new mongoose.Schema<IReminder>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  matchId: {
    type: String,
    required: [true, 'Match ID is required'],
    index: true
  },
  homeTeam: {
    type: String,
    required: [true, 'Home team is required']
  },
  awayTeam: {
    type: String,
    required: [true, 'Away team is required']
  },
  league: {
    type: String,
    required: [true, 'League is required']
  },
  gameDate: {
    type: String,
    required: [true, 'Game date is required']
  },
  gameTime: {
    type: String,
    required: [true, 'Game time is required']
  },
  reminderTitle: {
    type: String,
    required: [true, 'Reminder title is required']
  },
  reminderNote: {
    type: String,
    default: ''
  },
  reminderDate: {
    type: String,
    required: [true, 'Reminder date is required']
  }
}, {
  collection: 'reminders',
  timestamps: true // This automatically adds and manages createdAt and updatedAt!
});

// Compound index to ensure a user can't have duplicate reminders for the same match
ReminderSchema.index({ userId: 1, matchId: 1 }, { unique: true });

let Reminder: mongoose.Model<IReminder>;

try {
  Reminder = mongoose.model<IReminder>('Reminder');
} catch {
  Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
}

export default Reminder;