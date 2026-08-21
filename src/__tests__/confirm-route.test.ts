import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { GET } from "@/app/auth/confirm/route";
import { createClient } from "@/utils/supabase/server";

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost:3000/auth/confirm");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

function mockSupabase(overrides: Record<string, unknown>) {
  return overrides as unknown as SupabaseClient;
}

describe("/auth/confirm GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to next path on successful verification", async () => {
    const mockVerifyOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase({ auth: { verifyOtp: mockVerifyOtp } }),
    );

    const request = makeRequest({
      token_hash: "abc123",
      type: "email",
      next: "/update-password",
    });

    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/update-password");
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "email",
      token_hash: "abc123",
    });
  });

  it("redirects to / on successful verification when no next param", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase({ auth: { verifyOtp: vi.fn().mockResolvedValue({ error: null }) } }),
    );

    const request = makeRequest({ token_hash: "abc123", type: "recovery" });
    const response = await GET(request);
    expect(response.headers.get("location")).toContain("/");
  });

  it("redirects to /login?error=auth when verification fails", async () => {
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase({ auth: { verifyOtp: vi.fn().mockResolvedValue({ error: "Invalid token" }) } }),
    );

    const request = makeRequest({
      token_hash: "bad-token",
      type: "email",
      next: "/",
    });
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?error=auth");
  });

  it("redirects to /login?error=auth when token_hash is missing", async () => {
    const request = makeRequest({ type: "email" });
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?error=auth");
  });

  it("redirects to /login?error=auth when type is missing", async () => {
    const request = makeRequest({ token_hash: "abc123" });
    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?error=auth");
  });

  it("handles recovery type for password reset", async () => {
    const mockVerifyOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase({ auth: { verifyOtp: mockVerifyOtp } }),
    );

    const request = makeRequest({
      token_hash: "reset-token",
      type: "recovery",
      next: "/update-password",
    });

    const response = await GET(request);
    expect(response.status).toBe(307);
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "recovery",
      token_hash: "reset-token",
    });
  });
});
