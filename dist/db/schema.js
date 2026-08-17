"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceStateProjection = exports.deviceEvents = exports.devices = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Devices table
exports.devices = (0, pg_core_1.pgTable)("devices", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull(),
    deviceType: (0, pg_core_1.text)("device_type").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: false })
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
});
// Device Events (event store)
exports.deviceEvents = (0, pg_core_1.pgTable)("device_events", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    deviceId: (0, pg_core_1.uuid)("device_id")
        .notNull()
        .references(() => exports.devices.id, { onDelete: "cascade" }),
    eventType: (0, pg_core_1.text)("event_type").notNull(),
    payload: (0, pg_core_1.jsonb)("payload").notNull(),
    occurredAt: (0, pg_core_1.timestamp)("occurred_at", { withTimezone: false })
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
}, (table) => ({
    deviceIdx: (0, pg_core_1.index)("idx_device_events_device_id").on(table.deviceId),
    occurredIdx: (0, pg_core_1.index)("idx_device_events_occurred_at").on(table.occurredAt),
}));
// Device State Projection
exports.deviceStateProjection = (0, pg_core_1.pgTable)("device_state_projection", {
    deviceId: (0, pg_core_1.uuid)("device_id")
        .primaryKey()
        .references(() => exports.devices.id, { onDelete: "cascade" }),
    stateJson: (0, pg_core_1.jsonb)("state_json").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: false })
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP AT TIME ZONE 'UTC'`),
}, (table) => ({
    stateIdx: (0, pg_core_1.index)("idx_device_state_projection_jsonb").on(table.stateJson),
}));
