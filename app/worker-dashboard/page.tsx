"use client"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WorkerAcceptedJobs from "@/components/worker-accepted-jobs"
import { UserRole } from "@/enums/enum"
import { useAuth } from "@/components/AuthContext"
import { LogOut } from "lucide-react"

export default function WorkerDashboard() {
  const { logout } = useAuth()

  return (
    <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold mb-8">Worker Dashboard</h1>
          <Button 
            variant="ghost" 
            onClick={logout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            Logout
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Assigned Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkerAcceptedJobs />
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  )
}

