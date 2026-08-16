"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceStateProjection = void 0;
class DeviceStateProjection {
    constructor(deviceId, stateJson, updatedAt) {
        this.deviceId = deviceId;
        this.stateJson = stateJson;
        this.updatedAt = updatedAt;
    }
    static fromDb(record) {
        return new DeviceStateProjection(record.deviceId, record.stateJson, record.updatedAt);
    }
}
exports.DeviceStateProjection = DeviceStateProjection;
