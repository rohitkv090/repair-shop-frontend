'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from './AuthContext'
import { SimpleMediaDisplay } from './SimpleMediaDisplay'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from "./ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

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

type Product = {
  id: string;
  name: string;
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
  products: Product[];
  finalCost: number;
};

export default function WorkerAcceptedJobs() {
  const [records, setRecords] = useState<Record[]>([])
  const { token } = useAuth()
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 10; // Fixed limit of 10 records per page
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMounted, setIsMounted] = useState(false);
  
  // Month filtering state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Generate list of months for the dropdown (current year and previous year)
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const previousYear = currentYear - 1;
    
    // Add months for current year and previous year
    for (let year = currentYear; year >= previousYear; year--) {
      for (let month = 12; month >= 1; month--) {
        // Skip future months for current year
        if (year === currentYear && month > currentDate.getMonth() + 1) continue;
        
        const monthStr = month.toString().padStart(2, '0');
        const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
        options.push({
          value: `${year}-${monthStr}`,
          label: `${monthName} ${year}`
        });
      }
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchRecords()
  }, [token, currentPage, selectedMonth, searchTerm, statusFilter]) // Add dependencies

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Parse the selected month to get start and end dates
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      const query = new URLSearchParams({
        offset: ((currentPage - 1) * LIMIT).toString(),
        limit: LIMIT.toString(),
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      });

      // Add status filter if not "all"
      if (statusFilter !== 'all') {
        query.set('status', statusFilter);
      }
      
      // Add search term if provided
      if (searchTerm) {
        query.set('search', searchTerm);
      }

      const response = await fetch(`http://localhost:4000/repair-records/my/jobs?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setRecords(data.data.records || data.data)
        setTotalRecords(data.data.total || data.data.length)
      } else {
        console.error('Failed to fetch records:', data.message)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false);
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
  
  const toggleExpandRecord = (recordId: number) => {
    setExpandedRecord(expandedRecord === recordId.toString() ? null : recordId.toString());
  };

  const formatDate = (dateString: string) => {
    if (!isMounted) return '';
    
    try {
      const date = new Date(dateString);
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return formatter.format(date);
    } catch (error) {
      return '';
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / LIMIT);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-[180px]">
          <Label className="text-sm font-medium">Filter by Month</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-[180px]">
          <Label className="text-sm font-medium">Status Filter</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40">
          <Filter className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No assigned jobs found</p>
        </div>
      ) : (
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
                    <Badge variant="outline" className={getStatusStyle(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                    <Button variant="outline" onClick={() => toggleExpandRecord(record.id)}>
                      {expandedRecord === record.id.toString() ? 'Show Less' : 'Show More'}
                    </Button>
                  </div>
                </div>

                {/* Layout with media files on the left and info on the right */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left side: Media files */}
                  <div className="w-full lg:w-1/2">
                    {record.images && record.videos && (record.images.length > 0 || record.videos.length > 0) ? (
                      <SimpleMediaDisplay
                        recordId={record.id}
                        images={record.images}
                        videos={record.videos}
                        maxHeight="400px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border">
                        <p className="text-muted-foreground">No media files</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Right side: Record information */}
                  <div className="w-full lg:w-1/2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-2">Device Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Device Taken On:</p>
                            <p className="font-medium">{formatDate(record.deviceTakenOn)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Expected Repair:</p>
                            <p className="font-medium">{formatDate(record.expectedRepairDate)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-2">Repair Issue</h4>
                        <p className="text-sm text-gray-700">{record.deviceIssue || 'No issue description provided'}</p>
                      </div>
                      
                      {expandedRecord === record.id.toString() && (
                        <>
                          {record.description && (
                            <div className="p-4 rounded-lg bg-gray-50">
                              <h4 className="font-medium mb-2">Additional Description</h4>
                              <p className="text-sm text-gray-700">{record.description}</p>
                            </div>
                          )}

                          {record.devicePassword && (
                            <div className="p-4 rounded-lg bg-gray-50">
                              <h4 className="font-medium mb-2">Device Password</h4>
                              <p className="text-sm text-gray-700">{record.devicePassword}</p>
                            </div>
                          )}

                          {record.repairItems && record.repairItems.length > 0 && (
                            <div className="p-4 rounded-lg bg-gray-50">
                              <h4 className="font-medium mb-2">Repair Items</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Quantity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {record.repairItems.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.itemName}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                          {record.products && record.products.length > 0 && (
                            <div className="p-4 rounded-lg bg-gray-50">
                              <h4 className="font-medium mb-2">Products</h4>
                              <div className="flex flex-wrap gap-2">
                                {record.products.map((product) => (
                                  <Badge key={product.id} variant="secondary">
                                    {product.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {!loading && records.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {records.length} of {totalRecords} records
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <div className="flex items-center justify-center min-w-[5rem]">
              <span className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === totalPages || loading || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

