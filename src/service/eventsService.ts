import { EventRepo } from "../repo/eventsRepo";
import { DeviceEvent } from "../models/deviceEvent";

export class EventService {
    constructor(private eventsRepo: EventRepo) {}

    async addEvent(event: DeviceEvent): Promise<String> {
        const device = await this.eventsRepo.appendEvent(event.deviceId, {
            eventType: event.eventType,
            payload: event.payload,
            occurredAt: event.occurredAt,
        });
        return device.id;
    }
    
    //Note: Improve with pagination; first, last, next & previous
    async getEvents(deviceId: string, amount: number = 50): Promise<DeviceEvent[]> {
        const events = await this.eventsRepo.getEvents(deviceId, amount);
        if (events.length === 0) {
            console.warn(`No events found for deviceId: ${deviceId}`);
        }
        return events;
    }

    async getEventsSince(deviceId: string, since: Date): Promise<DeviceEvent[]> {
        const events = await this.eventsRepo.getEventsSince(deviceId, since);
        if (events.length === 0) {
            console.warn(`No events found for deviceId: ${deviceId} since ${since}`);
        }
        return events;
    }

    async getLatestEvent(deviceId: string): Promise<DeviceEvent | null> {
        const event = await this.eventsRepo.getLatestEvent(deviceId);
        if (!event) {
            console.warn(`No latest event found for deviceId: ${deviceId}`);
        }
        return event;
    }

    async deleteEvents(deviceId: string): Promise<void> {
        try {
            await this.eventsRepo.deleteEvents(deviceId);
        } catch (error) {
            console.error(`Failed to delete events for device ${deviceId}`, error);
            throw error;
        }
    }
}