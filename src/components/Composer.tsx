import { useState, type FormEvent, type KeyboardEvent } from "react";
import { SendIcon } from "./icons";
import styles from "./Composer.module.css";

interface ComposerProps {
  onSend: (text: string) => void;
}

/** Enter отправляет, Shift+Enter переносит строку — как в web.max.ru. */
export function Composer({ onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0;

  function submit() {
    if (!canSend) return;
    onSend(text);
    setText("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение"
        rows={1}
        aria-label="Текст сообщения"
        autoFocus
      />
      <button className={styles.send} type="submit" disabled={!canSend} aria-label="Отправить">
        <SendIcon width={20} height={20} />
      </button>
    </form>
  );
}
