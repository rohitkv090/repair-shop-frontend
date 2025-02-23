'use client'

import { UserRole } from '@/enums/enum'
import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole.ADMIN | UserRole.WORKER
}
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const checkTokenExpiration = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        logout();
        return false;
      }
      return true;
    } catch (e) {
      logout();
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      try {
        if (checkTokenExpiration(storedToken)) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setToken(storedToken)
        }
      } catch (error) {
        console.error('Error parsing user:', error)
        logout()
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.success && data.data) {
        const { user, accessToken } = data.data;
        setUser(user);
        setToken(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // Clear any other sensitive data
    localStorage.clear()
    // Force reload to clear any cached state
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

