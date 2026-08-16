import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectionRepo } from "../../src/repo/projectionRepo";
import { deviceStateProjection } from "../../src/db/schema";
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

describe("ProjectionRepo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts a projection", async () => {
    const mockProjection = {
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 80 },
      updatedAt: new Date(),
    };

    const mockDb = createMockDbClient();
    const onConflictDoUpdate = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([mockProjection]),
    });

    (mockDb.insert as any).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate,
      }),
    });

    const repo = new ProjectionRepo(mockDb as any);
    const result = await repo.upsertProjection("device-1", {
      isOn: true,
      brightness: 80,
    });

    expect(mockDb.insert).toHaveBeenCalledWith(deviceStateProjection);
    expect(result).toEqual(mockProjection);
  });

  it("gets a projection", async () => {
    const mockProjection = {
      deviceId: "device-1",
      stateJson: { isOn: true, brightness: 80 },
      updatedAt: new Date(),
    };

    const mockDb = createMockDbClient();
    (mockDb.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockProjection]),
      }),
    });

    const repo = new ProjectionRepo(mockDb as any);
    const result = await repo.getProjection("device-1");

    expect(result).toEqual(mockProjection);
  });

  it("returns null when projection not found", async () => {
    const mockDb = createMockDbClient();
    (mockDb.select as any).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const repo = new ProjectionRepo(mockDb as any);
    const result = await repo.getProjection("missing-device");

    expect(result).toBeNull();
  });

  it("deletes a projection", async () => {
    const mockDb = createMockDbClient();
    (mockDb.delete as any).mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    const repo = new ProjectionRepo(mockDb as any);
    await repo.deleteProjection("device-1");

    expect(mockDb.delete).toHaveBeenCalledWith(deviceStateProjection);
  });
});
