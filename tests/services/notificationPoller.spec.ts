import { describe, expect, test, vi } from "vitest";
import type { GreenApi } from "../../src/api/greenApi";
import type { ApiResult, Notification, NotificationBody } from "../../src/types/greenApi";

const body: NotificationBody = {
  typeWebhook: "incomingMessageReceived",
  timestamp: 1,
  idMessage: "m1",
};

/** API, который отдаёт заготовленные ответы по очереди, а потом отменяет цикл. */
function createApi(responses: ApiResult<Notification | null>[], controller: AbortController) {
  const receiveNotification = vi.fn(async () => {
    const next = responses.shift();
    if (!next) controller.abort();
    return next ?? { ok: false as const, error: "aborted" };
  });
  const deleteNotification = vi.fn(async () => ({ ok: true as const, data: { result: true } }));
  return {
    api: { receiveNotification, deleteNotification } as unknown as GreenApi,
    deleteNotification,
  };
}

describe("pollNotifications", () => {
  test("передаёт уведомление обработчику и удаляет его из очереди", async () => {
    const { pollNotifications } = await import("../../src/services/notificationPoller");
    const controller = new AbortController();
    const { api, deleteNotification } = createApi(
      [{ ok: true, data: { receiptId: 7, body } }],
      controller,
    );
    const onNotification = vi.fn();
    await pollNotifications(api, controller.signal, {
      onNotification,
      onConnectionChange: vi.fn(),
    });
    expect(onNotification).toHaveBeenCalledWith(body);
    expect(deleteNotification).toHaveBeenCalledWith(7);
  });

  test("пустая очередь не вызывает обработчик и удаление", async () => {
    const { pollNotifications } = await import("../../src/services/notificationPoller");
    const controller = new AbortController();
    const { api, deleteNotification } = createApi([{ ok: true, data: null }], controller);
    const onNotification = vi.fn();
    await pollNotifications(api, controller.signal, {
      onNotification,
      onConnectionChange: vi.fn(),
    });
    expect(onNotification).not.toHaveBeenCalled();
    expect(deleteNotification).not.toHaveBeenCalled();
  });

  test("после ошибки сообщает о потере связи, ждёт и восстанавливается", async () => {
    vi.useFakeTimers();
    const { pollNotifications, RETRY_DELAY_MS } =
      await import("../../src/services/notificationPoller");
    const controller = new AbortController();
    const { api } = createApi(
      [
        { ok: false, error: "Нет связи" },
        { ok: true, data: null },
      ],
      controller,
    );
    const onConnectionChange = vi.fn();
    const polling = pollNotifications(api, controller.signal, {
      onNotification: vi.fn(),
      onConnectionChange,
    });
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    await polling;
    expect(onConnectionChange.mock.calls).toEqual([[false], [true]]);
    vi.useRealTimers();
  });

  test("после ошибки опрашивает с коротким таймаутом, после восстановления — с обычным", async () => {
    vi.useFakeTimers();
    const { pollNotifications, RETRY_DELAY_MS } =
      await import("../../src/services/notificationPoller");
    const { RECEIVE_TIMEOUT_SEC, RECOVERY_TIMEOUT_SEC } = await import("../../src/api/greenApi");
    const controller = new AbortController();
    const { api } = createApi(
      [
        { ok: false, error: "Нет связи" },
        { ok: true, data: null },
      ],
      controller,
    );
    const polling = pollNotifications(api, controller.signal, {
      onNotification: vi.fn(),
      onConnectionChange: vi.fn(),
    });
    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS);
    await polling;
    const timeouts = vi.mocked(api.receiveNotification).mock.calls.map(([, timeout]) => timeout);
    expect(timeouts).toEqual([RECEIVE_TIMEOUT_SEC, RECOVERY_TIMEOUT_SEC, RECEIVE_TIMEOUT_SEC]);
    vi.useRealTimers();
  });

  test("уже отменённый сигнал не делает ни одного запроса", async () => {
    const { pollNotifications } = await import("../../src/services/notificationPoller");
    const controller = new AbortController();
    controller.abort();
    const { api } = createApi([], controller);
    await pollNotifications(api, controller.signal, {
      onNotification: vi.fn(),
      onConnectionChange: vi.fn(),
    });
    expect(api.receiveNotification).not.toHaveBeenCalled();
  });
});
