'use client'
import { useState, useEffect } from 'react';
import AdminRecordsList from "@/components/admin-records-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LoadingState from "@/components/loading-state"

export default function RepairRecords() {
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
        <h1 className="text-3xl font-bold tracking-tight">Repair Records</h1>
        <Link href="/admin/repair-records/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Record
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>All Repair Records</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminRecordsList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

