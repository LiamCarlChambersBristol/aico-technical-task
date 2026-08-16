import * as http from "http";
import { Controller } from "../controller/common.controller";
import { APIError } from "../errors";

const jsonHeaders = {
  "Content-Type": "application/json",
};

type RouteController = Controller & {
  [key: string]: any;
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

export function createControllerRoutes(controller: RouteController) {
  const basePath = controller.route.replace(/\/$/, "") || "/";

  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    try {
      const itemPath = `${basePath}/`;

      if (controller.type === "event") {
        if (req.method === "POST" && url.pathname === basePath) {
          const body = await readJsonBody(req);
          const eventId = await controller.addEvent(body);
          return sendJson(res, 201, { id: eventId });
        }

        if (req.method === "GET" && url.pathname.startsWith(itemPath)) {
          const pathParts = url.pathname.slice(itemPath.length).split("/");
          const deviceId = pathParts[0];

          if (pathParts[1] === "latest") {
            const event = await controller.getLatestEvent(deviceId);
            return sendJson(res, 200, event);
          }

          if (pathParts[1] === "since" && pathParts[2]) {
            const events = await controller.getEventsSince(
              deviceId,
              new Date(pathParts[2])
            );
            return sendJson(res, 200, events);
          }

          const amount = url.searchParams.get("amount");
          const events = await controller.getEvents(
            deviceId,
            amount ? parseInt(amount, 10) : undefined
          );
          return sendJson(res, 200, events);
        }

        if (req.method === "DELETE" && url.pathname.startsWith(itemPath)) {
          const deviceId = url.pathname.slice(itemPath.length);
          await controller.deleteEvents(deviceId);
          return sendJson(res, 204, null);
        }
      }

      if (
        controller.type === "projection" &&
        req.method === "POST" &&
        url.pathname.startsWith(itemPath)
      ) {
        const deviceId = url.pathname.slice(itemPath.length);
        const projection = await controller.rebuildProjection(deviceId);
        return sendJson(res, 200, projection);
      }

      if (req.method === "GET" && url.pathname === basePath) {
        const listFn = controller.listDevices ?? controller.list ?? controller.getAll;
        const result = listFn ? await listFn() : null;
        return sendJson(res, 200, result);
      }

      if (req.method === "GET" && url.pathname.startsWith(itemPath)) {
        const id = url.pathname.replace(itemPath, "") || "";
        const getFn = controller.getDevice ?? controller.getById ?? controller.get;
        const result = getFn ? await getFn(id) : null;
        return sendJson(res, 200, result);
      }

      if (req.method === "POST" && url.pathname === basePath) {
        const body = await readJsonBody(req);
        const createFn = controller.createDevice ?? controller.create;
        const created = createFn ? await createFn(body) : null;
        return sendJson(res, 201, created);
      }

      if (req.method === "PUT" && url.pathname.startsWith(itemPath)) {
        const id = url.pathname.replace(itemPath, "") || "";
        const body = await readJsonBody(req);
        const updateFn = controller.updateDevice ?? controller.update;
        const updated = updateFn ? await updateFn(id, body) : null;
        return sendJson(res, 200, updated);
      }

      if (req.method === "DELETE" && url.pathname.startsWith(itemPath)) {
        const id = url.pathname.replace(itemPath, "") || "";
        const deleteFn = controller.deleteDevice ?? controller.delete;
        if (deleteFn) {
          await deleteFn(id);
        }
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

export function startApi(controller: RouteController, port = 3000) {
  const handler = createControllerRoutes(controller);
  const server = http.createServer(handler);

  return new Promise<http.Server>((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}

export function createMultiControllerServer(
  controllers: RouteController[],
  port = 3000
): Promise<http.Server> {
  const handlers = controllers.map((controller) => ({
    controller,
    handler: createControllerRoutes(controller),
    basePath: controller.route.replace(/\/$/, "") || "/",
  }));

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    for (const { handler, basePath } of handlers) {
      if (url.pathname === basePath || url.pathname.startsWith(`${basePath}/`)) {
        return handler(req, res);
      }
    }

    res.writeHead(404, jsonHeaders);
    res.end(JSON.stringify({ error: "Not found" }));
  });

  return new Promise<http.Server>((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}
