import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'barber' | 'customer';
  phone?: string;
  location?: string;
  shopName?: string;
  experience?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  services?: ({ name: string; duration: number; price: number; description?: string } | string)[];
  workingHours?: {
    [key: string]: {
      start: string;
      end: string;
      closed: boolean;
    };
  };
  specialties?: string[];
  description?: string;
  acceptsWalkins?: boolean;
  avatar?: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string, 
    password: string, 
    name: string, 
    role: 'barber' | 'customer',
    formData: any
  ) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('trimly_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData.user);
      localStorage.setItem('trimly_user', JSON.stringify(userData.user));
      localStorage.setItem('trimly_user_role', userData.user.role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'barber' | 'customer',
    formData: any
  ) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const userData = await response.json();
      setUser(userData.user);
      localStorage.setItem('trimly_user', JSON.stringify(userData.user));
      localStorage.setItem('trimly_user_role', userData.user.role);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userId: string, data: Partial<User>) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const updatedUser = await response.json();
      const userObj = updatedUser.user || updatedUser;
      setUser(userObj);
      localStorage.setItem('trimly_user', JSON.stringify(userObj));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/users/change-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }

      const updatedUser = await response.json();
      const userObj = updatedUser.user || updatedUser;
      setUser(userObj);
      localStorage.setItem('trimly_user', JSON.stringify(userObj));
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trimly_user');
    localStorage.removeItem('trimly_user_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};