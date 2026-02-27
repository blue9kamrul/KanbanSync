import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Setup the pg connection pool
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// Wrap it in the Prisma 7 adapter
const adapter = new PrismaPg(pool);

// Instantiate the client with the adapter
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;