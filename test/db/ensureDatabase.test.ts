import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clientFactory = vi.fn();

vi.mock("pg", () => ({
  Client: class MockClient {
    connect = vi.fn(async () => {
      const attempt = clientFactory.mock.calls.length;
      if (attempt === 1) {
        throw new Error("temporary connection failure");
      }
    });

    query = vi.fn(async () => ({ rowCount: 1 }));
    end = vi.fn(async () => undefined);

    constructor() {
      clientFactory();
    }
  },
}));

describe("ensureDatabase", () => {
  beforeEach(() => {
    vi.spyOn(global, "setTimeout").mockImplementation(((fn: TimerHandler) => {
      if (typeof fn === "function") {
        fn();
      }
      return 0 as any;
    }) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    delete process.env.DATABASE_URL;
  });

  it("creates a new client for retry attempts instead of reusing a connected client", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/demo_db";

    const { ensureDatabase } = await import("../../src/db/ensureDatabase");
    await expect(ensureDatabase()).resolves.toBeUndefined();

    expect(clientFactory).toHaveBeenCalledTimes(2);
  });
});
