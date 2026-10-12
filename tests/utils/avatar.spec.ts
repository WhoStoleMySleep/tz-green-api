import { describe, expect, test } from "vitest";

describe("getInitial", () => {
  test("берёт первую букву имени в верхнем регистре", async () => {
    const { getInitial } = await import("../../src/utils/avatar");
    expect(getInitial("анна")).toBe("А");
  });

  test("у номера пропускает плюс и берёт цифру", async () => {
    const { getInitial } = await import("../../src/utils/avatar");
    expect(getInitial("+7 999 123-45-67")).toBe("7");
  });

  test("для пустой строки возвращает заглушку", async () => {
    const { getInitial } = await import("../../src/utils/avatar");
    expect(getInitial("")).toBe("?");
  });
});

describe("getAvatarGradient", () => {
  test("один и тот же чат всегда получает один цвет из палитры", async () => {
    const { AVATAR_GRADIENTS, getAvatarGradient } = await import("../../src/utils/avatar");
    const gradient = getAvatarGradient("10000000");
    expect(getAvatarGradient("10000000")).toBe(gradient);
    expect(AVATAR_GRADIENTS).toContain(gradient);
  });

  test("не падает на пустом id", async () => {
    const { AVATAR_GRADIENTS, getAvatarGradient } = await import("../../src/utils/avatar");
    expect(getAvatarGradient("")).toBe(AVATAR_GRADIENTS[0]);
  });
});
