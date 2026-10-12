import { useMemo } from "react";
import { createGreenApi, type GreenApi } from "../api/greenApi";
import { useAuthStore } from "../stores/auth";

/** Клиент текущего инстанса; null, пока пользователь не вошёл. */
export function useGreenApi(): GreenApi | null {
  const credentials = useAuthStore((state) => state.credentials);
  return useMemo(() => (credentials ? createGreenApi(credentials) : null), [credentials]);
}
