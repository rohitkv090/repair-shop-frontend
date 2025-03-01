'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAuth } from './AuthContext'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { MediaViewer } from './MediaViewer'

type MediaFile = {
  id: number;
  url: string;
};

type RepairItem = {
  id: number;
  repairRecordId: number;
  itemId: number;
  quantity: number;
  priceAtTime: number;
  description: string;
  itemName: string;
  itemDescription: string;
  createdAt: string;
  updatedAt: string;
};

type Record = {
  id: number;
  customerName: string;
  expectedRepairDate: string;
  deviceTakenOn: string;
  status: "pending" | "in-progress" | "completed";
  assigned_to?: {
    id: number;
    name: string;
  };
  images: MediaFile[];
  videos: MediaFile[];
  description: string | null;
  customerNumber: string;
  deviceCompany: string | null;
  deviceModel: string | null;
  deviceColor: string | null;
  devicePassword: string | null;
  deviceIssue: string | null;
  createdAt: string;
  updatedAt: string;
  repairItems: RepairItem[];
  finalCost: number;
};

export default function WorkerRecordList() {
  const [records, setRecords] = useState<Record[]>([])
  const { token } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 10; // Fixed limit of 10 records per page

  useEffect(() => {
    fetchRecords()
  }, [token, currentPage]) // Add currentPage as dependency

  const fetchRecords = async () => {
    try {
      const query = new URLSearchParams({
        status: 'pending',
        offset: ((currentPage - 1) * LIMIT).toString(),
        limit: LIMIT.toString()
      });

      const response = await fetch(`http://localhost:4000/repair-records?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setRecords(data.data.records)
        setTotalRecords(data.data.total)
      } else {
        console.error('Failed to fetch records:', data.message)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    }
  }

  const acceptJob = async (recordId: number) => {
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

  const toggleExpandRecord = (recordId: number) => {
    setExpandedRecord(expandedRecord === recordId.toString() ? null : recordId.toString());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / LIMIT);

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
                  <Button onClick={() => acceptJob(record.id)}>Accept Job</Button>
                  <Button variant="outline" onClick={() => toggleExpandRecord(record.id)}>
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

              {record.images && record.videos && (record.images.length > 0 || record.videos.length > 0) ? (
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

                  {record.repairItems && record.repairItems.length > 0 && (
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
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {records.length} of {totalRecords} records
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center justify-center min-w-[5rem]">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

