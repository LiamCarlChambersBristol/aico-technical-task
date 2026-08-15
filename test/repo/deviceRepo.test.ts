import { describe, it, expect, vi, beforeEach } from "vitest";
import { DevicesRepo } from "../../src/repo/deviceRepo";
import { devices } from "../../src/db/schema";
import { db } from "../../src/db/client";

vi.mock("../../src/db/client", () => {
  return {
    db: {
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("DevicesRepo", () => {
  const repo = new DevicesRepo(db as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a device", async () => {
    const mockDevice = {
      id: "uuid-1",
      name: "Living Room Light",
      deviceType: "light",
      createdAt: new Date(),
      updatedAt: null,
    };

    (db.insert as any).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockDevice]),
      }),
    });

    const result = await repo.createDevice({
      name: "Living Room Light",
      deviceType: "light",
    });

    expect(db.insert).toHaveBeenCalledWith(devices);
    expect(result).toEqual(mockDevice);
  });

  it("gets a device by id", async () => {
    const mockDevice = {
      id: "uuid-1",
      name: "Living Room Light",
      deviceType: "light",
      createdAt: new Date(),
      updatedAt: null,
    };

    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockDevice]),
      }),
    });

    const result = await repo.getDevice("uuid-1");

    expect(db.select).toHaveBeenCalled();
    expect(result).toEqual(mockDevice);
  });

  it("returns null when device not found", async () => {
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await repo.getDevice("missing-id");

    expect(result).toBeNull();
  });

  it("lists devices", async () => {
    const mockDevices = [
      { id: "uuid-1", name: "A", deviceType: "light" },
      { id: "uuid-2", name: "B", deviceType: "sensor" },
    ];

    (db.select as any).mockReturnValue({
      from: vi.fn().mockResolvedValue(mockDevices),
    });

    const result = await repo.listDevices();

    expect(result).toEqual(mockDevices);
  });

  it("updates a device", async () => {
    const updated = {
      id: "uuid-1",
      name: "New Name",
      deviceType: "light",
      updatedAt: new Date(),
    };

    (db.update as any).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updated]),
        }),
      }),
    });

    const result = await repo.updateDevice("uuid-1", {
      name: "New Name",
    });

    expect(result).toEqual(updated);
  });

  it("deletes a device", async () => {
    (db.delete as any).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    await repo.deleteDevice("uuid-1");

    expect(db.delete).toHaveBeenCalledWith(devices);
  });
});
