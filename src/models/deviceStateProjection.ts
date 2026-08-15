export class DeviceStateProjection<TPayload = unknown> {
  constructor(
    public readonly deviceId: string,
    public readonly stateJson: TPayload,
    public readonly updatedAt: Date,
  ) {}

  static fromDb<TPayload>(record: {
    deviceId: string;
    stateJson: TPayload;
    updatedAt: Date;
  }): DeviceStateProjection {
    return new DeviceStateProjection(
      record.deviceId,
      record.stateJson,
      record.updatedAt,
    );
  }
}
