import { test, expect } from "@playwright/test";

test("weli opens and sends a message", async ({ page }) => {
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");
  await page.getByRole("button", { name: /ouvrir l'assistant weli/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByPlaceholder(/pose une question/i).fill("Guide-moi pas a pas");
  await page.getByRole("button", { name: /envoyer/i }).click();
  await expect(page.getByText(/Guide-moi pas a pas/i)).toBeVisible();
  await expect(page.locator(".weli-chat-message")).toHaveCount(3);
  expect(pageErrors).toEqual([]);
});
