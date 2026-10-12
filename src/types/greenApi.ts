/** Учётные данные инстанса из личного кабинета GREEN-API. */
export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

/** Ошибки возвращаются значением, а не исключением: UI решает сам, что показать. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type InstanceState = "authorized" | "notAuthorized" | "blocked" | "starting" | "yellowCard";

export interface StateInstanceResponse {
  stateInstance: InstanceState;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId?: string;
}

export type WebhookType =
  | "incomingMessageReceived"
  | "outgoingMessageReceived"
  | "outgoingAPIMessageReceived"
  | "outgoingMessageStatus"
  | "stateInstanceChanged";

export interface SenderData {
  chatId: string;
  sender: string;
  chatName?: string;
  senderName?: string;
  senderContactName?: string;
  senderPhoneNumber?: number;
}

export interface MessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string };
}

export interface NotificationBody {
  typeWebhook: WebhookType | string;
  timestamp: number;
  idMessage?: string;
  senderData?: SenderData;
  messageData?: MessageData;
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}
