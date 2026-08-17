import { Controller } from "./common.controller";
import { AppContext } from "../context";
import { APIError } from "../errors";
import { EventService } from "../service/eventsService";
import { DeviceEvent } from "../models/deviceEvent";

export interface EventController extends Controller {
  addEvent(event: DeviceEvent): Promise<string>;
  getEvents(deviceId: string, amount?: number): Promise<DeviceEvent[]>;
  getEventsSince(deviceId: string, since: Date): Promise<DeviceEvent[]>;
  getLatestEvent(deviceId: string): Promise<DeviceEvent | null>;
  deleteEvents(deviceId: string): Promise<void>;
}

export function initialiseEventController({ eventService }: AppContext): EventController {
  const addEvent = async <TPayload>(data: {
    deviceId: string;
    eventType: string;
    payload: TPayload;
  }): Promise<string> => {
    try {
      return await eventService.addEvent(data);
    } catch (error) {
      const errorMessage = "Failed to add event";
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "add_event" });
    }
  };

  const getEvents = async (deviceId: string, amount?: number): Promise<DeviceEvent[]> => {
    try {
      return await eventService.getEvents(deviceId, amount);
    } catch (error) {
      const errorMessage = `Failed to get events for device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "get_events" });
    }
  };

  const getEventsSince = async (deviceId: string, since: Date): Promise<DeviceEvent[]> => {
    try {
      return await eventService.getEventsSince(deviceId, since);
    } catch (error) {
      const errorMessage = `Failed to get events since ${since} for device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "get_events_since" });
    }
  };

  const getLatestEvent = async (deviceId: string): Promise<DeviceEvent | null> => {
    try {
      return await eventService.getLatestEvent(deviceId);
    } catch (error) {
      const errorMessage = `Failed to get latest event for device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "get_latest_event" });
    }
  };

  const deleteEvents = async (deviceId: string): Promise<void> => {
    try {
      await eventService.deleteEvents(deviceId);
    } catch (error) {
      const errorMessage = `Failed to delete events for device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "delete_events" });
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
