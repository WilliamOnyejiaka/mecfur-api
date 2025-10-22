// Make sure to install the 'pg' package 
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {config} from "dotenv";
import * as schema from "../drizzle/schema";

config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool,{schema,logger: true,casing:"snake_case"});