import { buildState } from "../domain/buildState";
import { EventRepo } from "../repo/eventsRepo";
import { ProjectionRepo } from "../repo/projectionRepo";
import { DeviceStateProjection } from "../models/deviceStateProjection";
import { DeviceState } from "../models/deviceStates/deviceState";

export class ProjectionService {
  private readonly eventsRepo = new EventRepo();
  private readonly projectionsRepo = new ProjectionRepo();

  async rebuildProjection(deviceId: string): Promise<DeviceStateProjection> {
    const existing = await this.projectionsRepo.getProjection(deviceId);
    const since = existing?.updatedAt ?? new Date(0);

    const events = await this.eventsRepo.getEventsSince(deviceId, since);

    if (events.length === 0) {
      if (existing) {
        return existing;
      }
      // Create empty projection if none exists
      const newState: DeviceState = {};
      return await this.projectionsRepo.upsertProjection(deviceId, newState);
    }

    const newState = buildState(events, (existing?.stateJson ?? {}) as DeviceState);
    const updated = await this.projectionsRepo.upsertProjection(deviceId, newState);

    return updated;
  }
}
