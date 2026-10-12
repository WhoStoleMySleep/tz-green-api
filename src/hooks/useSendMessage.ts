import type { GreenApi } from "../api/greenApi";
import { useChatsStore } from "../stores/chats";
import type { ChatMessage } from "../types/chat";

/**
 * Сообщение сразу появляется в чате со статусом pending, а после ответа API
 * получает настоящий idMessage — по нему потом отсеивается дубль из уведомления.
 */
export function useSendMessage(api: GreenApi | null) {
  const addPendingMessage = useChatsStore((state) => state.addPendingMessage);
  const confirmMessage = useChatsStore((state) => state.confirmMessage);
  const failMessage = useChatsStore((state) => state.failMessage);

  async function sendMessage(chatId: string, text: string): Promise<void> {
    const message = text.trim();
    if (!api || !message) return;
    const pending: ChatMessage = {
      id: `pending-${crypto.randomUUID()}`,
      chatId,
      text: message,
      direction: "outgoing",
      timestamp: Date.now(),
      status: "pending",
    };
    addPendingMessage(pending);
    const result = await api.sendMessage(chatId, message);
    if (!result.ok) return failMessage(pending);
    confirmMessage(pending, result.data.idMessage);
  }

  return { sendMessage };
}
