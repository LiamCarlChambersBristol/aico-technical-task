import { db } from "../db/client";
import { devices } from "../db/schema";
import { eq } from "drizzle-orm";

export class DevicesRepo {
  static async createDevice(data: {
    name: string;
    deviceType: string;
  }) {
    const [device] = await db
      .insert(devices)
      .values({
        name: data.name,
        deviceType: data.deviceType,
      })
      .returning();

    return device;
  }

  static async getDevice(deviceId: string) {
    const [device] = await db
      .select()
      .from(devices)
      .where(eq(devices.id, deviceId));

    return device ?? null;
  }

  static async listDevices() {
    return await db.select().from(devices);
  }

  static async updateDevice(deviceId: string, updates: {
    name?: string;
    deviceType?: string;
  }) {
    const [updated] = await db
      .update(devices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(devices.id, deviceId))
      .returning();

    return updated ?? null;
  }

  static async deleteDevice(deviceId: string) {
    await db.delete(devices).where(eq(devices.id, deviceId));
  }
}
