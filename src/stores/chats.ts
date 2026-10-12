import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat, ChatMessage } from "../types/chat";

type MessagesByChat = Record<string, ChatMessage[]>;

interface ChatsState {
  chats: Record<string, Chat>;
  messages: MessagesByChat;
  activeChatId: string | null;
  openChat: (chat: Chat) => void;
  setActiveChat: (chatId: string | null) => void;
  receiveMessage: (message: ChatMessage, title: string) => void;
  addPendingMessage: (message: ChatMessage) => void;
  confirmMessage: (pending: ChatMessage, idMessage: string) => void;
  failMessage: (pending: ChatMessage) => void;
  reset: () => void;
}

const initialState = { chats: {}, messages: {}, activeChatId: null };

/** Одно и то же сообщение приходит дважды: ответом sendMessage и уведомлением outgoingAPIMessageReceived. */
function appendUnique(messages: MessagesByChat, message: ChatMessage): MessagesByChat {
  const list = messages[message.chatId] ?? [];
  if (list.some((item) => item.id === message.id)) return messages;
  return { ...messages, [message.chatId]: [...list, message] };
}

function replaceMessage(
  messages: MessagesByChat,
  pending: ChatMessage,
  next: ChatMessage | null,
): MessagesByChat {
  const list = messages[pending.chatId] ?? [];
  const updated = list.flatMap((item) => (item.id === pending.id ? (next ? [next] : []) : [item]));
  return { ...messages, [pending.chatId]: updated };
}

function hasMessage(messages: MessagesByChat, chatId: string, id: string): boolean {
  return (messages[chatId] ?? []).some((item) => item.id === id);
}

export const useChatsStore = create<ChatsState>()(
  persist(
    (set) => ({
      ...initialState,

      openChat: (chat) =>
        set((state) => ({
          chats: state.chats[chat.id] ? state.chats : { ...state.chats, [chat.id]: chat },
          activeChatId: chat.id,
        })),

      setActiveChat: (activeChatId) => set({ activeChatId }),

      /** Ответ от незнакомого собеседника создаёт чат сам — иначе сообщение просто потерялось бы. */
      receiveMessage: (message, title) =>
        set((state) => ({
          chats: state.chats[message.chatId]
            ? state.chats
            : {
                ...state.chats,
                [message.chatId]: { id: message.chatId, title, createdAt: message.timestamp },
              },
          messages: appendUnique(state.messages, message),
        })),

      addPendingMessage: (message) =>
        set((state) => ({ messages: appendUnique(state.messages, message) })),

      /** Если уведомление обогнало ответ sendMessage, настоящее сообщение уже в списке — черновик просто убираем. */
      confirmMessage: (pending, idMessage) =>
        set((state) => {
          const duplicate = hasMessage(state.messages, pending.chatId, idMessage);
          const confirmed = duplicate
            ? null
            : { ...pending, id: idMessage, status: "sent" as const };
          return { messages: replaceMessage(state.messages, pending, confirmed) };
        }),

      failMessage: (pending) =>
        set((state) => ({
          messages: replaceMessage(state.messages, pending, { ...pending, status: "failed" }),
        })),

      reset: () => set(initialState),
    }),
    { name: "green-max-chats" },
  ),
);

/** Чаты по времени последнего сообщения, как в списке MAX: свежие сверху. */
export function selectSortedChats(state: Pick<ChatsState, "chats" | "messages">): Chat[] {
  const lastActivity = (chat: Chat) => state.messages[chat.id]?.at(-1)?.timestamp ?? chat.createdAt;
  return Object.values(state.chats).sort((a, b) => lastActivity(b) - lastActivity(a));
}
