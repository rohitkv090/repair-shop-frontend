'use client'
import { useState, useEffect } from 'react';
import RepairRecordForm from "@/components/repair-record-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingState from "@/components/loading-state";

export default function CreateRepairRecord() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingState />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Create Repair Record</h1>
          <p className="text-muted-foreground">
            Add a new repair record to the system with all necessary details.
          </p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Repair Record</CardTitle>
            <CardDescription>
              Fill in the required information to create a new repair record. Device details are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RepairRecordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}