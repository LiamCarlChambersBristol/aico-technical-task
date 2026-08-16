import { describe, it, expect } from "vitest";
import { buildState } from "../../src/domain/buildState";
import { DeviceEvent } from "../../src/models/deviceEvent";
import { v4 as uuidv4 } from "uuid";

describe("buildState", () => {
  describe("Light device events", () => {
    it("builds state from LightTurnedOn event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.isOn).toBe(true);
    });

    it("builds state from LightTurnedOff event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOff",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.isOn).toBe(false);
    });

    it("builds state from BrightnessChanged event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "BrightnessChanged",
          { value: 75 },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.brightness).toBe(75);
    });

    it("accumulates light events in sequence", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "BrightnessChanged",
          { value: 80 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "BrightnessChanged",
          { value: 50 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOff",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.isOn).toBe(false);
      expect(state.brightness).toBe(50);
    });
  });

  describe("Thermostat device events", () => {
    it("builds state from ThermostatTurnedOn event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ThermostatTurnedOn",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.isOn).toBe(true);
    });

    it("builds state from TemperatureMeasured event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "TemperatureMeasured",
          { value: 22.5 },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.temperature).toBe(22.5);
    });

    it("builds state from ModeChanged event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ModeChanged",
          { mode: "cooling" },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.mode).toBe("cooling");
    });

    it("accumulates thermostat events in sequence", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ThermostatTurnedOn",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ModeChanged",
          { mode: "heating" },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "TemperatureMeasured",
          { value: 18 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "TemperatureMeasured",
          { value: 21 },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.isOn).toBe(true);
      expect(state.mode).toBe("heating");
      expect(state.temperature).toBe(21);
    });
  });

  describe("EV Charger device events", () => {
    it("builds state from ChargingStarted event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ChargingStarted",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.charging).toBe(true);
    });

    it("builds state from ChargingStopped event", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ChargingStopped",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.charging).toBe(false);
    });

    it("accumulates energy from multiple EnergyDelivered events", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 5.5 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 3.2 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 2.1 },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.kWh).toBeCloseTo(10.8);
    });

    it("accumulates full charger event sequence", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ChargingStarted",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 10 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 5 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ChargingStopped",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.charging).toBe(false);
      expect(state.kWh).toBe(15);
    });
  });

  describe("Edge cases", () => {
    it("returns initial state when events are empty", () => {
      const initialState = { isOn: true, brightness: 50 };
      const state = buildState([], initialState);

      expect(state).toEqual(initialState);
    });

    it("handles empty initial state", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state).toHaveProperty("isOn", true);
    });

    it("ignores unknown event types", () => {
      const deviceId = uuidv4();
      const initialState = { isOn: false };
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "UnknownEventType",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
      ];

      const state = buildState(events, initialState);

      expect(state.isOn).toBe(true);
    });

    it("does not mutate initial state", () => {
      const deviceId = uuidv4();
      const initialState = { isOn: false, brightness: 0 };
      const initialStateCopy = { ...initialState };
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
      ];

      buildState(events, initialState);

      expect(initialState).toEqual(initialStateCopy);
    });

    it("processes events in order", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "BrightnessChanged",
          { value: 100 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "BrightnessChanged",
          { value: 25 },
          new Date()
        ),
      ];

      const state = buildState(events);

      // Should have the last brightness value, not the first
      expect(state.brightness).toBe(25);
      expect(state.isOn).toBe(true);
    });

    it("handles mixed device event types", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "LightTurnedOn",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "ThermostatTurnedOn",
          {},
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "BrightnessChanged",
          { value: 75 },
          new Date()
        ),
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "TemperatureMeasured",
          { value: 20 },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.isOn).toBe(true);
      expect(state.brightness).toBe(75);
      expect(state.temperature).toBe(20);
    });

    it("handles energy delivery with no initial kWh", () => {
      const deviceId = uuidv4();
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 5.5 },
          new Date()
        ),
      ];

      const state = buildState(events);

      expect(state.kWh).toBe(5.5);
    });

    it("handles energy delivery when kWh already exists", () => {
      const deviceId = uuidv4();
      const initialState = { kWh: 10 };
      const events = [
        new DeviceEvent(
          uuidv4(),
          deviceId,
          "EnergyDelivered",
          { kWh: 5 },
          new Date()
        ),
      ];

      const state = buildState(events, initialState);

      expect(state.kWh).toBe(15);
    });

    it("applies light events in order (regression test)", () => {
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

    it("preserves the initial state and applies later events (regression test)", () => {
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
  });
});
