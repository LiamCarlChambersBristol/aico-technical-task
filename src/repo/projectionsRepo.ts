import { db } from "../db/client";
import { deviceStateProjection } from "../db/schema";
import { eq } from "drizzle-orm";

export class ProjectionsRepo {
  static async upsertProjection(deviceId: string, state: any) {
    const [updated] = await db
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

  static async getProjection(deviceId: string) {
    const [projection] = await db
      .select()
      .from(deviceStateProjection)
      .where(eq(deviceStateProjection.deviceId, deviceId));

    return projection ?? null;
  }

  static async deleteProjection(deviceId: string) {
    await db
      .delete(deviceStateProjection)
      .where(eq(deviceStateProjection.deviceId, deviceId));
  }
}
