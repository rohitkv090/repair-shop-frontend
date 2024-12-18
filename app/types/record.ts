export interface Record {
  id: string;
  customerName: string;
  expectedRepairDate: string;
  deviceTakenOn: string;
  imageUrls: string[];
  videoUrl: string;
  assigned_to: string | null;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

