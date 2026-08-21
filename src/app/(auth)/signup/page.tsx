"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth-form";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    router.push("/");
    router.refresh();
  }

  return (
    <AuthForm
      title="Sign up"
      submitLabel="Create account"
      submitLoadingLabel="Creating account..."
      onSubmit={handleSignup}
      minPasswordLength={6}
      footer={
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Sign in
          </a>
        </p>
      }
    />
  );
}
