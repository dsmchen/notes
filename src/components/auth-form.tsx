"use client";

import { type ReactNode, useState } from "react";

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface AuthFormProps {
  title: string;
  submitLabel: string;
  submitLoadingLabel: string;
  onSubmit: (email: string, password: string) => Promise<{ error?: string } | undefined>;
  footer: ReactNode;
  minPasswordLength?: number;
}

export default function AuthForm({
  title,
  submitLabel,
  submitLoadingLabel,
  onSubmit,
  footer,
  minPasswordLength,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function clearFieldError(field: keyof FieldErrors) {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function inputClass(field: "email" | "password") {
    const hasError = errors[field];
    return `mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
      hasError
        ? "border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400"
        : "border-zinc-300 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
    }`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const fieldErrors: FieldErrors = {};
    if (!email) {
      fieldErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Invalid email format";
    }
    if (!password) {
      fieldErrors.password = "Password is required";
    } else if (minPasswordLength && password.length < minPasswordLength) {
      fieldErrors.password = `Password must be at least ${minPasswordLength} characters`;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit(email, password);
      if (result?.error) {
        setErrors({ general: result.error });
      }
    } catch {
      setErrors({ general: "An unexpected error occurred" });
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold">{title}</h1>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.general && (
            <p className="text-sm text-red-600 dark:text-red-400" aria-live="polite">
              {errors.general}
            </p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              className={inputClass("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              className={inputClass("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? submitLoadingLabel : submitLabel}
          </button>
        </form>
        {footer}
      </div>
    </div>
  );
}
