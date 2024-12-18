import AddRecordForm from "@/components/add-record-form"
import AdminRecordsList from "@/components/admin-records-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
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
  )
}

