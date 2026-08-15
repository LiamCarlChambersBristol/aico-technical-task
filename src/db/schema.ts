import { pgTable, text, uuid, timestamp, jsonb, primaryKey, index } from "drizzle-orm/pg-core";

// Devices table
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    deviceType: text("device_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }),
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
      .defaultNow(),
  },
  (table) => ({
    deviceIdx: index("idx_device_events_device_id").on(table.deviceId),
    occurredIdx: index("idx_device_events_occurred_at").on(table.occurredAt),
  })
);

// Device State Projection (CQRS read model)
export const deviceStateProjection = pgTable(
  "device_state_projection",
  {
    deviceId: uuid("device_id")
      .primaryKey()
      .references(() => devices.id, { onDelete: "cascade" }),
    stateJson: jsonb("state_json").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    stateIdx: index("idx_device_state_projection_jsonb").on(table.stateJson),
  })
);
