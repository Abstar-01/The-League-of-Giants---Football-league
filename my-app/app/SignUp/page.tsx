'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { signup } from '@/lib/actions/auth';

const initialState = {
  errors: {},
  success: false
};

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const [state, formAction, isPending] = useActionState(signup, initialState);

  useEffect(() => {
    document.body.classList.add('signup-page');
    return () => {
      document.body.classList.remove('signup-page');
    };
  }, []);

  useEffect(() => {
    if (state.errors?.general) {
      setNotification({
        show: true,
        message: state.errors.general,
        type: 'error'
      });
      
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    if (state.errors && Object.keys(state.errors).length > 0) {
      const firstError = Object.values(state.errors)[0]?.[0];
      if (firstError) {
        setNotification({
          show: true,
          message: firstError,
          type: 'error'
        });
        
        const timer = setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [state.errors]);

  useEffect(() => {
    if (state.success) {
      setNotification({
        show: true,
        message: 'Account created successfully! Redirecting to login...',
        type: 'success'
      });
      
      const timer = setTimeout(() => {
        router.push('/SignIn?registered=true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Notification Toast - Top Right */}
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 text-sm sm:text-base ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white max-w-[90vw] sm:max-w-md animate-slideIn`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sign Up Card - Smaller and more compact */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Decorative Elements - Smaller */}
        <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 rounded-full blur-xl"></div>
        
        {/* Main Card - Smaller padding */}
        <div className="relative bg-[#1a1d23]/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-[#2d333d] shadow-2xl overflow-hidden p-5 sm:p-6 md:p-8">
          {/* Title Section - More compact */}
          <div className="mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Sign Up & start your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Journey</span>
            </h1>
            <p className="text-sm sm:text-base text-[#95a5b8]">
              Join The League of Giants
            </p>
          </div>

          {/* Loading State as Banner - More compact */}
          {isPending && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-xs sm:text-sm flex items-center gap-2">
                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating your account...
              </p>
            </div>
          )}

          {/* Sign Up Form */}
          <form action={formAction}>
            {/* Two Column Layout - Smaller gap on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* First Name - Smaller inputs */}
                <div>
                  <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-[#95a5b8] mb-1 sm:mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue=""
                      disabled={isPending}
                      className={`w-full bg-[#252a33] text-white rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-5 py-2.5 sm:py-3 text-sm sm:text-base border ${
                        state.errors?.firstName ? 'border-red-500' : 'border-[#2d333d]'
                      } focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570] disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="First name"
                    />
                  </div>
                  {state.errors?.firstName && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.firstName[0]}</p>
                  )}
                </div>

                {/* Last Name - Smaller inputs */}
                <div>
                  <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-[#95a5b8] mb-1 sm:mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue=""
                      disabled={isPending}
                      className={`w-full bg-[#252a33] text-white rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-5 py-2.5 sm:py-3 text-sm sm:text-base border ${
                        state.errors?.lastName ? 'border-red-500' : 'border-[#2d333d]'
                      } focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570] disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Last name"
                    />
                  </div>
                  {state.errors?.lastName && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.lastName[0]}</p>
                  )}
                </div>

                {/* Email - Smaller inputs */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#95a5b8] mb-1 sm:mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue=""
                      disabled={isPending}
                      className={`w-full bg-[#252a33] text-white rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-5 py-2.5 sm:py-3 text-sm sm:text-base border ${
                        state.errors?.email ? 'border-red-500' : 'border-[#2d333d]'
                      } focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570] disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {state.errors?.email && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.email[0]}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Username - Smaller inputs */}
                <div>
                  <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-[#95a5b8] mb-1 sm:mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      defaultValue=""
                      disabled={isPending}
                      className={`w-full bg-[#252a33] text-white rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-3 sm:pr-5 py-2.5 sm:py-3 text-sm sm:text-base border ${
                        state.errors?.username ? 'border-red-500' : 'border-[#2d333d]'
                      } focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570] disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Choose username"
                    />
                  </div>
                  {state.errors?.username && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.username[0]}</p>
                  )}
                </div>

                {/* Password - Smaller inputs */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#95a5b8] mb-1 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue=""
                      disabled={isPending}
                      className={`w-full bg-[#252a33] text-white rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border ${
                        state.errors?.password ? 'border-red-500' : 'border-[#2d333d]'
                      } focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570] disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center disabled:opacity-50"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {state.errors?.password && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.password[0]}</p>
                  )}
                </div>

                {/* Confirm Password - Smaller inputs */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-[#95a5b8] mb-1 sm:mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      defaultValue=""
                      disabled={isPending}
                      className={`w-full bg-[#252a33] text-white rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border ${
                        state.errors?.confirmPassword ? 'border-red-500' : 'border-[#2d333d]'
                      } focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5a6570] disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isPending}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#5a6570] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {state.errors?.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{state.errors.confirmPassword[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - More compact */}
            <div className="flex justify-between items-center pt-4 border-t border-[#262b33]">
              <Link
                href="/SignIn"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#252a33] text-[#95a5b8] hover:text-white hover:bg-[#2f3540] rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Back
              </Link>

              <button
                type="submit"
                disabled={isPending}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] sm:min-w-[120px] text-sm sm:text-base flex items-center justify-center"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">Creating...</span>
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
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