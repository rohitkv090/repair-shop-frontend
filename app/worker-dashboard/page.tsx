"use client"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WorkerAcceptedJobs from "@/components/worker-accepted-jobs"
import { UserRole } from "@/enums/enum"
import { useAuth } from "@/components/AuthContext"
import { LogOut, Wrench } from "lucide-react"

export default function WorkerDashboard() {
  const { logout } = useAuth()

  return (
    <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
      <div className="h-screen flex bg-background">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold">Worker Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage your assigned repair jobs</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={logout}
                className="flex items-center gap-2" 
              >
                <LogOut className="h-5 w-5 text-red-500" />
                Logout
              </Button>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Your Tasks
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <WorkerAcceptedJobs />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

