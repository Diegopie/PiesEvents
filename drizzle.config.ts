import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./app/db/schema",
  out: "./supabase/migrations",
  verbose: true,
  strict: true,
  migrations: {
    prefix: "timestamp",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
