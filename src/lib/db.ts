import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configure WebSocket for Node.js environments (local development)
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

const connectionString = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL

if (!connectionString) {
  if (typeof window === 'undefined') {
    console.warn('DATABASE_URL is not set. Database queries will fail.')
  }
}

/**
 * Initialize Prisma Client with Neon Serverless adapter
 */
const createPrismaClient = () => {
  if (!connectionString) return new PrismaClient()

  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
