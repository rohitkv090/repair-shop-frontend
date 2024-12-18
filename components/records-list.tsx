'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from './AuthContext'


interface Record {
  id: string
  customerName: string
  expectedRepairDate: string
  deviceTakenOn: string
  description: string
}

export default function RecordsList() {
  const [records, setRecords] = useState<Record[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    fetchRecords()
  }, [searchTerm, token])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records?search=${searchTerm}`, {
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
      <Input
        type="text"
        placeholder="Search records..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Expected Repair Date</TableHead>
            <TableHead>Device Taken On</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.customerName}</TableCell>
              <TableCell>{record.expectedRepairDate}</TableCell>
              <TableCell>{record.deviceTakenOn}</TableCell>
              <TableCell>{record.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

