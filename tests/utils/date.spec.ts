import { expect, test } from "vitest";

test("formatMessageTime выводит часы и минуты", async () => {
  const { formatMessageTime } = await import("../../src/utils/date");
  const timestamp = new Date(2026, 9, 12, 9, 5).getTime();
  expect(formatMessageTime(timestamp)).toBe("09:05");
});
