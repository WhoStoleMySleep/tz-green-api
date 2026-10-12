import { expect, test } from "vitest";

const credentials = {
  apiUrl: "https://api.green-api.com/v3",
  idInstance: "1",
  apiTokenInstance: "t",
};

test("login сохраняет учётные данные в localStorage, logout удаляет", async () => {
  const { useAuthStore } = await import("../../src/stores/auth");
  useAuthStore.getState().login(credentials);
  expect(useAuthStore.getState().credentials).toEqual(credentials);
  expect(localStorage.getItem("green-max-auth")).toContain('"idInstance":"1"');
  useAuthStore.getState().logout();
  expect(useAuthStore.getState().credentials).toBeNull();
});
