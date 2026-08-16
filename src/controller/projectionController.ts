import { Controller } from "./common.controller";
import { AppContext } from "../context";
import { APIError } from "../errors";
import { ProjectionService } from "../service/projectionService";
import { DeviceStateProjection } from "../models/deviceStateProjection";

export interface ProjectionController extends Controller {
  rebuildProjection(deviceId: string): Promise<DeviceStateProjection>;
}

export function initialiseProjectionController({
  projectionService,
}: AppContext): ProjectionController {
  const rebuildProjection = async (
    deviceId: string
  ): Promise<DeviceStateProjection> => {
    try {
      return await projectionService.rebuildProjection(deviceId);
    } catch (error) {
      const errorMessage = `Failed to rebuild projection for device ${deviceId}`;
      console.error(errorMessage, error);
      throw new APIError(errorMessage, { type: "rebuild_projection" });
    }
  };

  return {
    route: "/projections",
    type: "projection",
    rebuildProjection,
  };
}
