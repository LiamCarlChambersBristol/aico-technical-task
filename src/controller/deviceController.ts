import { Controller } from "./common.controller";
import { AppContext } from "../context";
import { APIError } from "../errors";
import { DeviceService } from "../service/deviceService";
import { Device } from "../models/device";

export interface DeviceController extends Controller {
  createDevice(data: { name: string; deviceType: string }): Promise<string>;
  getDevice(deviceId: string): Promise<Device>;
  listDevices(): Promise<Device[]>;
  updateDevice(deviceId: string, updates: { name?: string; deviceType?: string }): Promise<string>;
  deleteDevice(deviceId: string): Promise<void>;
}

export function initialiseDeviceController({
  deviceService,
}: AppContext): DeviceController {
  const createDevice = async (data: { name: string; deviceType: string }): Promise<string> => {
    try {
      return await deviceService.createDevice(data);
    } catch (error) {
      const errorMessage = "Failed to create device";
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "create_device" });
    }
  };

  const getDevice = async (deviceId: string): Promise<Device> => {
    try {
      const result = await deviceService.getDevice(deviceId);
      if (!result) {
        throw new APIError(`Device with ID ${deviceId} not found`, { type: "get_device" });
      }
      return result;
    } catch (error) {
      const errorMessage = `Internal server error while fetching device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "get_device" });
    }
  };

  const listDevices = async (): Promise<Device[]> => {
    try {
      return await deviceService.listDevices();
    } catch (error) {
      const errorMessage = "Failed to list devices";
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "list_devices" });
    }
  };

  const updateDevice = async (
    deviceId: string,
    updates: { name?: string; deviceType?: string },
  ): Promise<string> => {
    try {
      return await deviceService.updateDevice(deviceId, updates);
    } catch (error) {
      const errorMessage = `Failed to update device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "update_device" });
    }
  };

  const deleteDevice = async (deviceId: string): Promise<void> => {
    try {
      await deviceService.deleteDevice(deviceId);
    } catch (error) {
      const errorMessage = `Failed to delete device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "delete_device" });
    }
  };

  return {
    route: "/devices",
    type: "device",
    createDevice,
    getDevice,
    listDevices,
    updateDevice,
    deleteDevice,
  };
}