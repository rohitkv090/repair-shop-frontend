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

type Record = {
  id: string;
  customerName: string;
  expectedRepairDate: string;
  deviceTakenOn: string;
  status: "pending" | "in-progress" | "completed";
  assigned_to?: {
    id: string;
    name: string;
  };
};

export default function AdminRecordsList() {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return; // Don't fetch records if token isn't available
    fetchRecords();
  }, [token]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:4000/repair-records", {
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

  const getRecordById = async (id: string) => {
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
      // Create a new object that excludes fields that shouldn't be updated
      const {
        customerName,
        deviceTakenOn,
        assigned_to,
        // images,
        // videos,
        ...updatedRecord
      } = selectedRecord;

      const response = await fetch(
        `http://localhost:4000/repair-records/${selectedRecord.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedRecord), // Send only editable fields (expectedRepairDate, status)
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchRecords();
        setSelectedRecord(null);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError("Failed to update record. Please try again later.");
      console.error("Error updating record:", error);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}{" "}
      {/* Display error messages */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Expected Repair Date</TableHead>
            <TableHead>Device Taken On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Media</TableHead>
          </TableRow>
        </TableHeader>

        {loading ? (
          <div className="text-center py-4">Loading...</div> // Loading indicator
        ) : (
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.customerName}</TableCell>
                <TableCell>
                  {new Date(record.expectedRepairDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(record.deviceTakenOn).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.status}</TableCell>
                <TableCell>{record.assigned_to?.name}</TableCell>{" "}
                {/* Display assigned worker's name */}
                <TableCell>
                  <MediaViewer recordId={parseInt(record.id)} />
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
                          {/* Editable Field: Expected Repair Date */}
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

                          {/* Editable Field: Status (Dropdown) */}
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

