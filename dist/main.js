"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./db/client");
const routes_1 = require("./routes/routes");
const deviceController_1 = require("./controller/deviceController");
const eventController_1 = require("./controller/eventController");
const projectionController_1 = require("./controller/projectionController");
const deviceService_1 = require("./service/deviceService");
const eventsService_1 = require("./service/eventsService");
const projectionService_1 = require("./service/projectionService");
const deviceRepo_1 = require("./repo/deviceRepo");
const eventsRepo_1 = require("./repo/eventsRepo");
const sampleData_1 = require("./sampleData");
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const ensureDatabase_1 = require("./db/ensureDatabase");
async function bootstrap() {
    await (0, ensureDatabase_1.ensureDatabase)();
    await (0, migrator_1.migrate)(client_1.db, { migrationsFolder: "./drizzle" });
    await (0, sampleData_1.injectSampleData)();
    // Initialize repositories
    const deviceRepo = new deviceRepo_1.DeviceRepo(client_1.db);
    const eventRepo = new eventsRepo_1.EventRepo(client_1.db);
    // Initialize services
    const deviceService = new deviceService_1.DeviceService(deviceRepo);
    const eventService = new eventsService_1.EventService(eventRepo);
    const projectionService = new projectionService_1.ProjectionService();
    // Create app context
    const appContext = {
        deviceService,
        eventService,
        projectionService,
    };
    // Initialize all controllers
    const deviceController = (0, deviceController_1.initialiseDeviceController)(appContext);
    const eventController = (0, eventController_1.initialiseEventController)(appContext);
    const projectionController = (0, projectionController_1.initialiseProjectionController)(appContext);
    // Start multi-controller server on single port
    const server = await (0, routes_1.createMultiControllerServer)([deviceController, eventController, projectionController], 3000);
    console.log("✅ Server running on http://localhost:3000\n");
    console.log("📚 Available endpoints:");
    console.log("   Devices:     POST/GET /devices, GET/PUT/DELETE /devices/:id");
    console.log("   Events:      POST/GET /events, GET /events/:id, DELETE /events/:id");
    console.log("   Projections: POST/GET /projections, GET /projections/:id, DELETE /projections/:id");
    return server;
}
bootstrap().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
