import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Public-facing user data.
 * PK is the same UUID as auth.users.id.
 * The FK to auth.users + ON DELETE CASCADE is handled in the
 * hand-written trigger migration (Phase 3) since Drizzle can't
 * reference Supabase's auth schema.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
