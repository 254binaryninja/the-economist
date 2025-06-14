import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"


// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema:"./database/schema/index.ts",
  out:"./database/migrations",
  dialect:"postgresql",
  dbCredentials:{
    url:process.env.DATABASE_URL!,
    ssl: true
  },
  strict:true,
})