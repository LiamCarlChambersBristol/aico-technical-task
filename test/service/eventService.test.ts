import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventService } from "../../src/service/eventsService";
import { DeviceEvent } from "../../src/models/deviceEvent";

describe("EventService", () => {
  let repo: any;
  let service: EventService;

  beforeEach(() => {
    vi.restoreAllMocks();
    repo = {
      appendEvent: vi.fn(),
      getEvents: vi.fn(),
      getEventsSince: vi.fn(),
      getLatestEvent: vi.fn(),
      deleteEvents: vi.fn(),
    };
    service = new EventService(repo);
  });

  it("adds an event and returns the inserted id", async () => {
    const event = new DeviceEvent(
      "event-1",
      "device-1",
      "LightTurnedOn",
      {},
      new Date("2024-01-01T00:00:00Z"),
    );

    repo.appendEvent.mockResolvedValue({ id: "event-1" });

    const result = await service.addEvent(event);

    expect(repo.appendEvent).toHaveBeenCalledWith("device-1", {
      eventType: "LightTurnedOn",
      payload: {},
      occurredAt: event.occurredAt,
    });
    expect(result).toBe("event-1");
  });

  it("returns events and warns when none are found", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    repo.getEvents.mockResolvedValue([]);

    const result = await service.getEvents("device-1", 10);

    expect(result).toEqual([]);
    expect(repo.getEvents).toHaveBeenCalledWith("device-1", 10);
    expect(warn).toHaveBeenCalledWith("No events found for deviceId: device-1");
  });

  it("returns events since a timestamp", async () => {
    const events = [
      new DeviceEvent("event-1", "device-1", "LightTurnedOn", {}, new Date()),
    ];
    repo.getEventsSince.mockResolvedValue(events);

    const result = await service.getEventsSince("device-1", new Date("2024-01-01Z"));

    expect(repo.getEventsSince).toHaveBeenCalledWith(
      "device-1",
      new Date("2024-01-01Z"),
    );
    expect(result).toEqual(events);
  });

  it("returns the latest event and warns if missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    repo.getLatestEvent.mockResolvedValue(null);

    const result = await service.getLatestEvent("device-1");

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalledWith("No latest event found for deviceId: device-1");
  });

  it("rethrows delete errors after logging", async () => {
    const error = new Error("db failed");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    repo.deleteEvents.mockRejectedValue(error);

    await expect(service.deleteEvents("device-1")).rejects.toThrow("db failed");
    expect(log).toHaveBeenCalledWith("Failed to delete events for device device-1", error);
  });
});
