import { PrismaClient } from "@prisma/client";

const globalRef = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalRef.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalRef.prisma = prisma;
}
