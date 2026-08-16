"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionService = void 0;
const buildState_1 = require("../domain/buildState");
const eventsRepo_1 = require("../repo/eventsRepo");
const projectionRepo_1 = require("../repo/projectionRepo");
class ProjectionService {
    constructor() {
        this.eventsRepo = new eventsRepo_1.EventRepo();
        this.projectionsRepo = new projectionRepo_1.ProjectionRepo();
    }
    async rebuildProjection(deviceId) {
        const existing = await this.projectionsRepo.getProjection(deviceId);
        const since = existing?.updatedAt ?? new Date(0);
        const events = await this.eventsRepo.getEventsSince(deviceId, since);
        if (events.length === 0) {
            if (existing) {
                return existing;
            }
            // Create empty projection if none exists
            const newState = {};
            return await this.projectionsRepo.upsertProjection(deviceId, newState);
        }
        const newState = (0, buildState_1.buildState)(events, (existing?.stateJson ?? {}));
        const updated = await this.projectionsRepo.upsertProjection(deviceId, newState);
        return updated;
    }
}
exports.ProjectionService = ProjectionService;
