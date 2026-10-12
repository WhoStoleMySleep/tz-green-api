import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const credentials = {
  apiUrl: "https://api.green-api.com/v3",
  idInstance: "3100000001",
  apiTokenInstance: "token",
};

function mockState(stateInstance: string) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ stateInstance }), { status: 200 }),
  );
}

describe("useSession", () => {
  test("авторизованный инстанс пускает внутрь", async () => {
    const { useSession } = await import("../../src/hooks/useSession");
    const { useAuthStore } = await import("../../src/stores/auth");
    mockState("authorized");
    const { result } = renderHook(() => useSession());
    await act(() => result.current.signIn(credentials));
    expect(useAuthStore.getState().credentials).toEqual(credentials);
    expect(result.current.error).toBeNull();
  });

  test("неавторизованный в MAX инстанс не пускает и объясняет почему", async () => {
    const { useSession } = await import("../../src/hooks/useSession");
    const { useAuthStore } = await import("../../src/stores/auth");
    mockState("notAuthorized");
    const { result } = renderHook(() => useSession());
    await act(() => result.current.signIn(credentials));
    expect(useAuthStore.getState().credentials).toBeNull();
    expect(result.current.error).toMatch(/notAuthorized/);
  });

  test("неверный токен показывает ошибку API", async () => {
    const { useSession } = await import("../../src/hooks/useSession");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 401 }));
    const { result } = renderHook(() => useSession());
    await act(() => result.current.signIn(credentials));
    expect(result.current.error).toBe("Неверный idInstance или apiTokenInstance");
  });

  test("выход очищает и учётные данные, и чаты", async () => {
    const { useSession } = await import("../../src/hooks/useSession");
    const { useAuthStore } = await import("../../src/stores/auth");
    const { useChatsStore } = await import("../../src/stores/chats");
    useAuthStore.getState().login(credentials);
    useChatsStore.getState().openChat({ id: "1", title: "Чат", createdAt: 1 });
    const { result } = renderHook(() => useSession());
    act(() => result.current.signOut());
    expect(useAuthStore.getState().credentials).toBeNull();
    expect(useChatsStore.getState().chats).toEqual({});
  });
});
