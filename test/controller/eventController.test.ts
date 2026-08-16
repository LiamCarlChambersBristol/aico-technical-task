import { describe, it, expect, vi } from "vitest";
import { initialiseEventController } from "../../src/controller/eventController";
import { APIError } from "../../src/errors";
import { DeviceEvent } from "../../src/models/deviceEvent";
import { AppContext } from "../../src/context";

describe("EventController", () => {
  const mockEvent = new DeviceEvent(
    "event-1",
    "device-1",
    "LightTurnedOn",
    { brightness: 80 },
    new Date()
  );

  const createMockAppContext = (overrides?: Partial<AppContext>): AppContext => {
    return {
      deviceService: {
        createDevice: vi.fn(),
        getDevice: vi.fn(),
        listDevices: vi.fn(),
        updateDevice: vi.fn(),
        deleteDevice: vi.fn(),
      },
      eventService: {
        addEvent: vi.fn(),
        getEvents: vi.fn(),
        getEventsSince: vi.fn(),
        getLatestEvent: vi.fn(),
        deleteEvents: vi.fn(),
      },
      projectionService: {
        rebuildProjection: vi.fn(),
      },
      ...overrides,
    } as any;
  };

  it("adds an event", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.addEvent as any).mockResolvedValue("event-1");

    const controller = initialiseEventController(mockContext);
    const result = await controller.addEvent(mockEvent);

    expect(result).toBe("event-1");
    expect(mockContext.eventService.addEvent).toHaveBeenCalledWith(mockEvent);
  });

  it("throws APIError when addEvent fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.addEvent as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseEventController(mockContext);

    await expect(controller.addEvent(mockEvent)).rejects.toThrow(APIError);
  });

  it("gets events for a device with amount", async () => {
    const mockEvents = [mockEvent];
    const mockContext = createMockAppContext();
    (mockContext.eventService.getEvents as any).mockResolvedValue(mockEvents);

    const controller = initialiseEventController(mockContext);
    const result = await controller.getEvents("device-1", 10);

    expect(result).toEqual(mockEvents);
    expect(mockContext.eventService.getEvents).toHaveBeenCalledWith("device-1", 10);
  });

  it("throws APIError when getEvents fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.getEvents as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseEventController(mockContext);

    await expect(controller.getEvents("device-1")).rejects.toThrow(APIError);
  });

  it("gets events since a timestamp", async () => {
    const since = new Date();
    const mockEvents = [mockEvent];
    const mockContext = createMockAppContext();
    (mockContext.eventService.getEventsSince as any).mockResolvedValue(mockEvents);

    const controller = initialiseEventController(mockContext);
    const result = await controller.getEventsSince("device-1", since);

    expect(result).toEqual(mockEvents);
    expect(mockContext.eventService.getEventsSince).toHaveBeenCalledWith("device-1", since);
  });

  it("throws APIError when getEventsSince fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.getEventsSince as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseEventController(mockContext);

    await expect(controller.getEventsSince("device-1", new Date())).rejects.toThrow(APIError);
  });

  it("gets latest event", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.getLatestEvent as any).mockResolvedValue(mockEvent);

    const controller = initialiseEventController(mockContext);
    const result = await controller.getLatestEvent("device-1");

    expect(result).toEqual(mockEvent);
    expect(mockContext.eventService.getLatestEvent).toHaveBeenCalledWith("device-1");
  });

  it("returns null when no latest event", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.getLatestEvent as any).mockResolvedValue(null);

    const controller = initialiseEventController(mockContext);
    const result = await controller.getLatestEvent("device-1");

    expect(result).toBeNull();
  });

  it("throws APIError when getLatestEvent fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.getLatestEvent as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseEventController(mockContext);

    await expect(controller.getLatestEvent("device-1")).rejects.toThrow(APIError);
  });

  it("deletes events for a device", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.deleteEvents as any).mockResolvedValue(undefined);

    const controller = initialiseEventController(mockContext);
    await controller.deleteEvents("device-1");

    expect(mockContext.eventService.deleteEvents).toHaveBeenCalledWith("device-1");
  });

  it("throws APIError when deleteEvents fails", async () => {
    const mockContext = createMockAppContext();
    (mockContext.eventService.deleteEvents as any).mockRejectedValue(new Error("DB error"));

    const controller = initialiseEventController(mockContext);

    await expect(controller.deleteEvents("device-1")).rejects.toThrow(APIError);
  });

  it("has correct route and type", () => {
    const mockContext = createMockAppContext();
    const controller = initialiseEventController(mockContext);

    expect(controller.route).toBe("/events");
    expect(controller.type).toBe("event");
  });
});
