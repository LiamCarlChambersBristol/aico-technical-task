import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectionsRepo } from "../../src/repo/projectionsRepo";
import { deviceStateProjection } from "../../src/db/schema";
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

describe("ProjectionsRepo", () => {
  const repo = new ProjectionsRepo(db as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts a projection", async () => {
    const mockProjection = {
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 80 },
      updatedAt: new Date(),
    };

    const onConflictDoUpdate = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([mockProjection]),
    });

    (db.insert as any).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate,
      }),
    });

    const result = await repo.upsertProjection("device-1", {
      isOn: true,
      brightness: 80,
    });

    expect(db.insert).toHaveBeenCalledWith(deviceStateProjection);
    expect(result).toEqual(mockProjection);
  });

  it("gets a projection", async () => {
    const mockProjection = {
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 80 },
      updatedAt: new Date(),
    };

    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockProjection]),
      }),
    });

    const result = await repo.getProjection("device-1");

    expect(result).toEqual(mockProjection);
  });

  it("returns null when projection not found", async () => {
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await repo.getProjection("missing-device");

    expect(result).toBeNull();
  });

  it("deletes a projection", async () => {
    (db.delete as any).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    await repo.deleteProjection("device-1");

    expect(db.delete).toHaveBeenCalledWith(deviceStateProjection);
  });
});
