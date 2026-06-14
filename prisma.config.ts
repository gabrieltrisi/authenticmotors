// Configuração do Prisma CLI.
// A DATABASE_URL real fica em `.env.local` (NÃO versionado). O Prisma CLI não
// carrega `.env.local` automaticamente, então o fazemos explicitamente aqui;
// `.env` entra apenas como fallback.
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
