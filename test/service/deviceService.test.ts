import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeviceService } from "../../src/service/deviceService";

describe("DeviceService", () => {
  let repo: any;
  let service: DeviceService;

  beforeEach(() => {
    repo = {
      createDevice: vi.fn(),
      getDevice: vi.fn(),
      listDevices: vi.fn(),
      updateDevice: vi.fn(),
      deleteDevice: vi.fn(),
    };
    service = new DeviceService(repo);
  });

  it("creates a device and returns the id", async () => {
    repo.createDevice.mockResolvedValue({ id: "device-1" });

    const result = await service.createDevice({
      name: "Living Room Light",
      deviceType: "light",
    });

    expect(repo.createDevice).toHaveBeenCalledWith({
      name: "Living Room Light",
      deviceType: "light",
    });
    expect(result).toBe("device-1");
  });

  it("gets a device or throws if not found", async () => {
    repo.getDevice.mockResolvedValue(null);

    await expect(service.getDevice("missing-id")).rejects.toThrow(
      "Device with ID missing-id not found",
    );
  });

  it("lists devices", async () => {
    const devices = [
      { id: "device-1", name: "A", deviceType: "light" },
      { id: "device-2", name: "B", deviceType: "sensor" },
    ];
    repo.listDevices.mockResolvedValue(devices);

    const result = await service.listDevices();

    expect(result).toEqual(devices);
  });

  it("updates a device or throws if not found", async () => {
    repo.updateDevice.mockResolvedValue(null);

    await expect(service.updateDevice("missing-id", { name: "New Name" })).rejects.toThrow(
      "Device with ID missing-id not found",
    );
  });

  it("deletes a device and logs errors if deletion fails", async () => {
    const error = new Error("db failed");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    repo.deleteDevice.mockRejectedValue(error);

    await expect(service.deleteDevice("device-1")).rejects.toThrow("db failed");
    expect(log).toHaveBeenCalledWith("Failed to delete device device-1", error);
  });
});
