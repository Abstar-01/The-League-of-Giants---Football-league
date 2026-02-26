'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import FootballImage from "@/public/foot-ball.png";

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);

      setNotification({
        show: true,
        message: `Welcome back, ${data.user.firstName}! Redirecting...`,
        type: 'success'
      });

      // Redirect to home page after successful login
      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      setNotification({
        show: true,
        message: err.message,
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] relative overflow-hidden">
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-[#95a5b8] hover:text-white transition-all duration-300 group"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div 
          className={`fixed top-2 right-2 sm:top-4 sm:right-4 z-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg transition-all duration-300 text-xs sm:text-sm ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white max-w-[90vw] sm:max-w-md animate-slideIn`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            {notification.type === 'success' ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="absolute inset-0 flex items-center justify-center p-0 sm:p-4">
        {/* Decorative Elements */}
        <div className="hidden sm:block absolute -top-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="hidden sm:block absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
        
        {/* Main Card */}
        <div className="w-full h-full sm:h-auto sm:max-w-md bg-[#1a1d23] sm:rounded-2xl border-0 sm:border border-[#2d333d] shadow-2xl overflow-auto flex flex-col">
          {/* Header with Gradient */}
          <div className="relative h-36 sm:h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-[#262b33] flex-shrink-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            
            {/* Logo */}
            <div className="absolute -bottom-10 sm:-bottom-10 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-50"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#1a1d23] rounded-full border-4 border-[#2d333d] flex items-center justify-center">
                  <Image 
                    src={FootballImage} 
                    width={32} 
                    height={32} 
                    alt="Logo"
                    className="sm:w-10 sm:h-10 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 sm:px-8 pt-12 sm:pt-14 pb-8 sm:pb-8 overflow-y-auto">
            {/* Title */}
            <div className="text-center mb-8 sm:mb-8">
              <h2 className="text-2xl sm:text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-base sm:text-sm text-[#95a5b8]">Sign in to access your fan club</p>
            </div>

            {/* Error Message */}
            {error && !notification.show && (
              <div className="mb-5 sm:mb-6 p-3 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm sm:text-sm text-center">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm sm:text-sm font-medium text-[#95a5b8] mb-2 sm:mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#252a33] text-white rounded-lg pl-10 sm:pl-10 pr-4 sm:pr-4 py-3 sm:py-3 text-base sm:text-base border border-[#2d333d] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570]"
                    placeholder="Username or email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm sm:text-sm font-medium text-[#95a5b8] mb-2 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#252a33] text-white rounded-lg pl-10 sm:pl-10 pr-10 sm:pr-12 py-3 sm:py-3 text-base sm:text-base border border-[#2d333d] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570]"
                    placeholder="Password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 sm:h-5 sm:w-5 text-[#5a6570] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 sm:h-5 sm:w-5 text-[#5a6570] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 sm:py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-base sm:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Sign In</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 sm:mt-8 text-center text-sm sm:text-sm text-[#5a6570]">
              Don't have an account?{' '}
              <Link 
                href="/SignUp" 
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}