'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAuth } from './AuthContext'
import { Record } from '@/app/types/record'

export default function WorkerRecordList() {
  const [records, setRecords] = useState<Record[]>([])
  const { token } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords()
  }, [token])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records?status=pending`, {
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

  const acceptJob = async (recordId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records/${recordId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Success case
        console.log(data.message);
        fetchRecords(); // Refresh the list of records
      } else if (response.status === 401) {
        // Unauthorized error
        console.error('Unauthorized: Invalid or expired token');
        // TODO: Implement logic to handle token expiration (e.g., redirect to login)
        displayError('Unauthorized: Invalid or expired token')
      } else {
        // Other errors
        console.error(`Error: ${data.message}`);
        displayError(`Error: ${data.message}`)
        // TODO: Display error message to the user
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      displayError('Error accepting job')
      // TODO: Display a generic error message to the user
    }
  };

  const displayError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000); // Clear error after 5 seconds
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Expected Repair Date</TableHead>
            <TableHead>Device Taken On</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.customerName}</TableCell>
              <TableCell>{new Date(record.expectedRepairDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(record.deviceTakenOn).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button onClick={() => acceptJob(record.id)}>Accept</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

