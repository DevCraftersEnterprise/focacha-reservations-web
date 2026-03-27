import { BranchItem } from "./branch.models";

export interface ZoneItem {
    id: string;
    name: string;
    capacity: number | null;
    branchId: string;
    branch?: BranchItem;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreateZoneRequest {
    name: string;
    branchId: string;
    capacity?: number;
}

export interface UpdateZoneRequest {
    name?: string;
    branchId?: string;
    capacity?: number | null;
    isActive?: boolean;
}