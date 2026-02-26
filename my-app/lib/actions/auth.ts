// lib/actions/auth.ts
'use server';

import connectDB from '../mongodb'; // Add this import
import User from '../models/User';
import { redirect } from 'next/navigation';
import { z } from 'zod'; // Optional: for validation

// Validation schema
const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    username?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string;
  };
  success?: boolean;
};

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  try {
    // Connect to database
    await connectDB(); // Now this should work

    // Extract form data
    const rawData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      username: formData.get('username'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    };

    console.log('Raw form data:', rawData);

    // Validate form data
    const validatedData = signupSchema.safeParse(rawData);

    if (!validatedData.success) {
      console.log('Validation errors:', validatedData.error.flatten().fieldErrors);
      return {
        errors: validatedData.error.flatten().fieldErrors
      };
    }

    console.log('Validated data:', validatedData.data);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.data.email },
        { username: validatedData.data.username }
      ]
    });

    if (existingUser) {
      console.log('Existing user found:', existingUser.email, existingUser.username);
      const errors: SignupState['errors'] = {};
      
      if (existingUser.email === validatedData.data.email) {
        errors.email = ['Email already registered'];
      }
      if (existingUser.username === validatedData.data.username) {
        errors.username = ['Username already taken'];
      }
      
      return { errors };
    }

    // Create new user
    const user = new User({
      firstName: validatedData.data.firstName,
      lastName: validatedData.data.lastName,
      email: validatedData.data.email,
      username: validatedData.data.username,
      password: validatedData.data.password
    });

    console.log('Attempting to save user:', user);

    // Save to database
    await user.save();

    console.log('User created successfully:', user.username);

    return { success: true };

  } catch (error) {
    console.error('Signup error:', error);
    
    // Check for MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      const keyPattern = (error as any).keyPattern;
      const errors: SignupState['errors'] = {};
      
      if (keyPattern?.email) {
        errors.email = ['Email already registered'];
      }
      if (keyPattern?.username) {
        errors.username = ['Username already taken'];
      }
      
      return { errors };
    }
    
    return {
      errors: {
        general: `An error occurred during signup: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}

// Login function (if you need it)
export async function login(
  prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  try {
    await connectDB();

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { error: 'Username and password are required' };
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    }).select('+password');

    if (!user) {
      return { error: 'Invalid username or password' };
    }

    // Check password
    const isValid = await user.comparePassword(password);

    if (!isValid) {
      return { error: 'Invalid username or password' };
    }

    // Here you would typically create a session or JWT
    // For now, we'll just return success
    return { success: true };

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }
}