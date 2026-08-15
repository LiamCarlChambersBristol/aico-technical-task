export type DeviceState =
    & LightState
    & ThermostatState
    & ElectricVehicleChargerState

interface LightState {
  isOn?: boolean;
  brightness?: number;
}

interface ThermostatState {
  isOn?: boolean;
  temperature?: number;
  targetTemperature?: number;
  mode?: string;
}

interface ElectricVehicleChargerState {
  charging?: boolean;
  kWh?: number;
}
