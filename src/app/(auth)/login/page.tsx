"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth-form";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    router.push("/");
    router.refresh();
  }

  return (
    <AuthForm
      title="Sign in"
      submitLabel="Sign in"
      submitLoadingLabel="Signing in..."
      onSubmit={handleLogin}
      footer={
        <div className="space-y-2 text-center text-sm text-zinc-500">
          <p>
            <a
              href="/forgot-password"
              className="font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              Forgot your password?
            </a>
          </p>
          <p>
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              Sign up
            </a>
          </p>
        </div>
      }
    />
  );
}
