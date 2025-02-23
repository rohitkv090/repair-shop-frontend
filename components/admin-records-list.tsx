"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "./AuthContext";
import { MediaViewer } from "@/components/MediaViewer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "./ui/badge";
import { Search, Edit, Filter } from "lucide-react";

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

  // Client-side only rendering for date-dependent content
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchRecords(null);
  }, [token]);

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
      const baseUrl = "http://localhost:4000/repair-records";
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const url = `${baseUrl}${query}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
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
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex items-center justify-center text-muted-foreground">
                    Loading records...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
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
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {selectedRecord && isMounted && (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              // Add your form submission logic here
            }}>
              <div className="space-y-4">
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
                    value={selectedRecord.assigned_to?.name || ""}
                    onValueChange={(name) => {
                      const selectedWorker = workers.find(
                        (worker) => worker.name === name
                      );
                      setSelectedRecord((prev) => ({
                        ...prev!,
                        assigned_to: selectedWorker,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.length > 0 ? (
                        workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.name}>
                            {worker.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No workers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expected Repair Date</Label>
                  <Input
                    type="datetime-local"
                    value={selectedRecord.expectedRepairDate.slice(0, 16)}
                    onChange={(e) =>
                      setSelectedRecord((prev) => ({
                        ...prev!,
                        expectedRepairDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
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
        open={!!viewingRecord && !selectedRecord} // Only show if edit dialog is not open
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
                    <p className="mt-1">{viewingRecord.customerName}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Customer Phone</Label>
                    <p className="mt-1">{viewingRecord.customerNumber}</p>
                  </div>
                </div>
              </div>

              {/* Status and Assignment */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Status & Assignment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Status</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(viewingRecord.status)}>
                        {viewingRecord.status.charAt(0).toUpperCase() + viewingRecord.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Assigned To</Label>
                    <p className="mt-1">{viewingRecord.assigned_to?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Important Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Expected Repair Date</Label>
                    <p className="mt-1">{formatDate(viewingRecord.expectedRepairDate)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Device Taken On</Label>
                    <p className="mt-1">{formatDate(viewingRecord.deviceTakenOn)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Created At</Label>
                    <p className="mt-1">{formatDate(viewingRecord.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Last Updated</Label>
                    <p className="mt-1">{formatDate(viewingRecord.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-bold">Company</Label>
                    <p className="mt-1">{viewingRecord.deviceCompany || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Model</Label>
                    <p className="mt-1">{viewingRecord.deviceModel || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Color</Label>
                    <p className="mt-1">{viewingRecord.deviceColor || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Password</Label>
                    <p className="mt-1">{viewingRecord.devicePassword || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Description and Issues */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description & Issues</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-bold">Device Issue</Label>
                    <p className="mt-1">{viewingRecord.deviceIssue || 'No issue specified'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Additional Description</Label>
                    <p className="mt-1">{viewingRecord.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* Repair Items */}
              {viewingRecord.repairItems && viewingRecord.repairItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Repair Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingRecord.repairItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.description}</TableCell>
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
    </div>
  );
}

