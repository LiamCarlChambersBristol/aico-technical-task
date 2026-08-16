import { describe, it, expect, vi } from "vitest";
import { initialiseDeviceController } from "../../src/controller/deviceController";
import { APIError } from "../../src/errors";
import { Device } from "../../src/models/device";
import { AppContext } from "../../src/context";

describe("DeviceController", () => {
  const mockDevice = new Device(
    "device-1",
    "Living Room Light",
    "light",
    new Date(),
    null
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

  it("creates a device", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.createDevice as any).mockResolvedValue("device-1");

    const controller = initialiseDeviceController(mockContext);
    const result = await controller.createDevice({
      name: "Living Room Light",
      deviceType: "light",
    });

    expect(result).toBe("device-1");
    expect(mockContext.deviceService.createDevice).toHaveBeenCalledWith({
      name: "Living Room Light",
      deviceType: "light",
    });
  });

  it("throws APIError when createDevice fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.createDevice as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseDeviceController(mockContext);

    await expect(
      controller.createDevice({ name: "Light", deviceType: "light" })
    ).rejects.toThrow(APIError);
  });

  it("gets a device by id", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.getDevice as any).mockResolvedValue(mockDevice);

    const controller = initialiseDeviceController(mockContext);
    const result = await controller.getDevice("device-1");

    expect(result).toEqual(mockDevice);
    expect(mockContext.deviceService.getDevice).toHaveBeenCalledWith("device-1");
  });

  it("throws APIError when device not found", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.getDevice as any).mockResolvedValue(null);

    const controller = initialiseDeviceController(mockContext);

    await expect(controller.getDevice("missing-id")).rejects.toThrow(APIError);
  });

  it("throws APIError when getDevice fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.getDevice as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseDeviceController(mockContext);

    await expect(controller.getDevice("device-1")).rejects.toThrow(APIError);
  });

  it("lists all devices", async () => {
    const mockDevices = [mockDevice];
    const mockContext = createMockAppContext();
    (mockContext.deviceService.listDevices as any).mockResolvedValue(mockDevices);

    const controller = initialiseDeviceController(mockContext);
    const result = await controller.listDevices();

    expect(result).toEqual(mockDevices);
    expect(mockContext.deviceService.listDevices).toHaveBeenCalled();
  });

  it("throws APIError when listDevices fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.listDevices as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseDeviceController(mockContext);

    await expect(controller.listDevices()).rejects.toThrow(APIError);
  });

  it("updates a device", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.updateDevice as any).mockResolvedValue("device-1");

    const controller = initialiseDeviceController(mockContext);
    const result = await controller.updateDevice("device-1", { name: "New Name" });

    expect(result).toBe("device-1");
    expect(mockContext.deviceService.updateDevice).toHaveBeenCalledWith("device-1", {
      name: "New Name",
    });
  });

  it("throws APIError when updateDevice fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.updateDevice as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseDeviceController(mockContext);

    await expect(
      controller.updateDevice("device-1", { name: "New Name" })
    ).rejects.toThrow(APIError);
  });

  it("deletes a device", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.deleteDevice as any).mockResolvedValue(undefined);

    const controller = initialiseDeviceController(mockContext);
    await controller.deleteDevice("device-1");

    expect(mockContext.deviceService.deleteDevice).toHaveBeenCalledWith("device-1");
  });

  it("throws APIError when deleteDevice fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.deviceService.deleteDevice as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseDeviceController(mockContext);

    await expect(controller.deleteDevice("device-1")).rejects.toThrow(APIError);
  });

  it("has correct route and type", () => {
    const mockContext = createMockAppContext();
    const controller = initialiseDeviceController(mockContext);

    expect(controller.route).toBe("/devices");
    expect(controller.type).toBe("device");
  });
});
