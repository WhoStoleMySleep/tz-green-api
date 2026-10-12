import { useMemo, useState } from "react";
import type { GreenApi } from "../api/greenApi";
import { selectSortedChats, useChatsStore } from "../stores/chats";
import { ChatListItem } from "./ChatListItem";
import { ComposeIcon, LogoutIcon } from "./icons";
import { NewChatForm } from "./NewChatForm";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  api: GreenApi | null;
  connected: boolean;
  onSignOut: () => void;
}

export function Sidebar({ api, connected, onSignOut }: SidebarProps) {
  const [creating, setCreating] = useState(false);
  const chats = useChatsStore((state) => state.chats);
  const messages = useChatsStore((state) => state.messages);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const sortedChats = useMemo(() => selectSortedChats({ chats, messages }), [chats, messages]);

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>
        <button
          className={styles.iconButton}
          onClick={() => setCreating(true)}
          aria-label="Новый чат"
          title="Новый чат"
        >
          <ComposeIcon width={20} height={20} />
        </button>
        <button className={styles.iconButton} onClick={onSignOut} aria-label="Выйти" title="Выйти">
          <LogoutIcon width={20} height={20} />
        </button>
      </header>

      {!connected && <p className={styles.offline}>Нет связи с GREEN-API, переподключаемся…</p>}
      {creating && <NewChatForm api={api} onClose={() => setCreating(false)} />}

      {sortedChats.length > 0 ? (
        <ul className={styles.list}>
          {sortedChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              lastMessage={messages[chat.id]?.at(-1)}
              active={chat.id === activeChatId}
              onSelect={setActiveChat}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>Чатов пока нет. Нажмите ✎ и введите номер получателя.</p>
      )}
    </aside>
  );
}
