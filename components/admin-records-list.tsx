'use client'

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./AuthContext"
import { MediaViewer } from "@/components/MediaViewer"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Badge } from "./ui/badge"
import { Search, Edit, Filter, Download, Plus } from "lucide-react"
import toast from 'react-hot-toast'
import AddEditItemDialog from './items/add-edit-item-dialog'
import { Item } from '@/app/types/item'

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

export type Record = {
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
  advanceAmount: number;
  products: { id: number; name: string }[];
};

export default function AdminRecordsList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<{ id: number; name: string }[]>([]);
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availableItems, setAvailableItems] = useState<{ id: number; name: string; description: string }[]>([]);
  const [repairItems, setRepairItems] = useState<RepairItem[]>([]);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const LIMIT = 10; // Fixed limit of 10 records per page
  const [downloadingRecordId, setDownloadingRecordId] = useState<number | null>(null);
  
  // Month filtering state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Client-side only rendering for date-dependent content
  const [isMounted, setIsMounted] = useState(false);
  
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
    if (!token) return;
    fetchRecords(searchTerm);
  }, [token, currentPage, searchTerm, selectedMonth]); // Add selectedMonth as dependency

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch("http://localhost:4000/workers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setWorkers(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error("Failed to fetch workers:", err);
        setWorkers([]);
      }
    };

    if (token) {
      fetchWorkers();
    }
  }, [token]);

  const fetchRecords = async (searchTerm: string | null) => {
    setLoading(true);
    setError(null);
    try {
      // Parse the selected month to get start and end dates
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      const baseUrl = "http://localhost:4000/repair-records";
      const query = new URLSearchParams();
      if (searchTerm) query.set('search', searchTerm);
      
      // Calculate offset based on current page
      const offset = (currentPage - 1) * LIMIT;
      query.set('limit', LIMIT.toString());
      query.set('offset', offset.toString());
      
      // Add date range parameters
      query.set('startDate', startDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
      query.set('endDate', endDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
      
      const url = `${baseUrl}?${query.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records);
        setTotalRecords(data.data.total);
        // Note: data.data.page and data.data.limit are also available if needed
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error);
      setError("Failed to fetch records. Please try again later.");
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordDetails = async (recordId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/repair-records/${recordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setViewingRecord(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching record details:", error);
      setError("Failed to fetch record details. Please try again later.");
    }
  };

  const getStatusColor = (status: string) => {
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
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Consistent date formatting function
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

  const handleRowClick = (record: Record, isEditButton: boolean) => {
    if (isEditButton) {
      setViewingRecord(null); // Close view dialog if open
      setSelectedRecord(record);
    } else {
      if (!selectedRecord) { // Only show view if not editing
        fetchRecordDetails(record.id);
        setViewingRecord(record);
      }
    }
  };

  const handleDownloadReceipt = async (recordId: number) => {
    setDownloadingRecordId(recordId);
    try {
      const response = await fetch(`http://localhost:4000/repair-records/${recordId}/receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${recordId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setDownloadingRecordId(null);
    }
  };

  useEffect(() => {
    if (selectedRecord && token) {
      // Fetch available items when the edit dialog opens
      const fetchItems = async () => {
        try {
          const response = await fetch('http://localhost:4000/items', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setAvailableItems(data.data);
          } else {
            console.error('Failed to fetch items:', data.message);
          }
        } catch (error) {
          console.error('Error fetching items:', error);
        }
      };

      fetchItems();
      
      // Initialize repair items from the selected record
      if (selectedRecord.repairItems && selectedRecord.repairItems.length > 0) {
        setRepairItems(selectedRecord.repairItems.map(item => ({
          id: item.id,
          repairRecordId: item.repairRecordId,
          itemId: item.itemId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
          description: item.description || '',
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })));
      } else {
        setRepairItems([]);
      }
    }
  }, [selectedRecord, token]);

  const addRepairItem = () => {
    setRepairItems(prev => [...prev, { 
      id: 0, // For new items, use 0 as a temporary id
      repairRecordId: selectedRecord?.id || 0,
      itemId: 0,
      quantity: 1,
      priceAtTime: 0,
      description: '',
      itemName: '',
      itemDescription: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]);
  };

  const updateRepairItem = (index: number, field: keyof RepairItem, value: any) => {
    setRepairItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
    
    // Also update item name and description if itemId is changed
    if (field === 'itemId') {
      const selectedItem = availableItems.find(item => item.id === value);
      if (selectedItem) {
        setRepairItems(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            itemId: value,
            itemName: selectedItem.name,
            itemDescription: selectedItem.description
          } : item
        ));
      }
    }
  };

  const removeRepairItem = (index: number) => {
    setRepairItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewItem = (newItem: Item) => {
    // Add the newly created item to the available items list
    setAvailableItems(prev => [...prev, newItem as any]);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / LIMIT);

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
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
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Customer Phone</TableHead>
              <TableHead>Expected Repair</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Media</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isMounted ? null : loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex items-center justify-center text-muted-foreground">
                    Loading records...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Filter className="h-8 w-8 mb-2" />
                    <span>No records found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    // Only handle row click if it's not from the edit button
                    if (!(e.target as HTMLElement).closest('button')) {
                      handleRowClick(record, false);
                    }
                  }}
                >
                  <TableCell>{record.id}</TableCell>
                  <TableCell>{record.customerName}</TableCell>
                  <TableCell>{record.customerNumber}</TableCell>
                  <TableCell suppressHydrationWarning>
                    {formatDate(record.expectedRepairDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.assigned_to?.name || 
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    }
                  </TableCell>
                  <TableCell>
                    {isMounted && (
                      <MediaViewer
                        recordId={record.id}
                        images={record.images}
                        videos={record.videos}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleRowClick(record, true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReceipt(record.id);
                      }}
                      disabled={downloadingRecordId === record.id}
                    >
                      {downloadingRecordId === record.id ? 'Downloading...' : <Download className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
            disabled={currentPage === 1 || loading}
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
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog 
        open={!!selectedRecord} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecord(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {selectedRecord && isMounted && (
            <form className="space-y-6 overflow-y-auto pr-2" onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Format repair items for API submission
                const formattedRepairItems = repairItems
                  .filter(item => item.itemId > 0) // Only send items with valid itemId
                  .map(item => ({
                    id: item.id > 0 ? item.id : undefined, // Don't send id for new items
                    itemId: item.itemId,
                    quantity: item.quantity,
                    description: item.description,
                    price: item.priceAtTime
                  }));

                const response = await fetch(`http://localhost:4000/repair-records/${selectedRecord.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: selectedRecord.status,
                    assignedToId: selectedRecord.assigned_to?.id,
                    expectedRepairDate: selectedRecord.expectedRepairDate,
                    finalCost: selectedRecord.finalCost,
                    repairItems: formattedRepairItems
                  }),
                });

                const data = await response.json();
                if (data.success) {
                  setRecords(prev => prev.map(record => 
                    record.id === selectedRecord.id 
                      ? { ...record, ...data.data }
                      : record
                  ));
                  setSelectedRecord(null);
                  toast.success('Record updated successfully');
                } else {
                  toast.error(data.message || 'Failed to update record');
                }
              } catch (error) {
                console.error('Error updating record:', error);
                toast.error('Failed to update record');
              }
            }}>
              <div className="space-y-6">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={selectedRecord.status}
                    onValueChange={(value: "pending" | "in-progress" | "completed") =>
                      setSelectedRecord(prev => ({ ...prev!, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>

                      </SelectContent>
                    
                  </Select>
                </div>

                <div>
                  <Label>Assigned To</Label>
                  <Select
                    value={selectedRecord.assigned_to?.id?.toString() || ""}
                    onValueChange={(value) => {
                      const selectedWorker = workers.find(w => w.id.toString() === value);
                      setSelectedRecord(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          assigned_to: selectedWorker || undefined
                        };
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map(worker => (
                        <SelectItem key={worker.id} value={worker.id.toString()}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expected Repair Date</Label>
                  <Input
                    type="datetime-local"
                    value={selectedRecord.expectedRepairDate.slice(0, 16)}
                    onChange={(e) =>
                      setSelectedRecord(prev => ({
                        ...prev!,
                        expectedRepairDate: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* <div>
                  <Label>Final Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedRecord.finalCost || ''}
                    onChange={(e) =>
                      setSelectedRecord(prev => ({
                        ...prev!,
                        finalCost: Number(e.target.value)
                      }))
                    }
                    placeholder="Enter final cost"
                  />
                </div> */}

                {/* Repair Items Section */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Repair Items</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAddItemDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Create New Item
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addRepairItem}
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {repairItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No repair items added yet.</p>
                    ) : (
                      repairItems.map((item, index) => (
                        <div key={index} className="flex gap-4 items-end border-b pb-4">
                          <div className="flex-1">
                            <Label>Item</Label>
                            <Select 
                              value={item.itemId.toString()}
                              onValueChange={(value) => updateRepairItem(index, 'itemId', Number(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableItems.map((availItem) => (
                                  <SelectItem key={availItem.id} value={availItem.id.toString()}>
                                    {availItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {item.itemId > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {availableItems.find(i => i.id === item.itemId)?.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="w-28">
                            <Label>Price (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.priceAtTime}
                              onChange={(e) => updateRepairItem(index, 'priceAtTime', Number(e.target.value))}
                              required
                            />
                          </div>
                          
                          <div className="w-20">
                            <Label>Qty</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateRepairItem(index, 'quantity', Number(e.target.value))}
                              required
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label>Notes</Label>
                            <Input
                              value={item.description || ''}
                              onChange={(e) => updateRepairItem(index, 'description', e.target.value)}
                              placeholder="Optional notes"
                            />
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeRepairItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRecord(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Record</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Record Details Dialog */}
      <Dialog 
        open={!!viewingRecord && !selectedRecord} 
        onOpenChange={(open) => {
          if (!open) {
            setViewingRecord(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-6 overflow-y-auto pr-2">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Customer Name</Label>
                    <p className="mt-1">{viewingRecord?.customerName}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Customer Phone</Label>
                    <p className="mt-1">{viewingRecord?.customerNumber}</p>
                  </div>
                </div>
              </div>

                            {/* Products */}
                            {viewingRecord?.products && viewingRecord.products.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingRecord.products.map((product) => (
                      <Badge key={product.id} variant="secondary">
                        {product.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Status, Assignment and Cost */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Status & Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-bold">Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(viewingRecord?.status || '')}>
                        {viewingRecord?.status.charAt(0).toUpperCase() + viewingRecord?.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Assigned To</Label>
                    <p className="mt-1">{viewingRecord?.assigned_to?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Advance Amount</Label>
                    <p className="mt-1">₹{viewingRecord?.advanceAmount || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Important Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Expected Repair Date</Label>
                    <p className="mt-1">{formatDate(viewingRecord?.expectedRepairDate || '')}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Device Taken On</Label>
                    <p className="mt-1">{formatDate(viewingRecord?.deviceTakenOn || '')}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Created At</Label>
                    <p className="mt-1">{formatDate(viewingRecord?.createdAt || '')}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Last Updated</Label>
                    <p className="mt-1">{formatDate(viewingRecord?.updatedAt || '')}</p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Company</Label>
                    <p className="mt-1">{viewingRecord?.deviceCompany || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Model</Label>
                    <p className="mt-1">{viewingRecord?.deviceModel || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Color</Label>
                    <p className="mt-1">{viewingRecord?.deviceColor || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Password</Label>
                    <p className="mt-1">{viewingRecord?.devicePassword || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Description and Issues */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description & Issues</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">Device Issue</Label>
                    <p className="mt-1">{viewingRecord?.deviceIssue || 'No issue specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Additional Description</Label>
                    <p className="mt-1">{viewingRecord?.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* Repair Items */}
              {viewingRecord?.repairItems && viewingRecord.repairItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Repair Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingRecord.repairItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>₹{item.priceAtTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}


              {/* Media */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Media</h3>
                <div className="mt-2">
                  <MediaViewer
                    recordId={viewingRecord.id}
                    images={viewingRecord.images}
                    videos={viewingRecord.videos}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setViewingRecord(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Item Dialog */}
      <AddEditItemDialog
        open={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
        onSuccess={handleAddNewItem}
        item={null}
      />
    </div>
  );
}

