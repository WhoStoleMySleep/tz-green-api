import type { GreenApi } from "../api/greenApi";
import { useSendMessage } from "../hooks/useSendMessage";
import { useChatsStore } from "../stores/chats";
import type { Chat, ChatMessage } from "../types/chat";
import { Avatar } from "./Avatar";
import { Composer } from "./Composer";
import { BackIcon } from "./icons";
import { MessageList } from "./MessageList";
import styles from "./ChatPane.module.css";

const NO_MESSAGES: ChatMessage[] = [];

interface ChatPaneProps {
  api: GreenApi | null;
  chat: Chat;
}

export function ChatPane({ api, chat }: ChatPaneProps) {
  const messages = useChatsStore((state) => state.messages[chat.id] ?? NO_MESSAGES);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const { sendMessage } = useSendMessage(api);

  return (
    <section className={styles.pane}>
      <header className={styles.header}>
        <button
          className={styles.back}
          onClick={() => setActiveChat(null)}
          aria-label="К списку чатов"
        >
          <BackIcon />
        </button>
        <Avatar id={chat.id} title={chat.title} size={40} />
        <div className={styles.titles}>
          <h2 className={styles.title}>{chat.title}</h2>
          <span className={styles.subtitle}>MAX</span>
        </div>
      </header>
      <MessageList messages={messages} />
      <Composer key={chat.id} onSend={(text) => void sendMessage(chat.id, text)} />
    </section>
  );
}
