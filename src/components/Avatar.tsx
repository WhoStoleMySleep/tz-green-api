import { getAvatarGradient, getInitial } from "../utils/avatar";
import styles from "./Avatar.module.css";

interface AvatarProps {
  id: string;
  title: string;
  size?: number;
}

export function Avatar({ id, title, size = 48 }: AvatarProps) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.4, background: getAvatarGradient(id) }}
      aria-hidden="true"
    >
      {getInitial(title)}
    </span>
  );
}
