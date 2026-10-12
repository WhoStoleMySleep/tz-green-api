/** Градиенты аватаров как в MAX: цвет закреплён за чатом, а не случаен на каждый рендер. */
export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #ff8a5c, #ff4f7b)",
  "linear-gradient(135deg, #7b6cff, #4f8bff)",
  "linear-gradient(135deg, #36d1a6, #20a3d8)",
  "linear-gradient(135deg, #ffbe3d, #ff7a2f)",
  "linear-gradient(135deg, #c86bff, #7d5cff)",
  "linear-gradient(135deg, #4fc3ff, #2f7bff)",
];

/** Первая буква имени для аватара; у номера — первая цифра после «+». */
export function getInitial(title: string): string {
  const letter = title.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0);
  return letter ? letter.toUpperCase() : "?";
}

export function getAvatarGradient(id: string): string {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}
