import { defineConfig } from "drizzle-kit";
import {config} from "dotenv";

config();

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/drizzle/schema.ts',
    out: './migrations',
    dbCredentials:{
        url: process.env.DATABASE_URL as string,
        ssl: {
            rejectUnauthorized: false
        }
    },
    verbose: true,
    strict: true,
})
