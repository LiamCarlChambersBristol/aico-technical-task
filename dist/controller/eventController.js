"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseEventController = initialiseEventController;
const errors_1 = require("../errors");
function initialiseEventController({ eventService, deviceService }) {
    const addEvent = async (data) => {
        if (!data || typeof data !== "object") {
            throw new errors_1.APIError("Invalid event payload", { type: "add_event" });
        }
        const { deviceId, eventType, payload } = data;
        if (typeof deviceId !== "string" || !deviceId.trim()) {
            throw new errors_1.APIError("deviceId is required", { type: "add_event" });
        }
        if (typeof eventType !== "string" || !eventType.trim()) {
            throw new errors_1.APIError("eventType is required", { type: "add_event" });
        }
        if (payload === undefined || payload === null) {
            throw new errors_1.APIError("payload is required", { type: "add_event" });
        }
        try {
            const device = await deviceService.getDevice(deviceId);
            if (!device) {
                throw new errors_1.APIError(`Device with ID ${deviceId} not found`, { type: "add_event" });
            }
            return await eventService.addEvent(data);
        }
        catch (error) {
            if (error instanceof errors_1.APIError) {
                throw error;
            }
            const errorMessage = "Failed to add event";
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "add_event" });
        }
    };
    const getEvents = async (deviceId, amount) => {
        try {
            return await eventService.getEvents(deviceId, amount);
        }
        catch (error) {
            const errorMessage = `Failed to get events for device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "get_events" });
        }
    };
    const getEventsSince = async (deviceId, since) => {
        try {
            return await eventService.getEventsSince(deviceId, since);
        }
        catch (error) {
            const errorMessage = `Failed to get events since ${since} for device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "get_events_since" });
        }
    };
    const getLatestEvent = async (deviceId) => {
        try {
            return await eventService.getLatestEvent(deviceId);
        }
        catch (error) {
            const errorMessage = `Failed to get latest event for device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "get_latest_event" });
        }
    };
    const deleteEvents = async (deviceId) => {
        try {
            await eventService.deleteEvents(deviceId);
        }
        catch (error) {
            const errorMessage = `Failed to delete events for device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "delete_events" });
        }
    };
    return {
        route: "/events",
        type: "event",
        addEvent,
        getEvents,
        getEventsSince,
        getLatestEvent,
        deleteEvents,
    };
}
