import { describe, it, expect, vi } from "vitest";
import { initialiseProjectionController } from "../../src/controller/projectionController";
import { APIError } from "../../src/errors";
import { DeviceStateProjection } from "../../src/models/deviceStateProjection";
import { AppContext } from "../../src/context";

describe("ProjectionController", () => {
  const mockProjection = new DeviceStateProjection(
    "device-1",
    { isOn: true, brightness: 80 },
    new Date()
  );

  const createMockAppContext = (overrides?: Partial<AppContext>): AppContext => {
    return {
      deviceService: {
        createDevice: vi.fn(),
        getDevice: vi.fn(),
        listDevices: vi.fn(),
        updateDevice: vi.fn(),
        deleteDevice: vi.fn(),
      },
      eventService: {
        addEvent: vi.fn(),
        getEvents: vi.fn(),
        getEventsSince: vi.fn(),
        getLatestEvent: vi.fn(),
        deleteEvents: vi.fn(),
      },
      projectionService: {
        rebuildProjection: vi.fn(),
      },
      ...overrides,
    } as any;
  };

  it("rebuilds a projection", async () => {
    const mockContext = createMockAppContext();
    (mockContext.projectionService.rebuildProjection as any).mockResolvedValue(mockProjection);

    const controller = initialiseProjectionController(mockContext);
    const result = await controller.rebuildProjection("device-1");

    expect(result).toEqual(mockProjection);
    expect(mockContext.projectionService.rebuildProjection).toHaveBeenCalledWith("device-1");
  });

  it("throws APIError when rebuildProjection fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.projectionService.rebuildProjection as any).mockRejectedValue(
      new Error("DB error")
    );

    const controller = initialiseProjectionController(mockContext);

    await expect(controller.rebuildProjection("device-1")).rejects.toThrow(APIError);
  });

  it("returns a valid projection with state", async () => {
    const mockContext = createMockAppContext();
    const projectionWithState = new DeviceStateProjection(
      "device-2",
      { power: "on", temp: 22 },
      new Date()
    );
    (mockContext.projectionService.rebuildProjection as any).mockResolvedValue(
      projectionWithState
    );

    const controller = initialiseProjectionController(mockContext);
    const result = await controller.rebuildProjection("device-2");

    expect(result).toEqual(projectionWithState);
    expect(result.stateJson).toEqual({ power: "on", temp: 22 });
  });

  it("has correct route and type", () => {
    const mockContext = createMockAppContext();
    const controller = initialiseProjectionController(mockContext);

    expect(controller.route).toBe("/projections");
    expect(controller.type).toBe("projection");
  });
});
