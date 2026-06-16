import "dotenv/config";

import { defineConfig, env } from "prisma/config";

// Prisma 7 reads datasource, migration, and seed settings from this config file.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
