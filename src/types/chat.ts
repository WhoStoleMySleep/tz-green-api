export type MessageDirection = "incoming" | "outgoing";

/** pending — ушло в API и ждёт idMessage, failed — API вернул ошибку. */
export type MessageStatus = "pending" | "sent" | "failed";

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status: MessageStatus;
}

export interface Chat {
  /** chatId в MAX — это ID пользователя, а не номер телефона. */
  id: string;
  title: string;
  phone?: string;
  createdAt: number;
}
