import RepairRecordForm from "@/components/repair-record-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import { UserRole } from "@/enums/enum";

export default function CreateRepairRecord() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create Repair Record</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New Repair Record</CardTitle>
          </CardHeader>
          <CardContent>
            <RepairRecordForm />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

