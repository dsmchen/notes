import { test, expect } from "@playwright/test";
import {
  signup,
  logout,
  login,
  uniqueEmail,
  generateRecoveryToken,
  verifyRecoveryAndGetSession,
} from "./helpers";

test.describe("Forgot password flow", () => {
  test("form shows validation error for empty email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
  });

  test("form shows 'Check your email' after submission", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(uniqueEmail());
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByText("Check your email")).toBeVisible();
    await expect(page.getByText("We sent a password reset link")).toBeVisible();
  });

  test("full recovery flow: reset password via token and sign in", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail();
    const newPassword = "new-password-456";

    await signup(page, email);
    await logout(page);

    const hashedToken = await generateRecoveryToken(request, email);
    const session = await verifyRecoveryAndGetSession(request, hashedToken);

    await page.goto("/update-password");

    await page.evaluate(
      async ({ accessToken, refreshToken, url, key }) => {
        const { createBrowserClient } = await import(
          "https://esm.sh/@supabase/ssr@0.12.0"
        );
        const supabase = createBrowserClient(url, key);
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw new Error(`setSession failed: ${error.message}`);
      },
      {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    );

    await page.getByLabel("New password").fill(newPassword);
    await page.getByLabel("Confirm password").fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page).toHaveURL("/", { timeout: 10000 });

    await logout(page);
    await login(page, email, newPassword);

    await expect(page.locator("h1")).toHaveText("Notes");
  });
});
