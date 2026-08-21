import { test, expect } from "@playwright/test";
import { signup, login, logout, uniqueEmail } from "./helpers";

test.describe("Signup flow", () => {
  test("new user can sign up and lands on home page", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);

    await expect(page.locator("h1")).toHaveText("Notes");
    await expect(page.getByText("Select a note or create a new one")).toBeVisible();
  });

  test("signup shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("signup shows validation error for short password", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(uniqueEmail());
    await page.getByLabel("Password").fill("12345");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });
});

test.describe("Login flow", () => {
  test("user can log in with valid credentials", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);
    await logout(page);
    await login(page, email);

    await expect(page.locator("h1")).toHaveText("Notes");
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid login credentials")).toBeVisible();
  });

  test("login shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });
});

test.describe("Logout flow", () => {
  test("user can log out and is redirected to login", async ({ page }) => {
    const email = uniqueEmail();
    await signup(page, email);
    await logout(page);

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
