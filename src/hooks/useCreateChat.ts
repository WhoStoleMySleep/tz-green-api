import { useRef, useState } from "react";
import type { GreenApi } from "../api/greenApi";
import { useChatsStore } from "../stores/chats";
import type { ApiResult } from "../types/greenApi";
import { formatPhone, normalizePhone } from "../utils/phone";

const INVALID_PHONE_ERROR = "Введите номер в международном формате, например +7 999 123-45-67";
const NOT_IN_MAX_ERROR = "Этот номер не зарегистрирован в MAX";

async function findMaxChatId(api: GreenApi, phone: string): Promise<ApiResult<string>> {
  const result = await api.checkAccount(Number(phone));
  if (!result.ok) return result;
  if (!result.data.exist || !result.data.chatId) return { ok: false, error: NOT_IN_MAX_ERROR };
  return { ok: true, data: result.data.chatId };
}

/**
 * В MAX чат адресуется ID пользователя, а не номером. checkAccount по номеру
 * отдаёт этот ID — с ним же потом придут ответы собеседника.
 */
export function useCreateChat(api: GreenApi | null) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const openChat = useChatsStore((state) => state.openChat);

  async function createChat(input: string): Promise<boolean> {
    const phone = normalizePhone(input);
    if (!phone) {
      setError(INVALID_PHONE_ERROR);
      return false;
    }
    if (!api || inFlight.current) return false;
    inFlight.current = true;
    setPending(true);
    setError(null);
    const result = await findMaxChatId(api, phone);
    inFlight.current = false;
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    openChat({ id: result.data, title: formatPhone(phone), phone, createdAt: Date.now() });
    return true;
  }

  return { createChat, pending, error, clearError: () => setError(null) };
}
