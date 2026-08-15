import { db } from "../db/client";
import { devices } from "../db/schema";
import { eq } from "drizzle-orm";

export class DevicesRepo {
  constructor(private readonly dbClient = db) {}

  async createDevice(data: {
    name: string;
    deviceType: string;
  }) {
    const [device] = await this.dbClient
      .insert(devices)
      .values({
        name: data.name,
        deviceType: data.deviceType,
      })
      .returning();

    return device;
  }

  async getDevice(deviceId: string) {
    const [device] = await this.dbClient
      .select()
      .from(devices)
      .where(eq(devices.id, deviceId));

    return device ?? null;
  }

  async listDevices() {
    return await this.dbClient.select().from(devices);
  }

  async updateDevice(deviceId: string, updates: {
    name?: string;
    deviceType?: string;
  }) {
    const [updated] = await this.dbClient
      .update(devices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(devices.id, deviceId))
      .returning();

    return updated ?? null;
  }

  async deleteDevice(deviceId: string) {
    await this.dbClient.delete(devices).where(eq(devices.id, deviceId));
  }
}
