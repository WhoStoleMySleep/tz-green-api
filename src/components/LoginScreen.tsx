import { useState, type FormEvent } from "react";
import { DEFAULT_API_URL } from "../api/greenApi";
import { useSession } from "../hooks/useSession";
import { ChatBubbleIcon } from "./icons";
import styles from "./LoginScreen.module.css";

const CONSOLE_URL = "https://console.green-api.com/";

export function LoginScreen() {
  const { signIn, pending, error } = useSession();
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const canSubmit = Boolean(idInstance.trim() && apiTokenInstance.trim() && apiUrl.trim());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    void signIn({
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim(),
    });
  }

  return (
    <main className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <span className={styles.logo}>
          <ChatBubbleIcon width={30} height={30} />
        </span>
        <h1 className={styles.title}>Вход в чат MAX</h1>
        <p className={styles.subtitle}>
          Данные инстанса из{" "}
          <a href={CONSOLE_URL} target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>

        <label className={styles.field}>
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            inputMode="numeric"
            placeholder="3100000000"
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span>apiTokenInstance</span>
          <input
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            type="password"
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd4123"
            autoComplete="current-password"
          />
        </label>
        <details className={styles.advanced}>
          <summary>apiUrl</summary>
          <label className={styles.field}>
            <span>apiUrl из личного кабинета</span>
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} type="url" />
          </label>
        </details>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.submit} type="submit" disabled={!canSubmit || pending}>
          {pending ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
