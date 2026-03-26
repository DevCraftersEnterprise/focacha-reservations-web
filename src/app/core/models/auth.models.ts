export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'CASHIER';
    branchId: string | null;
}

export interface LoginResponse {
    accessToken: string;
    user: AuthUser;
}