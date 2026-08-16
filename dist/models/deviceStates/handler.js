"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const lightHandlers = {
    LightTurnedOn: (s) => ({ ...s, isOn: true }),
    LightTurnedOff: (s) => ({ ...s, isOn: false }),
    BrightnessChanged: (s, e) => ({ ...s, brightness: e.payload.value }),
};
const thermostatHandlers = {
    ThermostatTurnedOn: (s) => ({ ...s, isOn: true }),
    TemperatureMeasured: (s, e) => ({ ...s, temperature: e.payload.value }),
    ModeChanged: (s, e) => ({ ...s, mode: e.payload.mode }),
};
const electricVehicleChargerHandlers = {
    ChargingStarted: (s) => ({ ...s, charging: true }),
    ChargingStopped: (s) => ({ ...s, charging: false }),
    EnergyDelivered: (s, e) => ({ ...s, kWh: (s.kWh ?? 0) + e.payload.kWh }),
};
exports.handlers = {
    ...lightHandlers,
    ...thermostatHandlers,
    ...electricVehicleChargerHandlers,
};
