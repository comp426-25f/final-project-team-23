/**
 * This file exports a `db` object, which serves as the primary reference to the
 * database and the Drizzle ORM.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/db/schema";

const connectionString = process.env.DATABASE_URL;

export const client = postgres(connectionString!, { prepare: false });
export const db = drizzle(client, { schema });
