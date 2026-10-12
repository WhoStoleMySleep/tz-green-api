import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/chat";
import { MessageBubble } from "./MessageBubble";
import styles from "./MessageList.module.css";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  return (
    <div className={styles.scroller} ref={listRef}>
      {messages.length === 0 ? (
        <p className={styles.empty}>Напишите первое сообщение</p>
      ) : (
        <ul className={styles.list} aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ul>
      )}
    </div>
  );
}
