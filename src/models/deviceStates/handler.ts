import { DeviceEvent } from "../deviceEvent";
import { DeviceState } from "./deviceState";

type EventHandler = (state: DeviceState, event: DeviceEvent<any>) => DeviceState;

const lightHandlers: Record<string, EventHandler> = {
  LightTurnedOn: (s) => ({ ...s, isOn: true }),
  LightTurnedOff: (s) => ({ ...s, isOn: false }),
  BrightnessChanged: (s, e) => ({ ...s, brightness: e.payload.value }),
};

const thermostatHandlers: Record<string, EventHandler> = {
  ThermostatTurnedOn: (s) => ({ ...s, isOn: true }),
  TemperatureMeasured: (s, e) => ({ ...s, temperature: e.payload.value }),
  ModeChanged: (s, e) => ({ ...s, mode: e.payload.mode }),
};

const electricVehicleChargerHandlers: Record<string, EventHandler> = {
  ChargingStarted: (s) => ({ ...s, charging: true }),
  ChargingStopped: (s) => ({ ...s, charging: false }),
  EnergyDelivered: (s, e) => ({ ...s, kWh: (s.kWh ?? 0) + e.payload.kWh }),
};

export const handlers: Record<string, EventHandler> = {
  ...lightHandlers,
  ...thermostatHandlers,
  ...electricVehicleChargerHandlers,
};