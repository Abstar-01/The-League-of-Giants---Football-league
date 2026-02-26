import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  loginStatus: string;
  lastLoginAt: string;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('currentUser');
        setUser(null);
        router.refresh();
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setCurrentUser = (userData: UserData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
    router.refresh();
  };

  return { user, loading, logout, setCurrentUser };
}