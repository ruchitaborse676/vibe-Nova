import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types/index.js';
import { api, setAuthToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  addAddress: (address: Omit<Address, 'id' | '_id'>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.login({ email, password: pass });
      if (res.success && res.user) {
        setAuthToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await api.register({ name, email, password: pass });
      if (res.success && res.user) {
        setAuthToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (name: string, phone?: string) => {
    try {
      const res = await api.updateProfile({ name, phone });
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | '_id'>) => {
    try {
      const res = await api.addAddress(address);
      if (res.success && user) {
        setUser({ ...user, addresses: res.addresses });
        return { success: true };
      }
      return { success: false, error: 'Failed to add address' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await api.deleteAddress(id);
      if (res.success && user) {
        setUser({ ...user, addresses: res.addresses });
        return { success: true };
      }
      return { success: false, error: 'Failed to delete address' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
