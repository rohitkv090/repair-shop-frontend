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

  useEffect(() => {

    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')


  if (storedUser && storedToken) {
    try {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setToken(storedToken)
    } catch (error) {
      console.error('Error parsing user:', error)
    }
  }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log(process.env.BACKEND_URL);
      const response = await fetch(`http://localhost:4000/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      console.log(data);
      if (data.success) {
        setUser(data.data.user)
        setToken(data.data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('token', data.data.accessToken)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
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

