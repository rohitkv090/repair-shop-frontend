'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import { UserRole } from '@/enums/enum'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (!user || !token) {
        router.push('/')
        return
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized')
        return
      }
    }

    checkAuth()
  }, [user, token, router, allowedRoles])

  // Show nothing while checking authentication
  if (!user || !token || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}

