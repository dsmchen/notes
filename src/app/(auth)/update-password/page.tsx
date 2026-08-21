"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const fieldErrors: typeof errors = {};
    if (!password) {
      fieldErrors.password = "Password is required";
    } else if (password.length < 6) {
      fieldErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      fieldErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrors({ general: error.message });
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function inputClass(field: "password" | "confirmPassword") {
    const hasError = errors[field];
    return `mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
      hasError
        ? "border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400"
        : "border-zinc-300 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
    }`;
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold">Update your password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <p className="text-sm text-red-600 dark:text-red-400" aria-live="polite">
              {errors.general}
            </p>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={inputClass("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              className={inputClass("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
