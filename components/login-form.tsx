'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, User } from './AuthContext'
import { UserRole } from '@/enums/enum'

export default function LoginForm() {

  // create a effect to check if the user is already logged in
  useEffect(() => {
    const storedUser:User|any = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === UserRole.ADMIN) {
        router.push('/admin')
      } else if (user.role === UserRole.WORKER) {
        router.push('/worker-dashboard')
      }
    }
  }, [])


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      console.log(user);
      if (user.role === UserRole.ADMIN) {
        router.push('/admin')
      } else if (user.role === UserRole.WORKER) {
        router.push('/worker-dashboard')
      } else {
        setError('Invalid user role')
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Log In</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

