import { useEffect, useState } from "react";
import type { GreenApi } from "../api/greenApi";
import { pollNotifications } from "../services/notificationPoller";
import { useChatsStore } from "../stores/chats";
import { notificationChatTitle, notificationToMessage } from "../utils/notification";
import type { NotificationBody } from "../types/greenApi";

/** Слушает входящие уведомления, пока жив компонент. Смена инстанса перезапускает цикл. */
export function useNotifications(api: GreenApi | null): { connected: boolean } {
  const [connected, setConnected] = useState(true);
  const receiveMessage = useChatsStore((state) => state.receiveMessage);

  useEffect(() => {
    if (!api) return;
    const controller = new AbortController();
    const onNotification = (body: NotificationBody) => {
      const message = notificationToMessage(body);
      if (message) receiveMessage(message, notificationChatTitle(body));
    };
    void pollNotifications(api, controller.signal, {
      onNotification,
      onConnectionChange: setConnected,
    });
    return () => controller.abort();
  }, [api, receiveMessage]);

  return { connected };
}
