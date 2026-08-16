import * as http from "http";
import { DeviceController } from "../controller/deviceController";
import { APIError } from "../errors";
import { createControllerRoutes, startApi } from "./routes";

const jsonHeaders = {
  "Content-Type": "application/json",
};

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(payload));
}

export function createDeviceRoutes(controller: DeviceController) {
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    try {
      if (req.method === "GET" && url.pathname === "/devices") {
        const devices = await controller.listDevices();
        return sendJson(res, 200, devices);
      }

      if (req.method === "GET" && url.pathname.startsWith("/devices/")) {
        const deviceId = url.pathname.split("/").pop() ?? "";
        const device = await controller.getDevice(deviceId);
        return sendJson(res, 200, device);
      }

      if (req.method === "POST" && url.pathname === "/devices") {
        const body = await new Promise<any>((resolve, reject) => {
          const chunks: Buffer[] = [];

          req.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });

          req.on("end", () => {
            if (chunks.length === 0) {
              resolve({});
              return;
            }

            try {
              const raw = Buffer.concat(chunks).toString("utf8");
              resolve(raw ? JSON.parse(raw) : {});
            } catch (error) {
              reject(error);
            }
          });

          req.on("error", reject);
        });

        const createdId = await controller.createDevice(body);
        return sendJson(res, 201, { id: createdId });
      }

      if (req.method === "PUT" && url.pathname.startsWith("/devices/")) {
        const deviceId = url.pathname.split("/").pop() ?? "";
        const body = await new Promise<any>((resolve, reject) => {
          const chunks: Buffer[] = [];

          req.on("data", (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });

          req.on("end", () => {
            if (chunks.length === 0) {
              resolve({});
              return;
            }

            try {
              const raw = Buffer.concat(chunks).toString("utf8");
              resolve(raw ? JSON.parse(raw) : {});
            } catch (error) {
              reject(error);
            }
          });

          req.on("error", reject);
        });

        const updatedId = await controller.updateDevice(deviceId, body);
        return sendJson(res, 200, { id: updatedId });
      }

      if (req.method === "DELETE" && url.pathname.startsWith("/devices/")) {
        const deviceId = url.pathname.split("/").pop() ?? "";
        await controller.deleteDevice(deviceId);
        return sendJson(res, 204, null);
      }

      return sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      const message = error instanceof APIError ? error.message : "Internal server error";
      const statusCode = error instanceof APIError ? 400 : 500;
      return sendJson(res, statusCode, { error: message });
    }
  };
}

export function startDeviceApi(controller: DeviceController, port = 3000) {
  const server = http.createServer(createDeviceRoutes(controller));

  return new Promise<http.Server>((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}

export const createControllerDeviceRoutes = createControllerRoutes;
export const startGenericApi = startApi;
