import { describe, it, expect } from "vitest";
import {
  devices,
  deviceEvents,
  deviceStateProjection,
} from "../../src/db/schema";

//Note: Cannot test the actual database schema with Drizzle ORM, however we can test the schema definitions in the code.
//In addition, foreign key constraints and other database-level constraints cannot be tested with Drizzle ORM, so we will not be able to test those.
describe("Database Schema", () => {
  describe("devices table", () => {
    it("has correct columns", () => {
      expect(devices.id).toBeDefined();
      expect(devices.name).toBeDefined();
      expect(devices.deviceType).toBeDefined();
      expect(devices.createdAt).toBeDefined();
      expect(devices.updatedAt).toBeDefined();
    });

    it("has a primary key", () => {
      expect(devices.id.primary).toBe(true);
    });
  });

  describe("deviceEvents table", () => {
    it("has correct columns", () => {
      expect(deviceEvents.id).toBeDefined();
      expect(deviceEvents.deviceId).toBeDefined();
      expect(deviceEvents.eventType).toBeDefined();
      expect(deviceEvents.payload).toBeDefined();
      expect(deviceEvents.occurredAt).toBeDefined();
    });

    it("has a primary key", () => {
      expect(deviceEvents.id.primary).toBe(true);
    });

    it("deviceId is a UUID column", () => {
      expect(deviceEvents.deviceId.columnType).toBe("PgUUID");
    });
  });

  describe("deviceStateProjection table", () => {
    it("has correct columns", () => {
      expect(deviceStateProjection.deviceId).toBeDefined();
      expect(deviceStateProjection.stateJson).toBeDefined();
      expect(deviceStateProjection.updatedAt).toBeDefined();
    });

    it("uses deviceId as primary key", () => {
      expect(deviceStateProjection.deviceId.primary).toBe(true);
    });

    it("stateJson is JSONB", () => {
      expect(deviceStateProjection.stateJson.columnType).toBe("PgJsonb");
    });
  });
});
