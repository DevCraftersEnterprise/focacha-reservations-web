import { BranchItem } from "./branch.models";
import { UserRole } from "./user.models";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    branchId: string | null;
    branch?: BranchItem;
}

export interface LoginResponse {
    accessToken: string;
    user: AuthUser;
}