import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { createFakeApi } from "../fakeApi";

describe("useCreateChat", () => {
  test("по номеру находит chatId в MAX и открывает чат", async () => {
    const { useCreateChat } = await import("../../src/hooks/useCreateChat");
    const { useChatsStore } = await import("../../src/stores/chats");
    const api = createFakeApi();
    const { result } = renderHook(() => useCreateChat(api));
    let created = false;
    await act(async () => {
      created = await result.current.createChat("8 (999) 123-45-67");
    });
    expect(created).toBe(true);
    expect(api.checkAccount).toHaveBeenCalledWith(79991234567);
    expect(useChatsStore.getState().activeChatId).toBe("10000000");
    expect(useChatsStore.getState().chats["10000000"]).toMatchObject({
      title: "+7 999 123-45-67",
      phone: "79991234567",
    });
  });

  test("невалидный номер не доходит до API", async () => {
    const { useCreateChat } = await import("../../src/hooks/useCreateChat");
    const api = createFakeApi();
    const { result } = renderHook(() => useCreateChat(api));
    await act(async () => {
      await result.current.createChat("123");
    });
    expect(api.checkAccount).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/международном формате/);
  });

  test("номер без MAX показывает ошибку и не создаёт чат", async () => {
    const { useCreateChat } = await import("../../src/hooks/useCreateChat");
    const { useChatsStore } = await import("../../src/stores/chats");
    const api = createFakeApi({
      checkAccount: vi.fn(async () => ({ ok: true, data: { exist: false } })),
    });
    const { result } = renderHook(() => useCreateChat(api));
    await act(async () => {
      await result.current.createChat("+79991234567");
    });
    expect(result.current.error).toBe("Этот номер не зарегистрирован в MAX");
    expect(useChatsStore.getState().chats).toEqual({});
  });

  test("ошибка API выводится пользователю", async () => {
    const { useCreateChat } = await import("../../src/hooks/useCreateChat");
    const api = createFakeApi({
      checkAccount: vi.fn(async () => ({ ok: false, error: "Превышен лимит тарифа" })),
    });
    const { result } = renderHook(() => useCreateChat(api));
    await act(async () => {
      await result.current.createChat("+79991234567");
    });
    expect(result.current.error).toBe("Превышен лимит тарифа");
  });

  test("двойной сабмит отправляет один запрос", async () => {
    const { useCreateChat } = await import("../../src/hooks/useCreateChat");
    const api = createFakeApi();
    const { result } = renderHook(() => useCreateChat(api));
    await act(async () => {
      await Promise.all([
        result.current.createChat("+79991234567"),
        result.current.createChat("+79991234567"),
      ]);
    });
    expect(api.checkAccount).toHaveBeenCalledTimes(1);
  });
});
