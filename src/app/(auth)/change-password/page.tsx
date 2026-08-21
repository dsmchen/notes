"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const fieldErrors: typeof errors = {};
    if (!currentPassword) {
      fieldErrors.currentPassword = "Current password is required";
    }
    if (!newPassword) {
      fieldErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      fieldErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      fieldErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.email) {
      setErrors({ general: "Could not verify user" });
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.user.email,
      password: currentPassword,
    });

    if (signInError) {
      setErrors({ currentPassword: "Current password is incorrect" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setErrors({ general: error.message });
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function inputClass(field: "currentPassword" | "newPassword" | "confirmPassword") {
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
        <h1 className="text-center text-2xl font-semibold">Change password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <p className="text-sm text-red-600 dark:text-red-400" aria-live="polite">
              {errors.general}
            </p>
          )}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: undefined }));
              }}
              className={inputClass("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
            )}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              className={inputClass("newPassword")}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm new password
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
            {loading ? "Changing..." : "Change password"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          <Link
            href="/"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Back to notes
          </Link>
        </p>
      </div>
    </div>
  );
}
