import { describe, it, expect } from "vitest";
import { buildState } from "../../src/domain/buildState";
import { DeviceEvent } from "../../src/models/deviceEvent";

describe("buildState", () => {
  it("applies light events in order", () => {
    const events = [
      new DeviceEvent("event-1", "device-1", "LightTurnedOn", {}, new Date()),
      new DeviceEvent("event-2", "device-1", "BrightnessChanged", { value: 80 }, new Date()),
    ];

    const state = buildState(events);

    expect(state).toEqual({
      isOn: true,
      brightness: 80,
    });
  });

  it("preserves the initial state and applies later events", () => {
    const initialState = { isOn: false, kWh: 5 } as any;
    const events = [
      new DeviceEvent("event-1", "device-1", "ChargingStarted", {}, new Date()),
      new DeviceEvent("event-2", "device-1", "EnergyDelivered", { kWh: 12 }, new Date()),
    ];

    const state = buildState(events, initialState);

    expect(state).toEqual({
      isOn: false,
      kWh: 17,
      charging: true,
    });
  });

  it("ignores unknown event types", () => {
    const events = [
      new DeviceEvent("event-1", "device-1", "UnknownEvent", { value: 99 }, new Date()),
    ];

    const state = buildState(events, { temperature: 20 } as any);

    expect(state).toEqual({ temperature: 20 });
  });
});
