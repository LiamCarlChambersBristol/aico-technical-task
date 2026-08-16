"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRepo = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class DeviceRepo {
    constructor(dbClient = client_1.db) {
        this.dbClient = dbClient;
    }
    //TODO: create deviceType table and "add foreign key constraint" to devices table
    async createDevice(data) {
        const [device] = await this.dbClient
            .insert(schema_1.devices)
            .values({
            name: data.name,
            deviceType: data.deviceType,
        })
            .returning();
        return device;
    }
    async getDevice(deviceId) {
        const [device] = await this.dbClient
            .select()
            .from(schema_1.devices)
            .where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId));
        return device ?? null;
    }
    async listDevices() {
        return await this.dbClient.select().from(schema_1.devices);
    }
    async updateDevice(deviceId, updates) {
        const [updated] = await this.dbClient
            .update(schema_1.devices)
            .set({
            ...updates,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId))
            .returning();
        return updated ?? null;
    }
    async deleteDevice(deviceId) {
        await this.dbClient.delete(schema_1.devices).where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId));
    }
}
exports.DeviceRepo = DeviceRepo;
