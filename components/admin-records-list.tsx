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
  DialogTrigger,
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

type MediaFile = {
  id: number;
  url: string;
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
  description: string;
  customerNumber: string;
};

export default function AdminRecordsList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<{ id: number; name: string }[]>([]);
  const { token } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");

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



  useEffect(() => {
    if (!token) return;
    fetchRecords(null);
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

  const getRecordById = async (id: number) => {
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/repair-records/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedRecord(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Failed to fetch record. Please try again later.");
      console.error("Error fetching record:", error);
    }
  };

  const updateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setError(null);
    try {


      const response = await fetch(
        `http://localhost:4000/repair-records/${selectedRecord.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: selectedRecord.customerName,
            customerNumber: selectedRecord.customerNumber,
            expectedRepairDate: selectedRecord.expectedRepairDate,
            deviceTakenOn: selectedRecord.deviceTakenOn,
            status: selectedRecord.status,
            assignedToId: selectedRecord.assigned_to?.id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchRecords(null);
        setSelectedRecord(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Failed to update record. Please try again later.");
      console.error("Error updating record:", error);
    }
  };

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timeoutId); // Cleanup the timeout on component unmount or searchTerm change
  }, [searchTerm]);

  // Effect to call fetchRecords when debouncedSearchTerm changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchRecords(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);



  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search by customer name or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Customer Phone</TableHead>
            <TableHead>Expected Repair Date</TableHead>
            <TableHead>Device Taken On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Media</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        {loading ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.customerName}</TableCell>
                <TableCell>{record.customerNumber}</TableCell>
                <TableCell>
                  {new Date(record.expectedRepairDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(record.deviceTakenOn).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.assigned_to?.name}</TableCell>
                <TableCell>
                  <MediaViewer
                    recordId={record.id}
                    images={record.images}
                    videos={record.videos}
                  />
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => getRecordById(record.id)}>
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Record</DialogTitle>
                      </DialogHeader>
                      {selectedRecord && (
                        <form onSubmit={updateRecord} className="space-y-4">
                          <div>
                            <Label htmlFor="expectedRepairDate">
                              Expected Repair Date
                            </Label>
                            <Input
                              id="expectedRepairDate"
                              type="date"
                              value={
                                new Date(selectedRecord.expectedRepairDate)
                                  .toISOString()
                                  .split("T")[0]
                              }
                              onChange={(e) =>
                                setSelectedRecord((prev) => ({
                                  ...prev!,
                                  expectedRepairDate: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              value={selectedRecord.status}
                              onChange={(e) =>
                                setSelectedRecord((prev) => ({
                                  ...prev!,
                                  status: e.target.value as
                                    | "pending"
                                    | "in-progress"
                                    | "completed",
                                }))
                              }
                              className="w-full p-2 border rounded"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          {/* add for the  description also */}
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              value={selectedRecord.description}
                              onChange={(e) =>
                                setSelectedRecord((prev) => ({
                                  ...prev!,
                                  description: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="assigned_to">Assigned To</Label>
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
                                <SelectValue placeholder="Select a worker">
                                  {selectedRecord.assigned_to?.name || "No worker assigned"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {workers.length > 0 ? (
                                  workers.map((worker) => (
                                    <SelectItem
                                      key={worker.id}
                                      value={worker.name} // Value used for selection
                                    >
                                      {worker.name} {/* Displayed name */}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value={''} disabled>No workers available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* add for customerPhone also */}
                          <div>
                            <Label htmlFor="customerPhone">Customer Phone</Label>
                            <Input
                              id="customerPhone"
                              value={selectedRecord.customerNumber}
                              onChange={(e) =>
                                setSelectedRecord((prev) => ({
                                  ...prev!,
                                  customerNumber: e.target.value,
                                }))
                              }
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
        )}
      </Table>
    </div>
  );
}

