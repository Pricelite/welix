import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /essayer gratuitement/i }).first()).toBeVisible();
});

test("protected dashboard requires authentication", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
});
