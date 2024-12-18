import AddRecordForm from "@/components/add-record-form"
import AdminRecordsList from "@/components/admin-records-list"
import ProtectedRoute from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/enums/enum"

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <main className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Record</CardTitle>
            </CardHeader>
            <CardContent>
              <AddRecordForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>All Records</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminRecordsList />
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}

