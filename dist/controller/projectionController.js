"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseProjectionController = initialiseProjectionController;
const errors_1 = require("../errors");
function initialiseProjectionController({ projectionService, }) {
    const rebuildProjection = async (deviceId) => {
        try {
            return await projectionService.rebuildProjection(deviceId);
        }
        catch (error) {
            const errorMessage = `Failed to rebuild projection for device ${deviceId}`;
            console.error(errorMessage, error);
            throw new errors_1.APIError(errorMessage, { type: "rebuild_projection" });
        }
    };
    return {
        route: "/projections",
        type: "projection",
        rebuildProjection,
    };
}
