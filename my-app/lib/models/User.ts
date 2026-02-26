import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  loginStatus: 'logged-in' | 'logged-out';
  lastLoginAt?: Date;
  lastLogoutAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  loginStatus: {
    type: String,
    enum: ['logged-in', 'logged-out'],
    default: 'logged-out',
    required: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastLogoutAt: {
    type: Date,
    default: null
  }
}, {
  collection: 'users' // Explicitly set the collection name
});

// Hash password before saving - FIXED: Using async function without next callback
UserSchema.pre('save', async function() {
  // Only hash if password is modified (or new)
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update login status
UserSchema.methods.updateLoginStatus = async function(status: 'logged-in' | 'logged-out') {
  this.loginStatus = status;
  
  if (status === 'logged-in') {
    this.lastLoginAt = new Date();
  } else {
    this.lastLogoutAt = new Date();
  }
  
  return this.save();
};

// ULTRA SAFE: Use try-catch to prevent model overwrite errors
let User: mongoose.Model<IUser>;

try {
  // Try to get the existing model
  User = mongoose.model<IUser>('User');
} catch {
  // If it doesn't exist, create it with the collection name
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;