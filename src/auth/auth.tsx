// auth.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the authentication context
interface AuthContextProps {
  isLoading: boolean;
  userData: any | null;
  token: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper to manage cookies
const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Load the token from cookies when the provider initializes
    return getCookie('authToken');
  });

  useEffect(() => {
    if (token) {
      // Restore userData if needed, e.g., from an API
      fetchUserData(token).then((user) => setUserData(user || null));
    }
  }, [token]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
    return null;
  };

  const signIn = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { access_token, token_type } = await response.json();
      setToken(access_token);

      // Persist token in cookies
      setCookie('authToken', access_token, 7); // Save for 7 days

      // Fetch user data after login
      const userResponse = await fetch('http://localhost:8000/auth/user', {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });

      if (userResponse.ok) {
        const user = await userResponse.json();
        setUserData(user || null);
      } else {
        throw new Error('Failed to fetch user data after login');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setUserData(null);
      setToken(null);
      deleteCookie('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setToken(null);
    setUserData(null);
    deleteCookie('authToken');
  };

  return (
    <AuthContext.Provider value={{ isLoading, userData, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextProps | undefined => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
