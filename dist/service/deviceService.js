"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
class DeviceService {
    constructor(deviceRepo) {
        this.deviceRepo = deviceRepo;
    }
    async createDevice(data) {
        const device = await this.deviceRepo.createDevice(data);
        return device.id;
    }
    async getDevice(deviceId) {
        const device = await this.deviceRepo.getDevice(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        return device;
    }
    async listDevices() {
        return await this.deviceRepo.listDevices();
    }
    async updateDevice(deviceId, updates) {
        const updatedDevice = await this.deviceRepo.updateDevice(deviceId, updates);
        if (!updatedDevice) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        return updatedDevice.id;
    }
    async deleteDevice(deviceId) {
        try {
            await this.deviceRepo.deleteDevice(deviceId);
        }
        catch (error) {
            console.error(`Failed to delete device ${deviceId}`, error);
            throw error;
        }
    }
}
exports.DeviceService = DeviceService;
