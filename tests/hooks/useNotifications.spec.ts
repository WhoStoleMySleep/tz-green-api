import { renderHook, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { createFakeApi } from "../fakeApi";

const notification = {
  receiptId: 1,
  body: {
    typeWebhook: "incomingMessageReceived",
    timestamp: 1588091580,
    idMessage: "in-1",
    senderData: { chatId: "10000000", sender: "10000000", senderName: "Анна" },
    messageData: { typeMessage: "textMessage", textMessageData: { textMessage: "Ответ" } },
  },
};

test("входящее сообщение попадает в стор, а при размонтировании цикл останавливается", async () => {
  const { useNotifications } = await import("../../src/hooks/useNotifications");
  const { useChatsStore } = await import("../../src/stores/chats");
  let signal: AbortSignal | undefined;
  const receiveNotification = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, data: notification })
    .mockImplementation((nextSignal: AbortSignal) => {
      signal = nextSignal;
      return new Promise(() => {});
    });
  const api = createFakeApi({ receiveNotification });
  const { unmount } = renderHook(() => useNotifications(api));
  await waitFor(() => expect(useChatsStore.getState().messages["10000000"]).toHaveLength(1));
  expect(useChatsStore.getState().chats["10000000"].title).toBe("Анна");
  expect(api.deleteNotification).toHaveBeenCalledWith(1);
  unmount();
  expect(signal?.aborted).toBe(true);
});

test("без клиента уведомления не запрашиваются", async () => {
  const { useNotifications } = await import("../../src/hooks/useNotifications");
  const { result } = renderHook(() => useNotifications(null));
  expect(result.current.connected).toBe(true);
});
