export interface ReservationCalendarItem {
    date: string;
    count: number;
}

export interface ReservationDayDetailItem {
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
    status: 'ACTIVE' | 'CANCELLED';
    branch?: {
        id: string;
        name: string;
    };
    zone?: {
        id: string;
        name: string;
    };
}

export interface ReservationDayDetailResponse {
    date: string;
    branchId: string;
    total: number;
    activeCount: number;
    cancelledCount: number;
    items: ReservationDayDetailItem[];
}