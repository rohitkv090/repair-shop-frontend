'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAuth } from './AuthContext'
import { Record } from '@/app/types/record'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { MediaViewer } from './MediaViewer'

export default function WorkerRecordList() {
  const [records, setRecords] = useState<Record[]>([])
  const { token } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

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
        console.log(data.message);
        fetchRecords();
      } else {
        displayError(data.message || 'Failed to accept job');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      displayError('Error accepting job');
    }
  };

  const displayError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const toggleExpandRecord = (recordId: string) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{record.customerName}</h3>
                  <p className="text-sm text-gray-500">Customer Number: {record.customerNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{record.status}</Badge>
                  <Button onClick={() => acceptJob(record.id.toString())}>Accept Job</Button>
                  <Button variant="outline" onClick={() => toggleExpandRecord(record.id.toString())}>
                    {expandedRecord === record.id.toString() ? 'Show Less' : 'Show More'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Device Taken On: {formatDate(record.deviceTakenOn)}</p>
                  <p className="text-sm text-gray-600">Expected Repair: {formatDate(record.expectedRepairDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Device: {record.deviceCompany} {record.deviceModel}</p>
                  <p className="text-sm text-gray-600">Color: {record.deviceColor}</p>
                </div>
              </div>

              {record.images.length > 0 || record.videos.length > 0 ? (
                <div className="mb-4">
                  <MediaViewer
                    recordId={record.id}
                    images={record.images}
                    videos={record.videos}
                  />
                </div>
              ) : null}

              {expandedRecord === record.id.toString() && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Device Issue</h4>
                    <p className="text-sm text-gray-700">{record.deviceIssue || 'No issue description provided'}</p>
                  </div>
                  
                  {record.description && (
                    <div>
                      <h4 className="font-medium mb-2">Additional Description</h4>
                      <p className="text-sm text-gray-700">{record.description}</p>
                    </div>
                  )}

                  {record.repairItems.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Repair Items</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {record.repairItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

