import { BranchItem } from "./branch.models";
import { UserItem } from "./user.models";
import { ZoneItem } from "./zone.models";

export type ReservationStatus = 'ACTIVE' | 'CANCELLED';

export interface ReservationFilters {
    branchId?: string;
    reservationDate?: string;
    status?: ReservationStatus;
}

export interface ReservationItem {
    id: string;
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    branchId: string;
    zoneId: string;
    eventType: string;
    customerName: string;
    phonePrimary: string;
    phoneSecondary: string | null;
    notes: string | null;
    status: ReservationStatus;
    createdByUserId: string;
    updatedByUserId: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    cancelledByUserId: string | null;
    createdAt: string;
    updatedAt: string;
    branch?: BranchItem;
    zone?: ZoneItem;
    createdByUser?: UserItem;
    updatedByUser?: UserItem | null;
    cancelledByUser?: UserItem | null;
}

export interface CreateReservationRequest {
    reservationDate: string;
    reservationTime: string;
    guestCount: number;
    branchId: string;
    zoneId: string;
    eventType: string;
    customerName: string;
    phonePrimary: string;
    phoneSecondary?: string;
    notes?: string;
}

export interface UpdateReservationRequest {
    reservationDate?: string;
    reservationTime?: string;
    guestCount?: number;
    branchId?: string;
    zoneId?: string;
    eventType?: string;
    customerName?: string;
    phonePrimary?: string;
    phoneSecondary?: string | null;
    notes?: string | null;
}

export interface CancelReservationRequest {
    reason?: string;
}