import { Device } from "../models/device";
import { DeviceRepo } from "../repo/deviceRepo";

export class DeviceService {
    constructor(private readonly deviceRepo: DeviceRepo) {}

    async createDevice(
        data: { name: string; deviceType: string }
    ): Promise<string> {
        const device = await this.deviceRepo.createDevice(data);
        return device.id;
    }
    
    async getDevice(deviceId: string): Promise<Device | null> {
        const device = await this.deviceRepo.getDevice(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        return device;
    }

    async listDevices(): Promise<Device[]> {
        return await this.deviceRepo.listDevices();
    }

    async updateDevice(
        deviceId: string,
        updates: { name?: string; deviceType?: string }
    ): Promise<string> {
        const updatedDevice = await this.deviceRepo.updateDevice(deviceId, updates);
        if (!updatedDevice) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        return updatedDevice.id;
    }

    async deleteDevice(deviceId: string) {
        try{
            await this.deviceRepo.deleteDevice(deviceId);
        } catch (error) {
            console.error(`Failed to delete device ${deviceId}`, error);
            throw error;
        }
    }
}
