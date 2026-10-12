import { useRef, useState } from "react";
import { createGreenApi } from "../api/greenApi";
import { useAuthStore } from "../stores/auth";
import { useChatsStore } from "../stores/chats";
import type { Credentials, InstanceState } from "../types/greenApi";

function describeInstanceState(state: InstanceState): string | null {
  if (state === "authorized") return null;
  return `Инстанс не авторизован в MAX (${state}). Авторизуйте его в личном кабинете GREEN-API.`;
}

/**
 * Вход проверяет данные запросом getStateInstance: неверный токен отсекается сразу,
 * а не на первой отправке. Инстанс должен быть авторизован в MAX, иначе сообщения не уйдут.
 */
export function useSession() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const login = useAuthStore((state) => state.login);
  const logoutAuth = useAuthStore((state) => state.logout);
  const resetChats = useChatsStore((state) => state.reset);

  async function signIn(credentials: Credentials): Promise<void> {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    const result = await createGreenApi(credentials).getStateInstance();
    inFlight.current = false;
    setPending(false);
    const stateError = result.ok ? describeInstanceState(result.data.stateInstance) : result.error;
    if (stateError) {
      setError(stateError);
      return;
    }
    login(credentials);
  }

  /** Чаты принадлежат инстансу, поэтому при выходе их тоже чистим. */
  function signOut(): void {
    resetChats();
    logoutAuth();
  }

  return { signIn, signOut, pending, error };
}
