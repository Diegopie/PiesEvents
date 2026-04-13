import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { events } from "./events";
import { activities } from "./activities";

/** Controls who can see which event */
export const eventInvitations = pgTable(
  "event_invitations",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventId] })],
);

/** Controls who can see exclusive (non-public) activities */
export const activityInvitations = pgTable(
  "activity_invitations",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.activityId] })],
);
