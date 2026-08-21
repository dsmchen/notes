import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/utils/supabase/proxy", () => ({
  updateSession: vi.fn(),
}));

import { proxy } from "@/proxy";
import { updateSession } from "@/utils/supabase/proxy";

function makeRequest(pathname: string) {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`));
}

type MockSessionResult = {
  supabaseResponse: NextResponse;
  claims: Record<string, string> | null;
};

function mockSession(overrides: Partial<MockSessionResult> = {}) {
  const supabaseResponse = NextResponse.next();
  vi.mocked(updateSession).mockResolvedValue({
    supabaseResponse,
    claims: null,
    ...overrides,
  } as Awaited<ReturnType<typeof updateSession>>);
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects authenticated user away from /login to /", async () => {
    mockSession({ claims: { sub: "user-1" } });

    const response = await proxy(makeRequest("/login"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects authenticated user away from /signup to /", async () => {
    mockSession({ claims: { sub: "user-1" } });

    const response = await proxy(makeRequest("/signup"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects authenticated user away from /forgot-password to /", async () => {
    mockSession({ claims: { sub: "user-1" } });

    const response = await proxy(makeRequest("/forgot-password"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects unauthenticated user from protected page to /login", async () => {
    mockSession();

    const response = await proxy(makeRequest("/notes"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows unauthenticated user to access /login", async () => {
    mockSession();

    const response = await proxy(makeRequest("/login"));
    expect(response.status).toBe(200);
  });

  it("allows unauthenticated user to access /update-password (public page)", async () => {
    mockSession();

    const response = await proxy(makeRequest("/update-password"));
    expect(response.status).toBe(200);
  });

  it("allows authenticated user to access /update-password", async () => {
    mockSession({ claims: { sub: "user-1" } });

    const response = await proxy(makeRequest("/update-password"));
    expect(response.status).toBe(200);
  });

  it("passes through when updateSession throws", async () => {
    vi.mocked(updateSession).mockRejectedValue(new Error("fail"));

    const response = await proxy(makeRequest("/notes"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("copies cookies from supabaseResponse to redirect response", async () => {
    vi.mocked(updateSession).mockResolvedValue({
      supabaseResponse: (() => {
        const res = NextResponse.next();
        res.cookies.set("sb-token", "abc123");
        return res;
      })(),
      claims: null,
    } as Awaited<ReturnType<typeof updateSession>>);

    const response = await proxy(makeRequest("/notes"));
    const cookies = response.cookies.getAll();
    expect(cookies).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "sb-token", value: "abc123" })]),
    );
  });
});
