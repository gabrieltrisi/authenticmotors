/**
 * Cliente Prisma compartilhado (singleton).
 *
 * Em desenvolvimento, o hot-reload do Next recria os módulos a cada mudança,
 * o que abriria uma nova conexão a cada vez. Guardamos a instância em
 * `globalThis` para reaproveitá-la. Em produção, uma única instância por
 * processo.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
