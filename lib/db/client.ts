import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { getDatabaseUrl } from "@/lib/db/database-url";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
  });
  pool.on("error", (error) => {
    console.error("Unexpected error on idle Postgres client", error);
  });
  const adapter = new PrismaPg(pool, {
    disposeExternalPool: true,
  });

  const client = new PrismaClient({ adapter });
  globalForPrisma.prisma = client;

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
