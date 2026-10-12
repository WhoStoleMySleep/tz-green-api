import {
  ABORTED_ERROR,
  type GreenApi,
  RECEIVE_TIMEOUT_SEC,
  RECOVERY_TIMEOUT_SEC,
} from "../api/greenApi";
import type { NotificationBody } from "../types/greenApi";

/** Пауза после ошибки, чтобы при упавшей сети не долбить API без остановки. */
export const RETRY_DELAY_MS = 3000;

export interface PollerHandlers {
  onNotification: (body: NotificationBody) => void;
  onConnectionChange: (connected: boolean) => void;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Читает очередь уведомлений по HTTP API: receiveNotification → обработка → deleteNotification.
 * Уведомление удаляется после обработки, иначе следующий запрос вернёт его снова.
 * Цикл один на инстанс и завершается только через signal.
 * Пока связь не подтверждена, long-poll короткий: с полным таймаутом плашка «нет связи»
 * висела бы до 20 секунд после того, как сеть уже вернулась.
 */
export async function pollNotifications(
  api: GreenApi,
  signal: AbortSignal,
  handlers: PollerHandlers,
): Promise<void> {
  let connected = true;
  while (!signal.aborted) {
    const timeoutSec = connected ? RECEIVE_TIMEOUT_SEC : RECOVERY_TIMEOUT_SEC;
    const result = await api.receiveNotification(signal, timeoutSec);
    if (!result.ok && result.error === ABORTED_ERROR) return;
    connected = result.ok;
    handlers.onConnectionChange(connected);
    if (!result.ok) {
      await sleep(RETRY_DELAY_MS, signal);
      continue;
    }
    if (!result.data) continue;
    handlers.onNotification(result.data.body);
    await api.deleteNotification(result.data.receiptId);
  }
}
