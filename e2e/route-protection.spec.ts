import { test, expect } from "@playwright/test";
import { signup, uniqueEmail } from "./helpers";

test.describe("Route protection", () => {
  test("unauthenticated user is redirected to /login from protected page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("unauthenticated user can access /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("unauthenticated user can access /signup", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveURL("/signup");
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("unauthenticated user can access /forgot-password", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page).toHaveURL("/forgot-password");
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  });

  test("authenticated user is redirected from /login to /", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);

    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("authenticated user is redirected from /signup to /", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);

    await page.goto("/signup");
    await expect(page).toHaveURL("/");
  });

  test("authenticated user is redirected from /forgot-password to /", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);

    await page.goto("/forgot-password");
    await expect(page).toHaveURL("/");
  });
});
