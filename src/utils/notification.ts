import type { ChatMessage, MessageDirection } from "../types/chat";
import type { MessageData, NotificationBody } from "../types/greenApi";

const MESSAGE_DIRECTIONS: Record<string, MessageDirection> = {
  incomingMessageReceived: "incoming",
  outgoingMessageReceived: "outgoing",
  outgoingAPIMessageReceived: "outgoing",
};

const MS_IN_SECOND = 1000;

/** По заданию принимаем только текст: обычный и с превью ссылки. */
function extractText(messageData?: MessageData): string | null {
  if (messageData?.typeMessage === "textMessage")
    return messageData.textMessageData?.textMessage ?? null;
  if (messageData?.typeMessage === "extendedTextMessage")
    return messageData.extendedTextMessageData?.text ?? null;
  return null;
}

/**
 * Превращает уведомление GREEN-API в сообщение чата.
 * null — уведомление не про текстовое сообщение (статусы, медиа, состояние инстанса).
 */
export function notificationToMessage(body: NotificationBody): ChatMessage | null {
  const direction = MESSAGE_DIRECTIONS[body.typeWebhook];
  const text = extractText(body.messageData);
  const chatId = body.senderData?.chatId;
  if (!direction || !text || !chatId || !body.idMessage) return null;
  return {
    id: body.idMessage,
    chatId,
    text,
    direction,
    timestamp: body.timestamp * MS_IN_SECOND,
    status: "sent",
  };
}

/** Имя собеседника для чата, который пришёл из уведомления, а не был создан вручную. */
export function notificationChatTitle(body: NotificationBody): string {
  const sender = body.senderData;
  return (
    sender?.chatName ||
    sender?.senderContactName ||
    sender?.senderName ||
    sender?.chatId ||
    "Без имени"
  );
}
