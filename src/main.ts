import { db } from "./db/client";
import { createMultiControllerServer } from "./routes/routes";
import { initialiseDeviceController } from "./controller/deviceController";
import { initialiseEventController } from "./controller/eventController";
import { initialiseProjectionController } from "./controller/projectionController";
import { DeviceService } from "./service/deviceService";
import { EventService } from "./service/eventsService";
import { ProjectionService } from "./service/projectionService";
import { DeviceRepo } from "./repo/deviceRepo";
import { EventRepo } from "./repo/eventsRepo";
import { ProjectionRepo } from "./repo/projectionRepo";

async function bootstrap() {
  // Initialize repositories
  const deviceRepo = new DeviceRepo(db);
  const eventRepo = new EventRepo(db);
  const projectionRepo = new ProjectionRepo(db);

  // Initialize services
  const deviceService = new DeviceService(deviceRepo);
  const eventService = new EventService(eventRepo);
  const projectionService = new ProjectionService();

  // Create app context
  const appContext = {
    deviceService,
    eventService,
    projectionService,
  };

  // Initialize all controllers
  const deviceController = initialiseDeviceController(appContext);
  const eventController = initialiseEventController(appContext);
  const projectionController = initialiseProjectionController(appContext);

  // Start multi-controller server on single port
  const server = await createMultiControllerServer(
    [deviceController, eventController, projectionController],
    3000
  );

  console.log("✓ Server listening on http://localhost:3000");
  console.log("  - POST /devices, GET /devices, GET /devices/:id, PUT /devices/:id, DELETE /devices/:id");
  console.log("  - POST /events, GET /events, GET /events/:id, DELETE /events/:id");
  console.log("  - POST /projections, GET /projections, GET /projections/:id, DELETE /projections/:id");

  return server;
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
