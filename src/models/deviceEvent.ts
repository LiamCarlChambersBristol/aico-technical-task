export class DeviceEvent<TPayload = unknown> {
  constructor(
    public readonly id: string,
    public readonly deviceId: string,
    public readonly eventType: string,
    public readonly payload: TPayload,
    public readonly occurredAt: Date,
  ) {}

  static fromDb<TPayload>(record: {
    id: string;
    deviceId: string;
    eventType: string;
    payload: TPayload;
    occurredAt: Date;
  }): DeviceEvent<TPayload> {
    return new DeviceEvent(
      record.id,
      record.deviceId,
      record.eventType,
      record.payload,
      record.occurredAt,
    );
  }
}
