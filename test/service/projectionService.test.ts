import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectionService } from "../../src/service/projectionService";
import { DeviceEvent } from "../../src/models/deviceEvent";

describe("ProjectionService", () => {
  let service: ProjectionService;
  let eventsRepo: any;
  let projectionsRepo: any;

  beforeEach(() => {
    eventsRepo = {
      getEventsSince: vi.fn(),
    };
    projectionsRepo = {
      getProjection: vi.fn(),
      upsertProjection: vi.fn(),
    };

    service = new ProjectionService();
    (service as any).eventsRepo = eventsRepo;
    (service as any).projectionsRepo = projectionsRepo;
  });

  it("rebuilds a projection from existing state and new events", async () => {
    const existing = {
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 20 },
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };

    const newEvents = [
      new DeviceEvent("event-1", "device-1", "BrightnessChanged", { value: 55 }, new Date("2024-01-02T00:00:00Z")),
    ];

    projectionsRepo.getProjection.mockResolvedValue(existing);
    eventsRepo.getEventsSince.mockResolvedValue(newEvents);
    projectionsRepo.upsertProjection.mockResolvedValue({
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 55 },
      updatedAt: expect.any(Date),
    });

    const result = await service.rebuildProjection("device-1");

    expect(eventsRepo.getEventsSince).toHaveBeenCalledWith(
      "device-1",
      existing.updatedAt,
    );
    expect(projectionsRepo.upsertProjection).toHaveBeenCalledWith("device-1", {
      isOn: true,
      brightness: 55,
    });
    expect(result).toEqual({
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 55 },
      updatedAt: expect.any(Date),
    });
  });

  it("returns the existing projection when there are no new events", async () => {
    const existing = {
      deviceId: "device-1",
      stateJson: { isOn: true },
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    };

    projectionsRepo.getProjection.mockResolvedValue(existing);
    eventsRepo.getEventsSince.mockResolvedValue([]);

    const result = await service.rebuildProjection("device-1");

    expect(result).toEqual(existing);
    expect(projectionsRepo.upsertProjection).not.toHaveBeenCalled();
  });
});
