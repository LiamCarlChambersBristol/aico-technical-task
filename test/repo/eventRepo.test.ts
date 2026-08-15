import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventRepo } from "../../src/repo/eventsRepo";
import { deviceEvents } from "../../src/db/schema";
import { db } from "../../src/db/client";

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
  const repo = new EventRepo(db as any);

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

    (db.insert as any).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockEvent]),
      }),
    });

    const result = await repo.appendEvent("device-1", {
      eventType: "LightTurnedOn",
      payload: {},
    });

    expect(db.insert).toHaveBeenCalledWith(deviceEvents);
    expect(result).toEqual(mockEvent);
  });

  it("gets events for a device", async () => {
    const mockEvents = [
      { id: "event-1", deviceId: "device-1", eventType: "LightTurnedOn" },
      { id: "event-2", deviceId: "device-1", eventType: "BrightnessChanged" },
    ];

    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockEvents),
          }),
        })
      }),
    });

    const result = await repo.getEvents("device-1", 10);

    expect(result).toEqual(mockEvents);
  });

  it("gets events since a timestamp", async () => {
    const since = new Date();
    const mockEvents = [
      { id: "event-2", deviceId: "device-1", eventType: "BrightnessChanged" },
    ];

    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockEvents),
        }),
      }),
    });

    const result = await repo.getEventsSince("device-1", since);

    expect(result).toEqual(mockEvents);
  });

  it("gets latest event", async () => {
    const latest = {
      id: "event-3",
      deviceId: "device-1",
      eventType: "BrightnessChanged",
    };

    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([latest]),
          }),
        }),
      }),
    });

    const result = await repo.getLatestEvent("device-1");

    expect(result).toEqual(latest);
  });

  it("returns null when no latest event", async () => {
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const result = await repo.getLatestEvent("device-1");

    expect(result).toBeNull();
  });

  it("deletes events for a device", async () => {
    (db.delete as any).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    await repo.deleteEvents("device-1");

    expect(db.delete).toHaveBeenCalledWith(deviceEvents);
  });
});
