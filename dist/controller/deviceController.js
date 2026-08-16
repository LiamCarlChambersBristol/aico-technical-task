"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseDeviceController = initialiseDeviceController;
const errors_1 = require("../errors");
function initialiseDeviceController({ deviceService, }) {
    const createDevice = async (data) => {
        try {
            return await deviceService.createDevice(data);
        }
        catch (error) {
            const errorMessage = "Failed to create device";
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "create_device" });
        }
    };
    const getDevice = async (deviceId) => {
        try {
            const result = await deviceService.getDevice(deviceId);
            if (!result) {
                throw new errors_1.APIError(`Device with ID ${deviceId} not found`, { type: "get_device" });
            }
            return result;
        }
        catch (error) {
            const errorMessage = `Internal server error while fetching device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "get_device" });
        }
    };
    const listDevices = async () => {
        try {
            return await deviceService.listDevices();
        }
        catch (error) {
            const errorMessage = "Failed to list devices";
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "list_devices" });
        }
    };
    const updateDevice = async (deviceId, updates) => {
        try {
            return await deviceService.updateDevice(deviceId, updates);
        }
        catch (error) {
            const errorMessage = `Failed to update device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "update_device" });
        }
    };
    const deleteDevice = async (deviceId) => {
        try {
            await deviceService.deleteDevice(deviceId);
        }
        catch (error) {
            const errorMessage = `Failed to delete device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "delete_device" });
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
