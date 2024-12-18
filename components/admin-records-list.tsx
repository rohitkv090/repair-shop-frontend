'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from './AuthContext'
import { Record } from '@/app/types/record'

export default function AdminRecordsList() {
  const [records, setRecords] = useState<Record[]>([])
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    fetchRecords()
  }, [token])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response);
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

  const getRecordById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setSelectedRecord(data.data)
      } else {
        console.error('Failed to fetch record:', data.message)
      }
    } catch (error) {
      console.error('Error fetching record:', error)
    }
  }

  const updateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRecord) return

    try {
      const response = await fetch(`http://localhost:4000/repair-records/${selectedRecord.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedRecord)
      })
      const data = await response.json()
      if (data.success) {
        fetchRecords()
        setSelectedRecord(null)
      } else {
        console.error('Failed to update record:', data.message)
      }
    } catch (error) {
      console.error('Error updating record:', error)
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => getRecordById(record.id)}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Record</DialogTitle>
                    </DialogHeader>
                    {selectedRecord && (
                      <form onSubmit={updateRecord} className="space-y-4">
                        <div>
                          <Label htmlFor="customerName">Customer Name</Label>
                          <Input
                            id="customerName"
                            value={selectedRecord.customerName}
                            onChange={(e) => setSelectedRecord({...selectedRecord, customerName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expectedRepairDate">Expected Repair Date</Label>
                          <Input
                            id="expectedRepairDate"
                            type="date"
                            value={selectedRecord.expectedRepairDate.split('T')[0]}
                            onChange={(e) => setSelectedRecord({...selectedRecord, expectedRepairDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="deviceTakenOn">Device Taken On</Label>
                          <Input
                            id="deviceTakenOn"
                            type="date"
                            value={selectedRecord.deviceTakenOn.split('T')[0]}
                            onChange={(e) => setSelectedRecord({...selectedRecord, deviceTakenOn: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="imageUrls">Image URLs (comma-separated)</Label>
                          <Input
                            id="imageUrls"
                            value={selectedRecord.imageUrls.join(',')}
                            onChange={(e) => setSelectedRecord({...selectedRecord, imageUrls: e.target.value.split(',')})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="videoUrl">Video URL</Label>
                          <Input
                            id="videoUrl"
                            value={selectedRecord.videoUrl}
                            onChange={(e) => setSelectedRecord({...selectedRecord, videoUrl: e.target.value})}
                          />
                        </div>
                        <Button type="submit">Update Record</Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

