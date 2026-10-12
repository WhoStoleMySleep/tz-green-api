import type {
  ApiResult,
  CheckAccountResponse,
  Credentials,
  Notification,
  SendMessageResponse,
  StateInstanceResponse,
} from "../types/greenApi";

export const DEFAULT_API_URL = "https://api.green-api.com/v3";

/** Сколько секунд сервер держит long-poll запрос, если очередь пуста (допустимо 5–60). */
export const RECEIVE_TIMEOUT_SEC = 20;

/** Минимальный таймаут API: после обрыва связи быстрее узнаём, что она вернулась. */
export const RECOVERY_TIMEOUT_SEC = 5;

/** Запрос отменён самим приложением (выход, размонтирование) — показывать пользователю нечего. */
export const ABORTED_ERROR = "aborted";

const STATUS_ERRORS: Record<number, string> = {
  400: "Некорректный запрос",
  401: "Неверный idInstance или apiTokenInstance",
  403: "Доступ к инстансу запрещён",
  404: "Инстанс не найден — проверьте apiUrl и idInstance",
  429: "Слишком много запросов, попробуйте позже",
  466: "Превышен лимит тарифа",
};

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  query?: string;
  /** Часть пути после токена, например receiptId у deleteNotification. */
  pathSuffix?: string | number;
}

function buildUrl(credentials: Credentials, method: string, options: RequestOptions): string {
  const base = credentials.apiUrl.replace(/\/+$/, "");
  const suffix = options.pathSuffix === undefined ? "" : `/${options.pathSuffix}`;
  const query = options.query ? `?${options.query}` : "";
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}${query}`;
}

async function parseResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (!response.ok) {
    return {
      ok: false,
      error: STATUS_ERRORS[response.status] ?? `Ошибка GREEN-API (${response.status})`,
    };
  }
  const text = await response.text();
  return { ok: true, data: (text ? JSON.parse(text) : null) as T };
}

async function request<T>(
  credentials: Credentials,
  method: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(buildUrl(credentials, method, options), {
      method: options.method ?? "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (options.signal?.aborted) return { ok: false, error: ABORTED_ERROR };
    // eslint-disable-next-line no-console -- без лога сетевую ошибку (CORS, DNS) в браузере не отличить от прочих
    console.error("[green-api]", method, error);
    return { ok: false, error: "Нет связи с GREEN-API" };
  }
}

/**
 * Клиент GREEN-API для одного инстанса MAX. Учётные данные передаются снаружи,
 * поэтому клиент не знает, откуда они взялись (форма, стор, тест).
 */
export function createGreenApi(credentials: Credentials) {
  return {
    getStateInstance: () => request<StateInstanceResponse>(credentials, "getStateInstance"),

    checkAccount: (phoneNumber: number) =>
      request<CheckAccountResponse>(credentials, "checkAccount", {
        method: "POST",
        body: { phoneNumber },
      }),

    sendMessage: (chatId: string, message: string) =>
      request<SendMessageResponse>(credentials, "sendMessage", {
        method: "POST",
        body: { chatId, message },
      }),

    /** Пустая очередь — `data: null`: сервер продержал запрос timeoutSec секунд и ничего не дождался. */
    receiveNotification: (signal?: AbortSignal, timeoutSec = RECEIVE_TIMEOUT_SEC) =>
      request<Notification | null>(credentials, "receiveNotification", {
        query: `receiveTimeout=${timeoutSec}`,
        signal,
      }),

    deleteNotification: (receiptId: number) =>
      request<{ result: boolean }>(credentials, "deleteNotification", {
        method: "DELETE",
        pathSuffix: receiptId,
      }),
  };
}

export type GreenApi = ReturnType<typeof createGreenApi>;
