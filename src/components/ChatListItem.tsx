import type { Chat, ChatMessage } from "../types/chat";
import { formatMessageTime } from "../utils/date";
import { Avatar } from "./Avatar";
import styles from "./ChatListItem.module.css";

interface ChatListItemProps {
  chat: Chat;
  lastMessage?: ChatMessage;
  active: boolean;
  onSelect: (chatId: string) => void;
}

export function ChatListItem({ chat, lastMessage, active, onSelect }: ChatListItemProps) {
  const preview = lastMessage
    ? `${lastMessage.direction === "outgoing" ? "Вы: " : ""}${lastMessage.text}`
    : "Нет сообщений";

  return (
    <li>
      <button className={styles.item} data-active={active} onClick={() => onSelect(chat.id)}>
        <Avatar id={chat.id} title={chat.title} />
        <span className={styles.body}>
          <span className={styles.top}>
            <span className={styles.title}>{chat.title}</span>
            {lastMessage && (
              <time className={styles.time}>{formatMessageTime(lastMessage.timestamp)}</time>
            )}
          </span>
          <span className={styles.preview}>{preview}</span>
        </span>
      </button>
    </li>
  );
}
