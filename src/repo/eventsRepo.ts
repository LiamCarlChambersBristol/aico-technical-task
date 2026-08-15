import { db } from "../db/client";
import { deviceEvents } from "../db/schema";
import { eq, desc, gt } from "drizzle-orm";

export class EventsRepo {
  static async appendEvent(deviceId: string, event: {
    eventType: string;
    payload: any;
    occurredAt?: Date;
  }) {
    const [inserted] = await db
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

  static async getEvents(deviceId: string) {
    return await db
      .select()
      .from(deviceEvents)
      .where(eq(deviceEvents.deviceId, deviceId))
      .orderBy(deviceEvents.occurredAt);
  }

  static async getEventsSince(deviceId: string, since: Date) {
    return await db
      .select()
      .from(deviceEvents)
      .where(eq(deviceEvents.deviceId, deviceId) 
        && gt(deviceEvents.occurredAt, since))
      .orderBy(deviceEvents.occurredAt);
  }

  static async getLatestEvent(deviceId: string) {
    const [latest] = await db
      .select()
      .from(deviceEvents)
      .where(eq(deviceEvents.deviceId, deviceId))
      .orderBy(desc(deviceEvents.occurredAt))
      .limit(1);

    return latest ?? null;
  }

  //TODO: Add access control to ensure only authorized users can delete events
  static async deleteEvents(deviceId: string) {
    await db.delete(deviceEvents).where(eq(deviceEvents.deviceId, deviceId));
  }
}
