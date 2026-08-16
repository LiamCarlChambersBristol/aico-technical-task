import { DeviceService } from "./service/deviceService";
import { EventService } from "./service/eventsService";
import { ProjectionService } from "./service/projectionService";

export interface AppContext {
  deviceService: DeviceService;
  eventService: EventService;
  projectionService: ProjectionService;
}
