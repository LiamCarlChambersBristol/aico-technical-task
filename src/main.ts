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
import { injectSampleData } from "./sampleData";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { ensureDatabase } from "./db/ensureDatabase";

async function bootstrap() {
  await ensureDatabase();
  await migrate(db, { migrationsFolder: "./drizzle" });

  // Initialize repositories
  const deviceRepo = new DeviceRepo(db);
  const eventRepo = new EventRepo(db);

  if ((await deviceRepo.listDevices()).length === 0) {
    await injectSampleData();
  }

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

  console.log("✅ Server running on http://localhost:3000\n");
  console.log("📚 Available endpoints:");
  console.log("   Devices:     /devices/listDevices, /devices/getDevice/:id, /devices/createDevice, /devices/updateDevice/:id, /devices/deleteDevice/:id");
  console.log("   Events:      /events/addEvent, /events/getEvents/:deviceId, /events/getEventsSince/:deviceId/:since, /events/getLatestEvent/:deviceId, /events/deleteEvents/:deviceId");
  console.log("   Projections: /projections/rebuildProjection/:deviceId");

  return server;
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
