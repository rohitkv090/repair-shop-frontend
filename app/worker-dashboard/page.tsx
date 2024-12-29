
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WorkerAcceptedJobs from "@/components/worker-accepted-jobs"
import WorkerRecordList from "@/components/worker-record-list"
import { UserRole } from "@/enums/enum"

export default function WorkerDashboard() {

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.WORKER]}>
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-center mb-8">Worker Dashboard</h1>
        <Button>Log Out</Button>
        </div>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Available Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkerRecordList />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Accepted Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkerAcceptedJobs />
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}

