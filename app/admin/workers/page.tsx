"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface Worker {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { Toast, showToast, toasts } = useToast();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workers`
      );
      const data = await response.json();
      if (data.success) {
        setWorkers(data.data);
      } else {
        showToast(data.message || "Failed to fetch workers", "error");
      }
    } catch (error) {
      showToast("An error occurred while fetching workers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorker = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const newWorker = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newWorker),
        }
      );
      const data = await response.json();
      if (data.success) {
        showToast(data.message || "Worker created successfully", "success");
        setIsCreateDialogOpen(false);
        fetchWorkers();
      } else {
        showToast(data.message || "Failed to create worker", "error");
      }
    } catch (error) {
      showToast("An error occurred while creating the worker", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorker = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!editingWorker) return;
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const updatedWorker = {
      name: formData.get("name") as string,
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workers/${editingWorker.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedWorker),
        }
      );
      const data = await response.json();
      if (data.success) {
        showToast(data.message || "Worker updated successfully", "success");
        setIsEditDialogOpen(false);
        fetchWorkers();
      } else {
        showToast(data.message || "Failed to update worker", "error");
      }
    } catch (error) {
      showToast("An error occurred while updating the worker", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        Workers Management
      </h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Worker</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add New Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Worker</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWorker} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                   
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Worker"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Worker List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Search className="mr-2 h-4 w-4" />
              <Input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{worker.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingWorker(worker);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          {editingWorker && (
            <form onSubmit={handleUpdateWorker} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingWorker.name}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Worker"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {toasts.map((toast, index) => (
        <Toast key={index} message={toast.message} type={toast.type} />
      ))}
    </main>
  );
}
