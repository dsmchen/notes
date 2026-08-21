import { type Page, expect, APIRequestContext } from "@playwright/test";

const TEST_PASSWORD = "test-password-123";

export function uniqueEmail(): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `e2e-${ts}-${rand}@example.com`;
}

export async function signup(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
}

export async function login(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
}

export async function logout(page: Page) {
  await page.getByLabel("User menu").click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");
}

export async function generateRecoveryToken(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/generate_link`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        type: "recovery",
        redirect_to: "http://localhost:3000/update-password",
      }),
    },
  );

  const status = response.status;
  const text = await response.text();

  if (status !== 200) {
    throw new Error(`generate_link returned ${status}: ${text.slice(0, 200)}`);
  }

  const body = JSON.parse(text);

  if (!body.hashed_token) {
    throw new Error(`No hashed_token in response`);
  }

  return body.hashed_token;
}

export async function verifyRecoveryAndGetSession(
  request: APIRequestContext,
  tokenHash: string,
): Promise<{ access_token: string; refresh_token: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = await fetch(
    `${supabaseUrl}/auth/v1/verify`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        type: "recovery",
      }),
    },
  );

  const status = response.status;
  const text = await response.text();

  if (status !== 200) {
    throw new Error(`verify returned ${status}: ${text.slice(0, 200)}`);
  }

  const body = JSON.parse(text);
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  };
}
