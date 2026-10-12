import { describe, expect, test } from "vitest";

describe("normalizePhone", () => {
  test("убирает форматирование и плюс", async () => {
    const { normalizePhone } = await import("../../src/utils/phone");
    expect(normalizePhone("+7 (999) 123-45-67")).toBe("79991234567");
  });

  test("заменяет российскую восьмёрку на семёрку", async () => {
    const { normalizePhone } = await import("../../src/utils/phone");
    expect(normalizePhone("8 999 123 45 67")).toBe("79991234567");
  });

  test("не трогает иностранный номер на 11 цифр, начинающийся не с 8", async () => {
    const { normalizePhone } = await import("../../src/utils/phone");
    expect(normalizePhone("+1 202 555 0143")).toBe("12025550143");
  });

  test("принимает номер ровно на границах длины", async () => {
    const { normalizePhone } = await import("../../src/utils/phone");
    expect(normalizePhone("1234567890")).toBe("1234567890");
    expect(normalizePhone("123456789012345")).toBe("123456789012345");
  });

  test("отклоняет слишком короткий, слишком длинный и пустой ввод", async () => {
    const { normalizePhone } = await import("../../src/utils/phone");
    expect(normalizePhone("123456789")).toBeNull();
    expect(normalizePhone("1234567890123456")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("телефон")).toBeNull();
  });
});

describe("formatPhone", () => {
  test("форматирует российский номер", async () => {
    const { formatPhone } = await import("../../src/utils/phone");
    expect(formatPhone("79991234567")).toBe("+7 999 123-45-67");
  });

  test("иностранный номер оставляет цифрами с плюсом", async () => {
    const { formatPhone } = await import("../../src/utils/phone");
    expect(formatPhone("12025550143")).toBe("+12025550143");
  });
});
