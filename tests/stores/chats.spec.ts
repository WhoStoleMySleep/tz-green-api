import { describe, expect, test } from "vitest";
import type { ChatMessage } from "../../src/types/chat";

const chat = { id: "10000000", title: "+7 999 123-45-67", phone: "79991234567", createdAt: 1 };

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "m1",
    chatId: chat.id,
    text: "Привет",
    direction: "incoming",
    timestamp: 10,
    status: "sent",
    ...overrides,
  };
}

describe("useChatsStore", () => {
  test("openChat добавляет чат и делает его активным", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    useChatsStore.getState().openChat(chat);
    expect(useChatsStore.getState().chats[chat.id]).toEqual(chat);
    expect(useChatsStore.getState().activeChatId).toBe(chat.id);
  });

  test("повторный openChat не затирает существующий чат", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    useChatsStore.getState().openChat(chat);
    useChatsStore.getState().openChat({ ...chat, title: "Другое имя" });
    expect(useChatsStore.getState().chats[chat.id].title).toBe(chat.title);
  });

  test("сообщение от незнакомца создаёт чат с его именем", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    useChatsStore.getState().receiveMessage(message({ chatId: "555" }), "Анна");
    expect(useChatsStore.getState().chats["555"]).toEqual({
      id: "555",
      title: "Анна",
      createdAt: 10,
    });
    expect(useChatsStore.getState().messages["555"]).toHaveLength(1);
  });

  test("одно и то же уведомление не дублирует сообщение", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    useChatsStore.getState().receiveMessage(message(), "Анна");
    useChatsStore.getState().receiveMessage(message(), "Анна");
    expect(useChatsStore.getState().messages[chat.id]).toHaveLength(1);
  });

  test("confirmMessage меняет черновик на сообщение с idMessage", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    const pending = message({ id: "pending-1", direction: "outgoing", status: "pending" });
    useChatsStore.getState().addPendingMessage(pending);
    useChatsStore.getState().confirmMessage(pending, "BAE5");
    expect(useChatsStore.getState().messages[chat.id]).toEqual([
      { ...pending, id: "BAE5", status: "sent" },
    ]);
  });

  test("если уведомление обогнало ответ sendMessage, черновик убирается без дубля", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    const pending = message({ id: "pending-1", direction: "outgoing", status: "pending" });
    useChatsStore.getState().addPendingMessage(pending);
    useChatsStore
      .getState()
      .receiveMessage(message({ id: "BAE5", direction: "outgoing" }), chat.title);
    useChatsStore.getState().confirmMessage(pending, "BAE5");
    expect(useChatsStore.getState().messages[chat.id].map((item) => item.id)).toEqual(["BAE5"]);
  });

  test("failMessage помечает черновик ошибкой и не трогает исходный объект", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    const pending = message({ id: "pending-1", direction: "outgoing", status: "pending" });
    useChatsStore.getState().addPendingMessage(pending);
    useChatsStore.getState().failMessage(pending);
    expect(useChatsStore.getState().messages[chat.id][0].status).toBe("failed");
    expect(pending.status).toBe("pending");
  });

  test("reset очищает чаты, сообщения и активный чат", async () => {
    const { useChatsStore } = await import("../../src/stores/chats");
    useChatsStore.getState().openChat(chat);
    useChatsStore.getState().receiveMessage(message(), chat.title);
    useChatsStore.getState().reset();
    expect(useChatsStore.getState()).toMatchObject({ chats: {}, messages: {}, activeChatId: null });
  });
});

describe("selectSortedChats", () => {
  test("сверху чат с самым свежим сообщением, пустой чат сортируется по дате создания", async () => {
    const { selectSortedChats } = await import("../../src/stores/chats");
    const chats = {
      old: { id: "old", title: "Старый", createdAt: 1 },
      fresh: { id: "fresh", title: "Свежий", createdAt: 2 },
      empty: { id: "empty", title: "Новый", createdAt: 50 },
    };
    const messages = {
      old: [message({ chatId: "old", timestamp: 5 })],
      fresh: [message({ chatId: "fresh", timestamp: 100 })],
    };
    expect(selectSortedChats({ chats, messages }).map((item) => item.id)).toEqual([
      "fresh",
      "empty",
      "old",
    ]);
  });

  test("без чатов возвращает пустой список", async () => {
    const { selectSortedChats } = await import("../../src/stores/chats");
    expect(selectSortedChats({ chats: {}, messages: {} })).toEqual([]);
  });
});
