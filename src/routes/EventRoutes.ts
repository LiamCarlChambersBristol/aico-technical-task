import * as http from "http";
import { EventController } from "../controller/eventController";
import { APIError } from "../errors";

const jsonHeaders = {
  "Content-Type": "application/json",
};

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(payload));
}

function readJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
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
}

export function createEventRoutes(controller: EventController) {
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    try {
      if (req.method === "POST" && url.pathname === "/events") {
        const body = await readJsonBody(req);
        const eventId = await controller.addEvent(body);
        return sendJson(res, 201, { id: eventId });
      }

      if (req.method === "GET" && url.pathname.startsWith("/events/")) {
        const parts = url.pathname.split("/").filter((p) => p);

        if (parts.length === 3 && parts[1] === "latest") {
          const deviceId = parts[0].replace("events", "");
          // Handle /events/:deviceId/latest
          const parts2 = url.pathname.split("/");
          const deviceId2 = parts2[1];
          const event = await controller.getLatestEvent(deviceId2);
          return sendJson(res, 200, event);
        }

        if (parts.length >= 2) {
          const deviceId = parts[1];

          if (parts[2] === "latest") {
            const event = await controller.getLatestEvent(deviceId);
            return sendJson(res, 200, event);
          }

          if (parts[2] === "since" && parts[3]) {
            const since = new Date(parts[3]);
            const events = await controller.getEventsSince(deviceId, since);
            return sendJson(res, 200, events);
          }

          const amount = url.searchParams.get("amount")
            ? parseInt(url.searchParams.get("amount")!)
            : undefined;
          const events = await controller.getEvents(deviceId, amount);
          return sendJson(res, 200, events);
        }
      }

      if (req.method === "DELETE" && url.pathname.startsWith("/events/")) {
        const deviceId = url.pathname.split("/").pop() ?? "";
        await controller.deleteEvents(deviceId);
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

export function startEventApi(controller: EventController, port = 3001) {
  const server = http.createServer(createEventRoutes(controller));

  return new Promise<http.Server>((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}
