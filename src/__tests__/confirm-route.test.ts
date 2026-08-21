import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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

type MockSupabaseClient = {
  auth: { verifyOtp: ReturnType<typeof vi.fn> };
};

describe("/auth/confirm GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to next path on successful verification", async () => {
    const mockVerifyOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockResolvedValue({
      auth: { verifyOtp: mockVerifyOtp },
    } as MockSupabaseClient);

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
    vi.mocked(createClient).mockResolvedValue({
      auth: { verifyOtp: vi.fn().mockResolvedValue({ error: null }) },
    } as MockSupabaseClient);

    const request = makeRequest({ token_hash: "abc123", type: "recovery" });
    const response = await GET(request);
    expect(response.headers.get("location")).toContain("/");
  });

  it("redirects to /login?error=auth when verification fails", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { verifyOtp: vi.fn().mockResolvedValue({ error: "Invalid token" }) },
    } as MockSupabaseClient);

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
    vi.mocked(createClient).mockResolvedValue({
      auth: { verifyOtp: mockVerifyOtp },
    } as MockSupabaseClient);

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
