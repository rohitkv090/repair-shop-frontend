import AdminRecordsList from "@/components/admin-records-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RepairRecords() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Repair Records</h1>
      <Card>
        <CardHeader>
          <CardTitle>Repair Records List</CardTitle>
        </CardHeader>
        <CardContent>
       <AdminRecordsList/>
        </CardContent>
      </Card>
    </main>
  )
}

