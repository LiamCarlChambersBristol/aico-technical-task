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
exports.startGenericApi = exports.createControllerDeviceRoutes = void 0;
exports.createDeviceRoutes = createDeviceRoutes;
exports.startDeviceApi = startDeviceApi;
const http = __importStar(require("http"));
const errors_1 = require("../errors");
const routes_1 = require("./routes");
const jsonHeaders = {
    "Content-Type": "application/json",
};
function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, jsonHeaders);
    res.end(JSON.stringify(payload));
}
function createDeviceRoutes(controller) {
    return async (req, res) => {
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
                const body = await new Promise((resolve, reject) => {
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
                const createdId = await controller.createDevice(body);
                return sendJson(res, 201, { id: createdId });
            }
            if (req.method === "PUT" && url.pathname.startsWith("/devices/")) {
                const deviceId = url.pathname.split("/").pop() ?? "";
                const body = await new Promise((resolve, reject) => {
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
                const updatedId = await controller.updateDevice(deviceId, body);
                return sendJson(res, 200, { id: updatedId });
            }
            if (req.method === "DELETE" && url.pathname.startsWith("/devices/")) {
                const deviceId = url.pathname.split("/").pop() ?? "";
                await controller.deleteDevice(deviceId);
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
function startDeviceApi(controller, port = 3000) {
    const server = http.createServer(createDeviceRoutes(controller));
    return new Promise((resolve) => {
        server.listen(port, "127.0.0.1", () => {
            resolve(server);
        });
    });
}
exports.createControllerDeviceRoutes = routes_1.createControllerRoutes;
exports.startGenericApi = routes_1.startApi;
