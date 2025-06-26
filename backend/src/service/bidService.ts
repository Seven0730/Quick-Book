// src/service/bidService.ts
import { bidRepository } from '../repository/bidRepository'
import { jobService } from './jobService'
import type { Bid, Job } from '@prisma/client'
import { haversine } from '../utils/haversine'

const AVERAGE_SPEED_KMH = 60

/** Simple linear normalisation */
function normalize(value: number, min: number, max: number): number {
    return max === min ? 0 : (value - min) / (max - min)
}

/** Thrown when the same provider tries to bid twice on the same job */
export class AlreadyBidError extends Error {
    constructor() {
        super('Already bid')
        this.name = 'AlreadyBidError'
    }
}

export const bidService = {
    /** List all bids for a given job (includes provider & job relations!) */
    list: (jobId: number): Promise<Array<Bid & { provider: { rating: number; lat: number; lon: number }; job: { customerLat: number; customerLon: number } }>> =>
        bidRepository.listByJob(jobId),

    /** List all bids made by a given provider (includes job relation!) */
    listByProvider: (providerId: number) =>
        bidRepository.findByProvider(providerId),

    /** Find a single bid (with relations) */
    findById: (bidId: number) =>
        bidRepository.findById(bidId),

    /**
     * Create a new bid. If the job has an `acceptPrice` and
     * price ≤ acceptPrice, auto-accept the job immediately.
     */
    create: async (jobId: number, providerId: number, price: number, note?: string): Promise<Bid> => {
        const existing = await bidRepository.findByJobAndProvider(jobId, providerId)
        if (existing) throw new AlreadyBidError()

        const bid = await bidRepository.create({ jobId, providerId, price, note })

        const job = await jobService.get(jobId)
        if (!job) throw new Error('Job not found')

        // auto-hire if within acceptPrice
        if (job.acceptPrice !== null && price <= job.acceptPrice) {
            await jobService.accept(jobId, providerId)
        }

        return bid
    },

    /**
     * Compute the top-3 bids by the formula:
     * score = 0.5*normPrice + 0.3*(5-rating)/4 + 0.2*normETA
     */
    topBids: async (jobId: number): Promise<Array<Bid & { score: number }>> => {
        const bids = await bidRepository.listByJob(jobId)
        if (bids.length === 0) return []

        // compute ETAs
        const etas = bids.map((b) => {
            const { customerLat, customerLon } = b.job
            const distKm = haversine(customerLat, customerLon, b.provider.lat, b.provider.lon)
            return (distKm / AVERAGE_SPEED_KMH) * 60  // minutes
        })

        // price bounds
        const prices = bids.map((b) => b.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        // ETA bounds
        const minEta = Math.min(...etas)
        const maxEta = Math.max(...etas)

        // score & sort
        const scored = bids.map((b, i) => {
            const pNorm = normalize(b.price, minPrice, maxPrice)
            const rNorm = (5 - b.provider.rating) / 4
            const eNorm = normalize(etas[i], minEta, maxEta)
            const score = 0.5 * pNorm + 0.3 * rNorm + 0.2 * eNorm
            return { ...b, score }
        }).sort((a, b) => a.score - b.score)

        return scored.slice(0, 3)
    },

    /**
     * Customer selects a specific bid — we simply call
     * jobService.accept(...) under the hood.
     */
    selectBid: async (jobId: number, bidId: number): Promise<Job> => {
        const bid = await bidRepository.findById(bidId)
        if (!bid || bid.jobId !== jobId) {
            throw new Error('Bid not found for this job')
        }
        // accept the job on behalf of that provider
        return jobService.accept(jobId, bid.providerId)
    },
}
