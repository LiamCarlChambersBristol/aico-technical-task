"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
class Device {
    constructor(id, name, deviceType, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.deviceType = deviceType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static fromDb(record) {
        return new Device(record.id, record.name, record.deviceType, record.createdAt, record.updatedAt);
    }
}
exports.Device = Device;
