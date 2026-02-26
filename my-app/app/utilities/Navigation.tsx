'use client';

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

import FootballImage from "@/public/foot-ball.png";

const inter = Inter({ subsets: ["latin"] });

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useUserStore();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Check if current page is login/signup page
  const isAuthPage = pathname === '/SignUp' || pathname === '/SignIn' || pathname === '/login';

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't render navigation on auth pages
  if (isAuthPage) {
    return null;
  }

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <nav className="bg-[#0a0c0f] border-b border-[#262b33] py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo - Always visible */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-1 sm:flex-none">
          <div className="relative flex-shrink-0">
            <Image 
              src={FootballImage} 
              width={28} 
              height={28} 
              alt="Logo"
              className="sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] opacity-0 group-hover:opacity-20 rounded-full blur-md transition-opacity duration-300"></div>
          </div>
          <h2 className={`text-white font-bold text-sm sm:text-base md:text-xl tracking-wide truncate ${inter.className}`}>
            <span className="hidden xs:inline">THE LEAGUE OF GIANTS</span>
            <span className="xs:hidden">GIANTS</span>
          </h2>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3">
          <Link 
            href="/FanClub" 
            className="px-4 md:px-5 py-1.5 md:py-2 bg-[#1a1d23] hover:bg-[#2f3540] border border-[#2d333d] rounded-lg transition-all duration-300 hover:scale-105"
          >
            <span className="text-[#95a5b8] hover:text-white transition-colors duration-200 text-xs md:text-sm font-medium whitespace-nowrap">
              Clubs
            </span>
          </Link>

          <Link 
            href="/Fixtures" 
            className="px-4 md:px-5 py-1.5 md:py-2 bg-[#1a1d23] hover:bg-[#2f3540] border border-[#2d333d] rounded-lg transition-all duration-300 hover:scale-105"
          >
            <span className="text-[#95a5b8] hover:text-white transition-colors duration-200 text-xs md:text-sm font-medium whitespace-nowrap">
              Fixtures
            </span>
          </Link>

          {/* Conditional Rendering: Profile Icon or Sign In */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              {/* Profile Button */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#1a1d23] hover:bg-[#2f3540] border border-[#2d333d] rounded-lg transition-all duration-300 group"
              >
                {/* Avatar with User Initials */}
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                  {getUserInitials()}
                </div>
                <span className="text-white text-xs md:text-sm font-medium max-w-[80px] truncate">
                  {user.username}
                </span>
                <svg 
                  className={`w-4 h-4 text-[#95a5b8] transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1d23] border border-[#2d333d] rounded-lg shadow-xl overflow-hidden animate-fadeIn">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-[#262b33]">
                    <p className="text-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-[#95a5b8] text-xs mt-1 truncate">{user.email}</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-[#95a5b8] hover:text-white hover:bg-[#252a33] rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </Link>
                    
                    <div className="border-t border-[#262b33] my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/SignIn" 
              className="px-4 md:px-5 py-1.5 md:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 border border-[#2d333d] rounded-lg transition-all duration-300 hover:scale-105"
            >
              <span className="text-white transition-colors duration-200 text-xs md:text-sm font-medium whitespace-nowrap">
                Sign In
              </span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden ml-2 p-2 rounded-lg bg-[#1a1d23] border border-[#2d333d] hover:bg-[#2f3540] transition-all duration-300"
          aria-label="Toggle menu"
        >
          <svg 
            className="w-5 h-5 text-[#95a5b8]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-[#0a0c0f] border-b border-[#262b33] py-3 px-4 shadow-xl animate-slideDown">
          <div className="flex flex-col gap-2">
            {user && (
              <>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg mb-2">
                  <p className="text-white text-sm font-medium">Signed in as</p>
                  <p className="text-[#95a5b8] text-xs truncate">{user.email}</p>
                </div>
              </>
            )}
            <Link 
              href="/FanClub" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-3 bg-[#1a1d23] hover:bg-[#2f3540] border border-[#2d333d] rounded-lg transition-all duration-300 text-center"
            >
              <span className="text-[#95a5b8] hover:text-white transition-colors duration-200 text-sm font-medium">
                Clubs
              </span>
            </Link>
            <Link 
              href="/Fixtures" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full px-4 py-3 bg-[#1a1d23] hover:bg-[#2f3540] border border-[#2d333d] rounded-lg transition-all duration-300 text-center"
            >
              <span className="text-[#95a5b8] hover:text-white transition-colors duration-200 text-sm font-medium">
                Fixtures
              </span>
            </Link>
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-4 py-3 bg-[#1a1d23] hover:bg-[#2f3540] border border-[#2d333d] rounded-lg transition-all duration-300 text-center"
                >
                  <span className="text-[#95a5b8] hover:text-white transition-colors duration-200 text-sm font-medium">
                    Profile
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-all duration-300 text-center"
                >
                  <span className="text-red-400 text-sm font-medium">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <Link 
                href="/SignIn" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 border border-[#2d333d] rounded-lg transition-all duration-300 text-center"
              >
                <span className="text-white transition-colors duration-200 text-sm font-medium">
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        /* Custom breakpoint for extra small devices */
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}