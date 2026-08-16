import { db } from "../db/client";
import { deviceStateProjection } from "../db/schema";
import { eq } from "drizzle-orm";

export class ProjectionRepo {
  constructor(private readonly dbClient = db) {}

  async upsertProjection(deviceId: string, state: any) {
    const [updated] = await this.dbClient
      .insert(deviceStateProjection)
      .values({
        deviceId,
        stateJson: state,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: deviceStateProjection.deviceId,
        set: {
          stateJson: state,
          updatedAt: new Date(),
        },
      })
      .returning();

    return updated;
  }

  async getProjection(deviceId: string) {
    const [projection] = await this.dbClient
      .select()
      .from(deviceStateProjection)
      .where(eq(deviceStateProjection.deviceId, deviceId));

    return projection ?? null;
  }

  async deleteProjection(deviceId: string) {
    await this.dbClient
      .delete(deviceStateProjection)
      .where(eq(deviceStateProjection.deviceId, deviceId));
  }
}
