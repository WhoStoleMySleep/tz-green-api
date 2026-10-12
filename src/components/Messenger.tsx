import { useGreenApi } from "../hooks/useGreenApi";
import { useNotifications } from "../hooks/useNotifications";
import { useSession } from "../hooks/useSession";
import { useChatsStore } from "../stores/chats";
import { ChatPane } from "./ChatPane";
import { ChatBubbleIcon } from "./icons";
import { Sidebar } from "./Sidebar";
import styles from "./Messenger.module.css";

export function Messenger() {
  const api = useGreenApi();
  const { connected } = useNotifications(api);
  const { signOut } = useSession();
  const activeChat = useChatsStore((state) =>
    state.activeChatId ? state.chats[state.activeChatId] : undefined,
  );

  return (
    <div className={styles.layout} data-chat-open={Boolean(activeChat)}>
      <Sidebar api={api} connected={connected} onSignOut={signOut} />
      {activeChat ? (
        <ChatPane api={api} chat={activeChat} />
      ) : (
        <section className={styles.placeholder}>
          <ChatBubbleIcon width={40} height={40} />
          <p>Выберите чат или создайте новый по номеру телефона</p>
        </section>
      )}
    </div>
  );
}
