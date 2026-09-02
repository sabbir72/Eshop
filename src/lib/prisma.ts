import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!prisma) {
    try {
      if (process.env.NODE_ENV === "production") {
        prisma = new PrismaClient();
      } else {
        if (!globalThis.prismaGlobal) {
          globalThis.prismaGlobal = new PrismaClient();
        }
        prisma = globalThis.prismaGlobal;
      }
    } catch (err) {
      console.error("[Prisma Client Initialization Error]:", err);
      prisma = null;
    }
  }

  return prisma;
}

export default getPrismaClient;
