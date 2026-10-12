import { vi } from "vitest";
import type { GreenApi } from "../src/api/greenApi";

/** Подменный клиент GREEN-API: тест переопределяет только нужные методы. */
export function createFakeApi(overrides: Partial<Record<keyof GreenApi, unknown>> = {}): GreenApi {
  return {
    getStateInstance: vi.fn(async () => ({ ok: true, data: { stateInstance: "authorized" } })),
    checkAccount: vi.fn(async () => ({ ok: true, data: { exist: true, chatId: "10000000" } })),
    sendMessage: vi.fn(async () => ({ ok: true, data: { idMessage: "BAE5" } })),
    receiveNotification: vi.fn(() => new Promise(() => {})),
    deleteNotification: vi.fn(async () => ({ ok: true, data: { result: true } })),
    ...overrides,
  } as GreenApi;
}
