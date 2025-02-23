import { AuthProvider } from '@/components/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Repair Shop Management',
  description: 'Repair Shop Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

