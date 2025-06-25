export interface Category {
    id: number;
    name: string;
    createdAt: string;
}

export interface PriceGuidance {
    p10: number;
    p50: number;
    p90: number;
}
export interface Job {
    id: number;
    categoryId: number;
    price: number;
    timeslot: string;
    status: string;
    acceptPrice: number | null;
    acceptedById: number | null;
    customerLat: number;
    customerLon: number;
    description?: string;
    createdAt: string;
}
export interface Bid {
    id: number;
    jobId: number;
    providerId: number;
    price: number;
    note: string;
    createdAt: string;
}