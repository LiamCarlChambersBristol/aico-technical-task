"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventRoutes = createEventRoutes;
exports.startEventApi = startEventApi;
const http = __importStar(require("http"));
const errors_1 = require("../errors");
const jsonHeaders = {
    "Content-Type": "application/json",
};
function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, jsonHeaders);
    res.end(JSON.stringify(payload));
}
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
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
            }
            catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}
function createEventRoutes(controller) {
    return async (req, res) => {
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
                        ? parseInt(url.searchParams.get("amount"))
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
        }
        catch (error) {
            const message = error instanceof errors_1.APIError ? error.message : "Internal server error";
            const statusCode = error instanceof errors_1.APIError ? 400 : 500;
            return sendJson(res, statusCode, { error: message });
        }
    };
}
function startEventApi(controller, port = 3001) {
    const server = http.createServer(createEventRoutes(controller));
    return new Promise((resolve) => {
        server.listen(port, "127.0.0.1", () => {
            resolve(server);
        });
    });
}
