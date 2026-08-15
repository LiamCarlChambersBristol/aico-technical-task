import { db } from "../db/client";
import { deviceEvents } from "../db/schema";
import { eq, desc, gt, and } from "drizzle-orm";

export class EventRepo {
  constructor(private readonly dbClient = db) {}

  async appendEvent(deviceId: string, event: {
    eventType: string;
    payload: any;
    occurredAt?: Date;
  }) {
    const [inserted] = await this.dbClient
      .insert(deviceEvents)
      .values({
        deviceId,
        eventType: event.eventType,
        payload: event.payload,
        occurredAt: event.occurredAt ?? new Date(),
      })
      .returning();

    return inserted;
  }

  async getEvents(deviceId: string, amount: number) {
    return await this.dbClient
      .select()
      .from(deviceEvents)
      .where(eq(deviceEvents.deviceId, deviceId))
      .orderBy(deviceEvents.occurredAt)
      .limit(amount);
  }

  async getEventsSince(deviceId: string, since: Date) {
    return await this.dbClient
      .select()
      .from(deviceEvents)
      .where(and(eq(deviceEvents.deviceId, deviceId), gt(deviceEvents.occurredAt, since)))
      .orderBy(deviceEvents.occurredAt);
  }

  async getLatestEvent(deviceId: string) {
    const [latest] = await this.dbClient
      .select()
      .from(deviceEvents)
      .where(eq(deviceEvents.deviceId, deviceId))
      .orderBy(desc(deviceEvents.occurredAt))
      .limit(1);

    return latest ?? null;
  }

  //TODO: Add access control to ensure only authorized users can delete events
  async deleteEvents(deviceId: string) {
    await this.dbClient.delete(deviceEvents).where(eq(deviceEvents.deviceId, deviceId));
  }
}
