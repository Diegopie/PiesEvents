import { pgTable, uuid, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { events } from "./events";

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profiles.id),
  name: text("name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  location: text("location"),
  published: boolean("published").default(false).notNull(),
  public: boolean("public").default(true).notNull(),
  maxCapacity: integer("max_capacity"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
