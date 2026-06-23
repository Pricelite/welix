import { test, expect } from "@playwright/test";

test("weli opens and sends a message", async ({ page }) => {
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");
  await page.getByRole("button", { name: /ouvrir l'assistant weli/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText(/compagnon ia welix/i)).toBeVisible();
  await page
    .getByPlaceholder(/demande un devis, une relance, une analyse ou une aide précise/i)
    .fill("Guide-moi pas a pas");
  await page.getByRole("button", { name: /envoyer/i }).click();
  await expect(page.getByText(/Guide-moi pas a pas/i)).toBeVisible();
  await expect(page.getByText(/action proposée/i)).toBeVisible();
  await expect(page.locator(".weli-chat-message")).toHaveCount(4);
  expect(pageErrors).toEqual([]);
});
