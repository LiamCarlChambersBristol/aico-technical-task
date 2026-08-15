export class Device {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly deviceType: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
  ) {}

  static fromDb(record: {
    id: string;
    name: string;
    deviceType: string;
    createdAt: Date;
    updatedAt: Date | null;
  }): Device {
    return new Device(
      record.id,
      record.name,
      record.deviceType,
      record.createdAt,
      record.updatedAt,
    );
  }
}
