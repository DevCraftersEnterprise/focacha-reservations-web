import { BranchItem } from "./branch.models";

export type UserRole = 'ADMIN' | 'CASHIER';

export interface UserItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    branchId: string | null;
    branch?: BranchItem | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    branchId?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    branchId?: string | null;
    isActive?: boolean;
}