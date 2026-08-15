import { DeviceEvent } from "../models/deviceEvent";
import { DeviceState } from "../models/deviceStates/deviceState";
import { handlers } from "../models/deviceStates/handler";

export function buildState(
  events: DeviceEvent<any>[],
  initialState: DeviceState = {} as DeviceState,
): DeviceState {
  let state: DeviceState = { ...initialState };

  for (const event of events) {
    const handler = handlers[event.eventType];
    if (handler) {
      state = handler(state, event);
    }
  }

  return state;
}
