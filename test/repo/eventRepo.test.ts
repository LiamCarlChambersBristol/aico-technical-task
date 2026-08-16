import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventRepo } from "../../src/repo/eventsRepo";
import { deviceEvents } from "../../src/db/schema";
import { createMockDbClient } from "../helpers/mockDb";

vi.mock("../../src/db/client", () => {
  return {
    db: {
      insert: vi.fn(),
      select: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("EventRepo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appends an event", async () => {
    const mockEvent = {
      id: "event-1",
      deviceId: "device-1",
      eventType: "LightTurnedOn",
      payload: {},
      occurredAt: new Date(),
    };

    const mockDb = createMockDbClient();
    (mockDb.insert as any).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockEvent]),
      }),
    });

    const repo = new EventRepo(mockDb as any);
    const result = await repo.appendEvent("device-1", {
      eventType: "LightTurnedOn",
      payload: {},
    });

    expect(mockDb.insert).toHaveBeenCalledWith(deviceEvents);
    expect(result).toEqual(mockEvent);
  });

  it("gets events for a device", async () => {
    const mockEvents = [
      { id: "event-1", deviceId: "device-1", eventType: "LightTurnedOn" },
      { id: "event-2", deviceId: "device-1", eventType: "BrightnessChanged" },
    ];

    const mockDb = createMockDbClient();
    (mockDb.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockEvents),
          }),
        })
      }),
    });

    const repo = new EventRepo(mockDb as any);
    const result = await repo.getEvents("device-1", 10);

    expect(result).toEqual(mockEvents);
  });

  it("gets events since a timestamp", async () => {
    const since = new Date();
    const mockEvents = [
      { id: "event-2", deviceId: "device-1", eventType: "BrightnessChanged" },
    ];

    const mockDb = createMockDbClient();
    (mockDb.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockEvents),
        }),
      }),
    });

    const repo = new EventRepo(mockDb as any);
    const result = await repo.getEventsSince("device-1", since);

    expect(result).toEqual(mockEvents);
  });

  it("gets latest event", async () => {
    const latest = {
      id: "event-3",
      deviceId: "device-1",
      eventType: "BrightnessChanged",
    };

    const mockDb = createMockDbClient();
    (mockDb.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([latest]),
          }),
        }),
      }),
    });

    const repo = new EventRepo(mockDb as any);
    const result = await repo.getLatestEvent("device-1");

    expect(result).toEqual(latest);
  });

  it("returns null when no latest event", async () => {
    const mockDb = createMockDbClient();
    (mockDb.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const repo = new EventRepo(mockDb as any);
    const result = await repo.getLatestEvent("device-1");

    expect(result).toBeNull();
  });

  it("deletes events for a device", async () => {
    const mockDb = createMockDbClient();
    (mockDb.delete as any).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    const repo = new EventRepo(mockDb as any);
    await repo.deleteEvents("device-1");

    expect(mockDb.delete).toHaveBeenCalledWith(deviceEvents);
  });
});
