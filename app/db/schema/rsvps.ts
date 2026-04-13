import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  text,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { activities } from "./activities";

export const rsvpStatusEnum = pgEnum("rsvp_status", [
  "going",
  "not_going",
  "maybe",
]);

export const rsvps = pgTable(
  "rsvps",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    status: rsvpStatusEnum("status").notNull(),
    plusCount: integer("plus_count").default(0).notNull(),
    note: text("note"),
    respondedAt: timestamp("responded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.activityId] })],
);
