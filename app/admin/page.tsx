'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Wrench } from "lucide-react"
import { useEffect, useState } from "react"
import { itemsApi } from "@/lib/api"

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalItems: 0,
    activeWorkers: 0,
    pendingRepairs: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const itemsResponse = await itemsApi.getAllItems()
        if (itemsResponse.success) {
          const items = itemsResponse.data || []
          setStats(prev => ({
            ...prev,
            totalItems: items.length
          }))
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Workers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Repairs
            </CardTitle>
            <Wrench className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRepairs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will be implemented here
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Items Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Items management list will be implemented here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

