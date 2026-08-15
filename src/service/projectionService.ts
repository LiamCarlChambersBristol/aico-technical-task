import { buildState } from "../domain/buildState";
import { EventRepo } from "../repo/eventsRepo";
import { ProjectionsRepo } from "../repo/projectionsRepo";
import { DeviceState } from "../models/deviceStates/deviceState";

export class ProjectionService {
  private readonly eventsRepo = new EventRepo();
  private readonly projectionsRepo = new ProjectionsRepo();

  async rebuildProjection(deviceId: string) {
    const existing = await this.projectionsRepo.getProjection(deviceId);
    const since = existing?.updatedAt ?? new Date(0);

    const events = await this.eventsRepo.getEventsSince(deviceId, since);

    if (events.length === 0) {
      return existing;
    }

    const newState = buildState(events, (existing?.stateJson ?? {}) as DeviceState);
    const updated = await this.projectionsRepo.upsertProjection(deviceId, newState);

    return updated;
  }
}
