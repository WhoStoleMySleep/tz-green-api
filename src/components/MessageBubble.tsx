import type { ChatMessage, MessageStatus } from "../types/chat";
import { formatMessageTime } from "../utils/date";
import { AlertIcon, CheckIcon, ClockIcon } from "./icons";
import styles from "./MessageBubble.module.css";

const STATUS_ICONS: Record<MessageStatus, { Icon: typeof CheckIcon; label: string }> = {
  pending: { Icon: ClockIcon, label: "Отправляется" },
  sent: { Icon: CheckIcon, label: "Отправлено" },
  failed: { Icon: AlertIcon, label: "Не отправлено" },
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const outgoing = message.direction === "outgoing";
  const status = STATUS_ICONS[message.status];

  return (
    <li className={styles.row} data-direction={message.direction}>
      <div className={styles.bubble} data-status={message.status}>
        <p className={styles.text}>{message.text}</p>
        <span className={styles.meta}>
          <time>{formatMessageTime(message.timestamp)}</time>
          {outgoing && (
            <span className={styles.status} role="img" aria-label={status.label}>
              <status.Icon width={14} height={14} />
            </span>
          )}
        </span>
      </div>
    </li>
  );
}
