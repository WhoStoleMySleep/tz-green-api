import { useState, type FormEvent } from "react";
import type { GreenApi } from "../api/greenApi";
import { useCreateChat } from "../hooks/useCreateChat";
import { CloseIcon } from "./icons";
import styles from "./NewChatForm.module.css";

interface NewChatFormProps {
  api: GreenApi | null;
  onClose: () => void;
}

export function NewChatForm({ api, onClose }: NewChatFormProps) {
  const { createChat, pending, error } = useCreateChat(api);
  const [phone, setPhone] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await createChat(phone);
    if (created) onClose();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <span>Новый чат</span>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
          <CloseIcon width={18} height={18} />
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="+7 999 123-45-67"
          aria-label="Номер телефона получателя"
          autoFocus
        />
        <button className={styles.submit} type="submit" disabled={pending || !phone.trim()}>
          {pending ? "…" : "Создать"}
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
