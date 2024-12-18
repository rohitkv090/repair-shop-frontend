// pages/repair-records.tsx (or wherever your RepairRecords component is located)

import AddRecordForm from "@/components/add-record-form"
import ProtectedRoute from "@/components/protected-route"
import RecordsList from "@/components/records-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/enums/enum"

export default function RepairRecords() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.WORKER]}> {/* Pass the allowedRoles prop here */}
      <main className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Repair Shop Records</h1>
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
              <CardTitle>Existing Records</CardTitle>
            </CardHeader>
            <CardContent>
              <RecordsList />
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
