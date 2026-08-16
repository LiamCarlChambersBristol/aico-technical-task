"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceEvent = void 0;
class DeviceEvent {
    constructor(id, deviceId, eventType, payload, occurredAt) {
        this.id = id;
        this.deviceId = deviceId;
        this.eventType = eventType;
        this.payload = payload;
        this.occurredAt = occurredAt;
    }
    static fromDb(record) {
        return new DeviceEvent(record.id, record.deviceId, record.eventType, record.payload, record.occurredAt);
    }
}
exports.DeviceEvent = DeviceEvent;
