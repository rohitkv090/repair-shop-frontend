"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
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
import { toast } from "react-hot-toast";
import { useAuth } from "@/components/AuthContext";
import { workersApi, Worker, CreateWorkerDto, UpdateWorkerDto } from '@/lib/workers-api';
import { validateWorkerForm } from "@/lib/worker-validation";

interface FormErrors {
  [key: string]: string;
}

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { token, logout } = useAuth();

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await workersApi.getAllWorkers();
      if (response.success) {
        setWorkers(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch workers");
      }
    } catch (error) {
      toast.error("An error occurred while fetching workers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchWorkers();
    }
  }, [token, fetchWorkers]); // Only run when token changes

  const handleCreateWorker = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors({});
    const formData = new FormData(event.currentTarget);
    const newWorker: CreateWorkerDto = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const errors = validateWorkerForm(newWorker);
    if (errors.length > 0) {
      const errorMap: FormErrors = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFormErrors(errorMap);
      return;
    }

    setIsLoading(true);
    try {
      const response = await workersApi.createWorker(newWorker);
      if (response.success) {
        toast.success("Worker created successfully");
        setIsCreateDialogOpen(false);
        fetchWorkers();
        (event.target as HTMLFormElement).reset();
      } else {
        if (response.message.toLowerCase().includes('unauthorized')) {
          toast.error("Your session has expired. Please login again.");
          logout();
          return;
        }
        toast.error(response.message || "Failed to create worker");
      }
    } catch (error) {
      toast.error("An error occurred while creating the worker");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorker = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingWorker) return;
    setFormErrors({});
    
    const formData = new FormData(event.currentTarget);
    const updatedWorker: UpdateWorkerDto = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };
    
    const password = formData.get("password") as string;
    if (password) {
      updatedWorker.password = password;
    }

    const errors = validateWorkerForm({
      ...updatedWorker,
      password: undefined // Don't validate password on update
    });
    
    if (errors.length > 0) {
      const errorMap: FormErrors = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFormErrors(errorMap);
      return;
    }

    setIsLoading(true);
    try {
      const response = await workersApi.updateWorker(editingWorker.id, updatedWorker);
      if (response.success) {
        toast.success("Worker updated successfully");
        setIsEditDialogOpen(false);
        fetchWorkers();
      } else {
        if (response.message.toLowerCase().includes('unauthorized')) {
          toast.error("Your session has expired. Please login again.");
          logout();
          return;
        }
        toast.error(response.message || "Failed to update worker");
      }
    } catch (error) {
      toast.error("An error occurred while updating the worker");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorker = async (workerId: number) => {
    if (!confirm("Are you sure you want to delete this worker?")) return;
    
    setIsDeleting(workerId);
    // Optimistically remove the worker
    setWorkers(prev => prev.filter(w => w.id !== workerId));
    
    try {
      const response = await workersApi.deleteWorker(workerId);
      if (response.success) {
        toast.success("Worker deleted successfully");
      } else {
        // Revert on failure
        toast.error(response.message || "Failed to delete worker");
        fetchWorkers();
      }
    } catch (error) {
      toast.error("An error occurred while deleting the worker");
      fetchWorkers();
    } finally {
      setIsDeleting(null);
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workers Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Worker</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWorker} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter worker name"
                  required
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  required
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  className={formErrors.password ? "border-red-500" : ""}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormErrors({});
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Worker"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={handleSearch}
                className="max-w-sm"
              />
            </div>
            {isLoading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{worker.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingWorker(worker);
                            setIsEditDialogOpen(true);
                          }}
                          disabled={isDeleting === worker.id}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorker(worker.id)}
                          disabled={isDeleting === worker.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          {isDeleting === worker.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredWorkers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No workers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setFormErrors({});
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          {editingWorker && (
            <form onSubmit={handleUpdateWorker} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingWorker.name}
                  required
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingWorker.email}
                  required
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  className={formErrors.password ? "border-red-500" : ""}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setFormErrors({});
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Worker"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
