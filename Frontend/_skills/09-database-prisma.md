# Skill: Database & Prisma

## Setup
- ORM: Prisma 7 (adapter-based — NOT the old standalone PrismaClient pattern)
- Database: Prisma Postgres (pooled, hosted at `pooled.db.prisma.io`)
- Client path: `lib/generated/prisma/client` (import from here)
- Config: `prisma.config.ts` — datasource URL lives here, NOT in schema
- Required packages: `@prisma/adapter-pg`, `pg`, `@types/pg`
- Always run `prisma generate` before `next build`

## Prisma Client Singleton (`lib/prisma.ts`)

```ts
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Schema Location
`prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Rules
- Always import from `@/app/generated/prisma` — not from `@prisma/client`
- Never write raw SQL — Prisma handles parameterization (no SQL injection risk)
- Never use `prisma.$queryRaw` unless absolutely unavoidable — and never with user input
- Use `findFirst` (not `findUnique`) when filtering by both `id` AND another field (e.g., `employerId`)
- Use `select` to limit which fields are returned — never return full rows to the client when only a few fields are needed

## Common Patterns

```ts
// List with filtering
const candidates = await prisma.candidate.findMany({
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' },
  select: { id: true, name: true, phone: true, status: true },
})

// Single record — safe fetch (returns null if not found, not an error)
const candidate = await prisma.candidate.findFirst({
  where: { id, employerId: session.user.employerId },
})
if (!candidate) throw new Error('Candidate not found.')

// Create
const job = await prisma.job.create({ data: { ...validated } })

// Update
await prisma.job.update({
  where: { id: jobId },
  data: { status: 'CLOSED' },
})

// Soft delete (preferred over hard delete for audit trail)
await prisma.candidate.update({
  where: { id },
  data: { deletedAt: new Date() },
})
```

## After Any Schema Change
```bash
npx prisma migrate dev --name describe_change
npx prisma generate
```

## Never Do
```ts
// WRONG — wrong import path
import { PrismaClient } from '@prisma/client'

// WRONG — raw SQL with user input
await prisma.$queryRaw`SELECT * FROM candidates WHERE name = ${userInput}`

// WRONG — returning more than needed
const candidates = await prisma.candidate.findMany()  // returns all fields including sensitive ones
```
