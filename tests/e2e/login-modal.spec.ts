import { expect, test } from "@playwright/test";

test("opens the login modal from the landing header", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Connexion" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  await expect(page.getByLabel("Email professionnel")).toBeVisible();
});
