import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { activities } from "./activities";

export const signups = pgTable("signups", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
