'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from './AuthContext'
import { UserRole } from '@/enums/enum'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.role)
    }
  }, [user])

  const redirectBasedOnRole = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      router.push('/admin')
    } else if (role === UserRole.WORKER) {
      router.push('/worker-dashboard')
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    try {
      setIsLoading(true)
      await login(formData.email, formData.password)
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[350px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              placeholder="Enter your password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

