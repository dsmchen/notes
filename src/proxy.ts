import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  let supabaseResponse: NextResponse;
  let claims = null;
  try {
    const result = await updateSession(request);
    supabaseResponse = result.supabaseResponse;
    claims = result.claims;
  } catch {
    supabaseResponse = NextResponse.next({ request });
  }
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");
  const isPublicPage = pathname.startsWith("/update-password");

  if (claims && isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    supabaseResponse.cookies.getAll().forEach((c) =>
      redirectResponse.cookies.set(c.name, c.value, c),
    );
    return redirectResponse;
  }

  if (!claims && !isAuthPage && !isPublicPage) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    supabaseResponse.cookies.getAll().forEach((c) =>
      redirectResponse.cookies.set(c.name, c.value, c),
    );
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
