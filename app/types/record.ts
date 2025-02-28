export interface Record {
  id: string;
  userId: string;
  customerName: string;
  customerNumber: string;
  expectedRepairDate: string;
  deviceTakenOn: string;
  deviceCompany?: string;
  deviceModel?: string;
  deviceColor?: string;
  devicePassword?: string;
  deviceIssue: string;
  description?: string;
  estimatedCost?: number;
  advanceAmount?: number;
  finalCost?: number;
  assignedToId?: string;
  assignedTo?: UserBrief;
  status: RecordStatus;
  images?: string[];
  videos?: string[];
  repairItems?: RepairItem[];
}

export interface RepairItem {
  itemId: string;
  quantity: number;
  description?: string;
  price: number;
}

export interface CreateRecordDto {
  customerName: string;
  customerNumber: string;
  expectedRepairDate: string;
  deviceTakenOn: string;
  deviceCompany?: string;
  deviceModel?: string;
  deviceColor?: string;
  devicePassword?: string;
  deviceIssue: string;
  description?: string;
  estimatedCost?: number;
  advanceAmount?: number;
  repairItems?: RepairItem[];
}

export interface UpdateRecordDto {
  customerName?: string;
  customerNumber?: string;
  expectedRepairDate?: string;
  deviceTakenOn?: string;
  deviceCompany?: string;
  deviceModel?: string;
  deviceColor?: string;
  devicePassword?: string;
  deviceIssue?: string;
  description?: string;
  estimatedCost?: number;
  advanceAmount?: number;
  finalCost?: number;
  assignedToId?: string;
  status?: RecordStatus;
  repairItems?: RepairItem[];
}
