import { 
  index,
  jsonb,
  pgTable, 
  primaryKey,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// Devices table
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    deviceType: text("device_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .default(sql`CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
  }
);

// Device Events (event store)
export const deviceEvents = pgTable(
  "device_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: false })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
  },
  (table) => ({
    deviceIdx: index("idx_device_events_device_id").on(table.deviceId),
    occurredIdx: index("idx_device_events_occurred_at").on(table.occurredAt),
  })
);

// Device State Projection
export const deviceStateProjection = pgTable(
  "device_state_projection",
  {
    deviceId: uuid("device_id")
      .primaryKey()
      .references(() => devices.id, { onDelete: "cascade" }),
    stateJson: jsonb("state_json").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
  },
  (table) => ({
    stateIdx: index("idx_device_state_projection_jsonb").on(table.stateJson),
  })
);
