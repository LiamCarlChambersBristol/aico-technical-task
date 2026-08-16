import * as http from "http";
import { ProjectionController } from "../controller/projectionController";
import { APIError } from "../errors";

const jsonHeaders = {
  "Content-Type": "application/json",
};

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(payload));
}

export function createProjectionRoutes(controller: ProjectionController) {
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    try {
      if (req.method === "POST" && url.pathname.startsWith("/projections/")) {
        const deviceId = url.pathname.split("/").pop() ?? "";
        const projection = await controller.rebuildProjection(deviceId);
        return sendJson(res, 200, projection);
      }

      return sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      const message = error instanceof APIError ? error.message : "Internal server error";
      const statusCode = error instanceof APIError ? 400 : 500;
      return sendJson(res, statusCode, { error: message });
    }
  };
}

export function startProjectionApi(controller: ProjectionController, port = 3002) {
  const server = http.createServer(createProjectionRoutes(controller));

  return new Promise<http.Server>((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve(server);
    });
  });
}
