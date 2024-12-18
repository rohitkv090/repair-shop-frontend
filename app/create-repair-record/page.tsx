import RepairRecordForm from "@/components/repair-record-form";

export default function CreateRepairRecord() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">Create Repair Record</h1>
        <RepairRecordForm />
      </div>
    </main>
  )
}

