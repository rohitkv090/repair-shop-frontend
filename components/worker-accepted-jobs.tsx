'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from './AuthContext'
import { MediaViewer } from './MediaViewer'
import { Record } from './admin-records-list'

export default function WorkerAcceptedJobs() {
  const [records, setRecords] = useState<Record[]>([])
  const { token } = useAuth()

  useEffect(() => {
    fetchRecords()
  }, [token])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records/my/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setRecords(data.data)
      } else {
        console.error('Failed to fetch records:', data.message)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  return (
    <div className="space-y-4">
      {records.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Expected Repair Date</TableHead>
                <TableHead>Device Taken On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Media</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.customerName}</TableCell>
                  <TableCell>{new Date(record.expectedRepairDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(record.deviceTakenOn).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <MediaViewer
                      recordId={record.id}
                      images={record.images}
                      videos={record.videos}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No assigned jobs found</p>
        </div>
      )}
    </div>
  )
}

