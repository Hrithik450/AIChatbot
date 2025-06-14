import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  out: "./lib/drizzle/migrations",
  schema: "./lib/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
