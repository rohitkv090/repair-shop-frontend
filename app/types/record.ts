export interface Record {
  id: string;
  customerName: string;
  expectedRepairDate: string;
  deviceTakenOn: string;
  images: { id: string; repairRecordId: string; url: string }[]; // Updated to reflect image objects with ids
  videos: { id: string; repairRecordId: string; url: string }[]; // Updated to reflect video objects with ids
  assigned_to: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "WORKER"; // assuming roles are 'ADMIN' or 'WORKER'
  } | null; // Assigned to can be null if no worker is assigned
  status: "pending" | "accepted" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}
