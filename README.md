# Quick-Book & Post-&-Quote Marketplace

An end-to-end full-stack application that lets customers instantly book nearby providers (Quick-Book) or post jobs with controlled bidding (Post-&-Quote). Providers compete in real-time via WebSockets, and funds are simulated via escrow endpoints. Built with:

- **Backend**: Node.js 18+, TypeScript, Fastify, PostgreSQL, Prisma ORM, Socket.IO  
- **Frontend**: Next.js 15, React 19, TypeScript, TanStack Query, Tailwind CSS  

---

## 🚀 Features

- **Quick-Book**: One-tap hire → 30 s provider race within 5 km → first to accept wins.  
- **Post & Quote**: Customer posts details + optional accept-price → three broadcast waves (Tier A → Tier B → everyone) → providers submit one bid → auto-hire if bid ≤ accept-price, else show top 3 quotes for customer to choose.  
- **Escrow Simulation**: `/escrow/hold` & `/escrow/release` endpoints.  
- **Price Guidance**: Slider shows 10th/50th/90th percentiles from seed data.  
- **Provider Availability**: Endpoint toggles to go online/offline.  
- **Real-time Notifications**: Browser toasts for job-posted, bid-received, auto-hire, cancellation.

---

## 🛠️ Getting Started

### Prerequisites

- Docker & Docker Compose  
- Node.js ≥ 18  
- Yarn or npm  

### Spin Up the Stack

```bash
docker-compose up --build -d
```

### Apply Migrations & Seed

```bash
# waits for Postgres health, then in the backend container:
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### Browse the App

Frontend (Customer/Provider UI): http://localhost:3000


### 📖 API Reference

Swagger UI: http://localhost:4000/documentation

## ✅ Tests

```bash
cd backend
npm test           # runs Jest
```
