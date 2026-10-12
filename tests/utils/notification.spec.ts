import { describe, expect, test } from "vitest";
import type { NotificationBody } from "../../src/types/greenApi";

const incomingText: NotificationBody = {
  typeWebhook: "incomingMessageReceived",
  timestamp: 1588091580,
  idMessage: "2755232962562",
  senderData: {
    chatId: "10000000",
    sender: "10000000",
    chatName: "Ходабрыш",
    senderName: "Ходабрыш П.",
  },
  messageData: { typeMessage: "textMessage", textMessageData: { textMessage: "Привет" } },
};

describe("notificationToMessage", () => {
  test("входящий текст превращается во входящее сообщение чата", async () => {
    const { notificationToMessage } = await import("../../src/utils/notification");
    expect(notificationToMessage(incomingText)).toEqual({
      id: "2755232962562",
      chatId: "10000000",
      text: "Привет",
      direction: "incoming",
      timestamp: 1588091580000,
      status: "sent",
    });
  });

  test("текст с превью ссылки тоже принимается", async () => {
    const { notificationToMessage } = await import("../../src/utils/notification");
    const body: NotificationBody = {
      ...incomingText,
      messageData: {
        typeMessage: "extendedTextMessage",
        extendedTextMessageData: { text: "https://max.ru" },
      },
    };
    expect(notificationToMessage(body)?.text).toBe("https://max.ru");
  });

  test("сообщения, отправленные с телефона и через API, считаются исходящими", async () => {
    const { notificationToMessage } = await import("../../src/utils/notification");
    const fromPhone = notificationToMessage({
      ...incomingText,
      typeWebhook: "outgoingMessageReceived",
    });
    const fromApi = notificationToMessage({
      ...incomingText,
      typeWebhook: "outgoingAPIMessageReceived",
    });
    expect(fromPhone?.direction).toBe("outgoing");
    expect(fromApi?.direction).toBe("outgoing");
  });

  test("медиа, статусы и неполные уведомления пропускаются", async () => {
    const { notificationToMessage } = await import("../../src/utils/notification");
    const image = { ...incomingText, messageData: { typeMessage: "imageMessage" } };
    const status = { typeWebhook: "outgoingMessageStatus", timestamp: 1 };
    const withoutSender = { ...incomingText, senderData: undefined };
    const withoutId = { ...incomingText, idMessage: undefined };
    expect(notificationToMessage(image)).toBeNull();
    expect(notificationToMessage(status)).toBeNull();
    expect(notificationToMessage(withoutSender)).toBeNull();
    expect(notificationToMessage(withoutId)).toBeNull();
  });

  test("пустой текст не создаёт сообщение", async () => {
    const { notificationToMessage } = await import("../../src/utils/notification");
    const body = {
      ...incomingText,
      messageData: { typeMessage: "textMessage", textMessageData: { textMessage: "" } },
    };
    expect(notificationToMessage(body)).toBeNull();
  });
});

describe("notificationChatTitle", () => {
  test("предпочитает имя чата", async () => {
    const { notificationChatTitle } = await import("../../src/utils/notification");
    expect(notificationChatTitle(incomingText)).toBe("Ходабрыш");
  });

  test("без имён показывает chatId", async () => {
    const { notificationChatTitle } = await import("../../src/utils/notification");
    expect(
      notificationChatTitle({ ...incomingText, senderData: { chatId: "42", sender: "42" } }),
    ).toBe("42");
  });

  test("без отправителя — заглушка", async () => {
    const { notificationChatTitle } = await import("../../src/utils/notification");
    expect(notificationChatTitle({ typeWebhook: "incomingMessageReceived", timestamp: 1 })).toBe(
      "Без имени",
    );
  });
});
