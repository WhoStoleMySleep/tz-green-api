import { describe, expect, test, vi } from "vitest";
import type { Credentials } from "../../src/types/greenApi";

const credentials: Credentials = {
  apiUrl: "https://api.green-api.com/v3/",
  idInstance: "3100000001",
  apiTokenInstance: "token",
};
const BASE = "https://api.green-api.com/v3/waInstance3100000001";

function mockFetch(status: number, body: string) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(body, { status }));
}

describe("createGreenApi", () => {
  test("sendMessage шлёт POST с chatId и текстом и возвращает idMessage", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    const fetchMock = mockFetch(200, '{"idMessage":"BAE5"}');
    const result = await createGreenApi(credentials).sendMessage("10000000", "Привет");
    expect(result).toEqual({ ok: true, data: { idMessage: "BAE5" } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/sendMessage/token`);
    expect(init).toMatchObject({
      method: "POST",
      body: '{"chatId":"10000000","message":"Привет"}',
    });
  });

  test("receiveNotification ждёт уведомление long-poll запросом", async () => {
    const { createGreenApi, RECEIVE_TIMEOUT_SEC } = await import("../../src/api/greenApi");
    const fetchMock = mockFetch(200, "null");
    const result = await createGreenApi(credentials).receiveNotification();
    expect(result).toEqual({ ok: true, data: null });
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${BASE}/receiveNotification/token?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`,
    );
  });

  test("receiveNotification принимает свой таймаут ожидания", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    const fetchMock = mockFetch(200, "null");
    await createGreenApi(credentials).receiveNotification(undefined, 5);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/receiveNotification/token?receiveTimeout=5`);
  });

  test("пустое тело ответа читается как null", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    mockFetch(200, "");
    expect(await createGreenApi(credentials).receiveNotification()).toEqual({
      ok: true,
      data: null,
    });
  });

  test("deleteNotification кладёт receiptId в путь после токена", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    const fetchMock = mockFetch(200, '{"result":true}');
    await createGreenApi(credentials).deleteNotification(42);
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/deleteNotification/token/42`);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });

  test("checkAccount передаёт номер числом", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    const fetchMock = mockFetch(200, '{"exist":true,"chatId":"1000000001"}');
    await createGreenApi(credentials).checkAccount(79991234567);
    expect(fetchMock.mock.calls[0][1]?.body).toBe('{"phoneNumber":79991234567}');
  });

  test("401 превращается в понятную ошибку, а не исключение", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    mockFetch(401, "");
    expect(await createGreenApi(credentials).getStateInstance()).toEqual({
      ok: false,
      error: "Неверный idInstance или apiTokenInstance",
    });
  });

  test("неизвестный статус показывает код", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    mockFetch(502, "");
    expect(await createGreenApi(credentials).getStateInstance()).toEqual({
      ok: false,
      error: "Ошибка GREEN-API (502)",
    });
  });

  test("сетевая ошибка логируется и возвращается значением", async () => {
    const { createGreenApi } = await import("../../src/api/greenApi");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await createGreenApi(credentials).getStateInstance()).toEqual({
      ok: false,
      error: "Нет связи с GREEN-API",
    });
    expect(logSpy).toHaveBeenCalled();
  });

  test("отменённый запрос не считается сетевой ошибкой", async () => {
    const { ABORTED_ERROR, createGreenApi } = await import("../../src/api/greenApi");
    const controller = new AbortController();
    controller.abort();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new DOMException("aborted", "AbortError"));
    const result = await createGreenApi(credentials).receiveNotification(controller.signal);
    expect(result).toEqual({ ok: false, error: ABORTED_ERROR });
  });
});
