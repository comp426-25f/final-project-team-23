/**
 * This file defines the entire database schema - including all tables and relations.
 *
 * To configure the Supabase database using this schema as a guide, use the command:
 * ```
 * npx drizzle-kit push
 * ```
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import {
  pgTable,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/** Example profile table. */
export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
});