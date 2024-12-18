'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import { UserRole } from '@/enums/enum'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: (UserRole.ADMIN | UserRole.WORKER)[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || !token) {
      router.push('/')
    } else if (!allowedRoles.includes(user.role)) {
      router.push('/unauthorized')
    }
  }, [user, token, router, allowedRoles])

  if (!user || !token || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

