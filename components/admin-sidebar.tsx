'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Wrench, Users, FileText, LogOut, LucideIcon } from 'lucide-react'
import { useAuth } from './AuthContext'
import { Button } from './ui/button'

interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const routes: Route[] = [
  {
    label: 'Overview',
    icon: FileText,
    href: '/admin',
    color: "text-sky-500"
  },
  {
    label: 'Items',
    icon: Package,
    href: '/admin/items',
    color: "text-violet-500"
  },
  {
    label: 'Products',
    icon: Package,
    href: '/admin/products',
    color: "text-emerald-500"
  },
  {
    label: 'Workers',
    icon: Users,
    href: '/admin/workers',
    color: "text-pink-700"
  },
  {
    label: 'Repair Records',
    icon: Wrench,
    href: '/admin/repair-records',
    color: "text-orange-700"
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-2">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-slate-800 rounded-lg transition ${
                  pathname === route.href ? 'bg-slate-800 text-white' : 'text-zinc-400'
                }`}
              >
                <div className="flex items-center flex-1">
                  <Icon className={`h-5 w-5 mr-3 ${route.color}`} />
                  {route.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-slate-800" 
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500" />
          Logout
        </Button>
      </div>
    </div>
  )
}

