"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepo = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class EventRepo {
    constructor(dbClient = client_1.db) {
        this.dbClient = dbClient;
    }
    async appendEvent(deviceId, event) {
        const [inserted] = await this.dbClient
            .insert(schema_1.deviceEvents)
            .values({
            deviceId,
            eventType: event.eventType,
            payload: event.payload,
            occurredAt: event.occurredAt ?? new Date(),
        })
            .returning();
        return inserted;
    }
    async getEvents(deviceId, amount) {
        return await this.dbClient
            .select()
            .from(schema_1.deviceEvents)
            .where((0, drizzle_orm_1.eq)(schema_1.deviceEvents.deviceId, deviceId))
            .orderBy(schema_1.deviceEvents.occurredAt)
            .limit(amount);
    }
    async getEventsSince(deviceId, since) {
        return await this.dbClient
            .select()
            .from(schema_1.deviceEvents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.deviceEvents.deviceId, deviceId), (0, drizzle_orm_1.gt)(schema_1.deviceEvents.occurredAt, since)))
            .orderBy(schema_1.deviceEvents.occurredAt);
    }
    async getLatestEvent(deviceId) {
        const [latest] = await this.dbClient
            .select()
            .from(schema_1.deviceEvents)
            .where((0, drizzle_orm_1.eq)(schema_1.deviceEvents.deviceId, deviceId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.deviceEvents.occurredAt))
            .limit(1);
        return latest ?? null;
    }
    //TODO: Add access control to ensure only authorized users can delete events
    async deleteEvents(deviceId) {
        await this.dbClient.delete(schema_1.deviceEvents).where((0, drizzle_orm_1.eq)(schema_1.deviceEvents.deviceId, deviceId));
    }
}
exports.EventRepo = EventRepo;
