import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

describe("Composer", () => {
  test("Enter отправляет текст и очищает поле", async () => {
    const { Composer } = await import("../../src/components/Composer");
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    const input = screen.getByLabelText("Текст сообщения");
    await userEvent.type(input, "Привет{Enter}");
    expect(onSend).toHaveBeenCalledWith("Привет");
    expect(input).toHaveValue("");
  });

  test("Shift+Enter переносит строку, а не отправляет", async () => {
    const { Composer } = await import("../../src/components/Composer");
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    await userEvent.type(screen.getByLabelText("Текст сообщения"), "a{Shift>}{Enter}{/Shift}b");
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Текст сообщения")).toHaveValue("a\nb");
  });

  test("пробелы не отправляются, кнопка неактивна", async () => {
    const { Composer } = await import("../../src/components/Composer");
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    await userEvent.type(screen.getByLabelText("Текст сообщения"), "   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
  });
});
