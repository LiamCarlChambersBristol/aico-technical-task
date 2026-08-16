"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
class EventService {
    constructor(eventsRepo) {
        this.eventsRepo = eventsRepo;
    }
    async addEvent(event) {
        const device = await this.eventsRepo.appendEvent(event.deviceId, {
            eventType: event.eventType,
            payload: event.payload,
            occurredAt: event.occurredAt,
        });
        return device.id;
    }
    //Note: Improve with pagination; first, last, next & previous
    async getEvents(deviceId, amount = 50) {
        const events = await this.eventsRepo.getEvents(deviceId, amount);
        if (events.length === 0) {
            console.warn(`No events found for deviceId: ${deviceId}`);
        }
        return events;
    }
    async getEventsSince(deviceId, since) {
        const events = await this.eventsRepo.getEventsSince(deviceId, since);
        if (events.length === 0) {
            console.warn(`No events found for deviceId: ${deviceId} since ${since}`);
        }
        return events;
    }
    async getLatestEvent(deviceId) {
        const event = await this.eventsRepo.getLatestEvent(deviceId);
        if (!event) {
            console.warn(`No latest event found for deviceId: ${deviceId}`);
        }
        return event;
    }
    async deleteEvents(deviceId) {
        try {
            await this.eventsRepo.deleteEvents(deviceId);
        }
        catch (error) {
            console.error(`Failed to delete events for device ${deviceId}`, error);
            throw error;
        }
    }
}
exports.EventService = EventService;
