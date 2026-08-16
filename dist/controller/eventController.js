"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseEventController = initialiseEventController;
const errors_1 = require("../errors");
function initialiseEventController({ eventService }) {
    const addEvent = async (event) => {
        try {
            return await eventService.addEvent(event);
        }
        catch (error) {
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
