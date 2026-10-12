import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import type { ChatMessage } from "../../src/types/chat";

const base: ChatMessage = {
  id: "1",
  chatId: "c",
  text: "Привет",
  direction: "outgoing",
  timestamp: 0,
  status: "sent",
};

test("исходящее сообщение показывает статус, входящее — нет", async () => {
  const { MessageBubble } = await import("../../src/components/MessageBubble");
  const { rerender } = render(
    <ul>
      <MessageBubble message={{ ...base, status: "failed" }} />
    </ul>,
  );
  expect(screen.getByRole("img", { name: "Не отправлено" })).toBeInTheDocument();
  rerender(
    <ul>
      <MessageBubble message={{ ...base, direction: "incoming" }} />
    </ul>,
  );
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText("Привет")).toBeInTheDocument();
});
