import { vi } from "vitest";

/**
 * Mock database client for tests
 * Provides properly typed mock methods without using `any`
 */
export function createMockDbClient() {
  return {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export type MockDbClient = ReturnType<typeof createMockDbClient>;
