'use client'

import ProtectedRoute from '@/components/protected-route'
import { UserRole } from '@/enums/enum'
import AdminSidebar from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="h-screen flex">
        <div className="hidden md:flex w-64 flex-col fixed h-full">
          <AdminSidebar />
        </div>
        <main className="md:ml-64 flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

