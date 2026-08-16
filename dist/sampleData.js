"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectSampleData = injectSampleData;
const client_1 = require("./db/client");
const schema_1 = require("./db/schema");
const deviceRepo_1 = require("./repo/deviceRepo");
const eventsRepo_1 = require("./repo/eventsRepo");
const projectionRepo_1 = require("./repo/projectionRepo");
const projectionService_1 = require("./service/projectionService");
const deviceEvent_1 = require("./models/deviceEvent");
const uuid_1 = require("uuid");
async function injectSampleData() {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await client_1.db.delete(schema_1.deviceStateProjection);
    await client_1.db.delete(schema_1.deviceEvents);
    await client_1.db.delete(schema_1.devices);
    // Initialize repos and services
    const deviceRepo = new deviceRepo_1.DeviceRepo(client_1.db);
    const eventRepo = new eventsRepo_1.EventRepo(client_1.db);
    const projectionRepo = new projectionRepo_1.ProjectionRepo(client_1.db);
    const projectionService = new projectionService_1.ProjectionService();
    // Create sample devices
    console.log("📱 Creating sample devices...");
    const lightDevice = await deviceRepo.createDevice({
        name: "Living Room Light",
        deviceType: "light",
    });
    const thermostatDevice = await deviceRepo.createDevice({
        name: "Hall Thermostat",
        deviceType: "thermostat",
    });
    const chargerDevice = await deviceRepo.createDevice({
        name: "Tesla Charger",
        deviceType: "ev_charger",
    });
    console.log("✅ Devices created:");
    console.log(`  - ${lightDevice.name} (${lightDevice.id})`);
    console.log(`  - ${thermostatDevice.name} (${thermostatDevice.id})`);
    console.log(`  - ${chargerDevice.name} (${chargerDevice.id})`);
    // Add sample events for light device
    console.log("\n💡 Adding light events...");
    const now = new Date();
    const lightEvents = [
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), lightDevice.id, "LightTurnedOn", {}, new Date(now.getTime() - 3600000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), lightDevice.id, "BrightnessChanged", { value: 80 }, new Date(now.getTime() - 1800000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), lightDevice.id, "BrightnessChanged", { value: 50 }, new Date(now.getTime() - 600000)),
    ];
    for (const event of lightEvents) {
        await eventRepo.appendEvent(lightDevice.id, event);
    }
    console.log(`✅ Added ${lightEvents.length} light events`);
    // Add sample events for thermostat
    console.log("\n🌡️  Adding thermostat events...");
    const thermostatEvents = [
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), thermostatDevice.id, "ThermostatTurnedOn", {}, new Date(now.getTime() - 7200000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), thermostatDevice.id, "TemperatureMeasured", { value: 18 }, new Date(now.getTime() - 3600000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), thermostatDevice.id, "ModeChanged", { mode: "heating" }, new Date(now.getTime() - 3000000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), thermostatDevice.id, "TemperatureMeasured", { value: 21 }, new Date(now.getTime() - 600000)),
    ];
    for (const event of thermostatEvents) {
        await eventRepo.appendEvent(thermostatDevice.id, event);
    }
    console.log(`✅ Added ${thermostatEvents.length} thermostat events`);
    // Add sample events for EV charger
    console.log("\n🔌 Adding EV charger events...");
    const chargerEvents = [
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), chargerDevice.id, "ChargingStarted", {}, new Date(now.getTime() - 5400000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), chargerDevice.id, "EnergyDelivered", { kWh: 5.5 }, new Date(now.getTime() - 3600000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), chargerDevice.id, "EnergyDelivered", { kWh: 3.2 }, new Date(now.getTime() - 1800000)),
        new deviceEvent_1.DeviceEvent((0, uuid_1.v4)(), chargerDevice.id, "ChargingStopped", {}, new Date(now.getTime() - 600000)),
    ];
    for (const event of chargerEvents) {
        await eventRepo.appendEvent(chargerDevice.id, event);
    }
    console.log(`✅ Added ${chargerEvents.length} EV charger events`);
    // Rebuild projections
    console.log("\n🔄 Rebuilding projections...");
    await projectionService.rebuildProjection(lightDevice.id);
    await projectionService.rebuildProjection(thermostatDevice.id);
    await projectionService.rebuildProjection(chargerDevice.id);
    console.log("✅ Projections rebuilt");
    // Display final state
    console.log("\n📊 Final states:");
    const lightProjection = await projectionRepo.getProjection(lightDevice.id);
    const thermostatProjection = await projectionRepo.getProjection(thermostatDevice.id);
    const chargerProjection = await projectionRepo.getProjection(chargerDevice.id);
    console.log(`\nLight: ${JSON.stringify(lightProjection?.stateJson, null, 2)}`);
    console.log(`\nThermostat: ${JSON.stringify(thermostatProjection?.stateJson, null, 2)}`);
    console.log(`\nEV Charger: ${JSON.stringify(chargerProjection?.stateJson, null, 2)}`);
    console.log("\n✨ Seeding complete!");
}
if (require.main === module) {
    injectSampleData().catch((err) => {
        console.error("❌ Sample data injection failed:", err);
        process.exit(1);
    });
}
