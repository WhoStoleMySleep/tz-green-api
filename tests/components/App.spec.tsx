import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

const reply = {
  receiptId: 9,
  body: {
    typeWebhook: "incomingMessageReceived",
    timestamp: Math.floor(Date.now() / 1000),
    idMessage: "reply-1",
    senderData: { chatId: "10000000", sender: "10000000", senderName: "Анна" },
    messageData: { typeMessage: "textMessage", textMessageData: { textMessage: "Привет из MAX!" } },
  },
};

function json(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

/** Эмулирует GREEN-API: ответ получателя появляется в очереди только после нашей отправки. */
function mockGreenApi() {
  let replyQueued = false;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes("/getStateInstance/")) return json({ stateInstance: "authorized" });
    if (url.includes("/checkAccount/")) return json({ exist: true, chatId: "10000000" });
    if (url.includes("/sendMessage/")) {
      replyQueued = true;
      return json({ idMessage: "out-1" });
    }
    if (url.includes("/deleteNotification/")) return json({ result: true });
    if (replyQueued) {
      replyQueued = false;
      return json(reply);
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
    return json(null);
  });
}

test("сценарий из задания: вход, новый чат по номеру, отправка и ответ получателя", async () => {
  mockGreenApi();
  const { default: App } = await import("../../src/App");
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByLabelText("idInstance"), "3100000001");
  await user.type(screen.getByLabelText("apiTokenInstance"), "token");
  await user.click(screen.getByRole("button", { name: "Войти" }));

  await user.click(await screen.findByRole("button", { name: "Новый чат" }));
  await user.type(screen.getByLabelText("Номер телефона получателя"), "+7 999 123-45-67");
  await user.click(screen.getByRole("button", { name: "Создать" }));

  await user.type(await screen.findByLabelText("Текст сообщения"), "Здравствуйте!{Enter}");
  expect(await screen.findByText("Здравствуйте!")).toBeInTheDocument();
  await waitFor(() => expect(screen.getAllByText("Привет из MAX!").length).toBeGreaterThan(0));
});
