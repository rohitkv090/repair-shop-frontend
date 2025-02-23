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

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Expected Repair Date</TableHead>
            <TableHead>Device Taken On</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.customerName}</TableCell>
              <TableCell>{new Date(record.expectedRepairDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(record.deviceTakenOn).toLocaleDateString()}</TableCell>
              <TableCell>{record.status}</TableCell>
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
  )
}

