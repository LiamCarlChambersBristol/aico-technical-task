"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionRepo = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ProjectionRepo {
    constructor(dbClient = client_1.db) {
        this.dbClient = dbClient;
    }
    async upsertProjection(deviceId, state) {
        const [updated] = await this.dbClient
            .insert(schema_1.deviceStateProjection)
            .values({
            deviceId,
            stateJson: state,
            updatedAt: new Date(),
        })
            .onConflictDoUpdate({
            target: schema_1.deviceStateProjection.deviceId,
            set: {
                stateJson: state,
                updatedAt: new Date(),
            },
        })
            .returning();
        return updated;
    }
    async getProjection(deviceId) {
        const [projection] = await this.dbClient
            .select()
            .from(schema_1.deviceStateProjection)
            .where((0, drizzle_orm_1.eq)(schema_1.deviceStateProjection.deviceId, deviceId));
        return projection ?? null;
    }
    async deleteProjection(deviceId) {
        await this.dbClient
            .delete(schema_1.deviceStateProjection)
            .where((0, drizzle_orm_1.eq)(schema_1.deviceStateProjection.deviceId, deviceId));
    }
}
exports.ProjectionRepo = ProjectionRepo;
