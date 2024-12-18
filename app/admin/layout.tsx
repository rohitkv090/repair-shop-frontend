import { AdminSidebar } from '@/components/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AdminSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

