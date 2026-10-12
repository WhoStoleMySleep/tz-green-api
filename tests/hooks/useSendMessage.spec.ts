import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { createFakeApi } from "../fakeApi";

describe("useSendMessage", () => {
  test("после ответа API сообщение получает idMessage и статус sent", async () => {
    const { useSendMessage } = await import("../../src/hooks/useSendMessage");
    const { useChatsStore } = await import("../../src/stores/chats");
    const api = createFakeApi();
    const { result } = renderHook(() => useSendMessage(api));
    await act(() => result.current.sendMessage("10000000", "  Привет  "));
    expect(api.sendMessage).toHaveBeenCalledWith("10000000", "Привет");
    expect(useChatsStore.getState().messages["10000000"]).toMatchObject([
      { id: "BAE5", text: "Привет", status: "sent" },
    ]);
  });

  test("ошибка API помечает сообщение failed", async () => {
    const { useSendMessage } = await import("../../src/hooks/useSendMessage");
    const { useChatsStore } = await import("../../src/stores/chats");
    const api = createFakeApi({ sendMessage: vi.fn(async () => ({ ok: false, error: "Ошибка" })) });
    const { result } = renderHook(() => useSendMessage(api));
    await act(() => result.current.sendMessage("10000000", "Привет"));
    expect(useChatsStore.getState().messages["10000000"][0].status).toBe("failed");
  });

  test("пустой текст и отсутствие клиента ничего не отправляют", async () => {
    const { useSendMessage } = await import("../../src/hooks/useSendMessage");
    const api = createFakeApi();
    const { result } = renderHook(() => useSendMessage(api));
    await act(() => result.current.sendMessage("10000000", "   "));
    expect(api.sendMessage).not.toHaveBeenCalled();
    const { result: withoutApi } = renderHook(() => useSendMessage(null));
    await act(() => withoutApi.current.sendMessage("10000000", "Привет"));
  });
});
