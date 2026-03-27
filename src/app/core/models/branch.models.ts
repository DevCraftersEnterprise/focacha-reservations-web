export interface BranchItem {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreateBranchRequest {
    name: string;
    address: string;
    phone?: string;
}

export interface UpdateBranchRequest {
    name?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
}

export interface AssignCashiersRequest {
    cashierIds: string[];
}

export interface AssignCashiersResponse {
    message: string;
    branchId: string;
    assignedCashierIds: string[];
    unassignedCashierIds: string[];
}