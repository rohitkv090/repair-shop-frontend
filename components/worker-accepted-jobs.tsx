'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from './AuthContext'
import { Record } from '@/app/types/record'


export default function WorkerAcceptedJobs() {
  const [records, setRecords] = useState<Record[]>([])
  const { token } = useAuth()

  useEffect(() => {
    fetchRecords()
  }, [token])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records?status=in-progress,completed`, {
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

  const updateJobStatus = async (recordId: string, status: 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (data.success) {
        fetchRecords()
      } else {
        console.error('Failed to update job status:', data.message)
      }
    } catch (error) {
      console.error('Error updating job status:', error)
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
            <TableHead>Action</TableHead>
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
                <Select
                  onValueChange={(value) => updateJobStatus(record.id, value as 'in-progress' | 'completed')}
                  defaultValue={record.status}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

