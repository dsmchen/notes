import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "@/components/auth-form";

afterEach(() => {
  cleanup();
});

function renderForm(overrides = {}) {
  const defaultProps = {
    title: "Sign in",
    submitLabel: "Sign in",
    submitLoadingLabel: "Signing in...",
    onSubmit: vi.fn().mockResolvedValue(undefined),
    footer: <p>Footer</p>,
    ...overrides,
  };
  return { ...defaultProps, ...render(<AuthForm {...defaultProps} />) };
}

describe("AuthForm", () => {
  it("renders title and fields", () => {
    renderForm();
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows email error when submitting empty email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows invalid email format error", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "notanemail");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });
  });

  it("shows password error when submitting empty password", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows min password length error", async () => {
    const user = userEvent.setup();
    renderForm({ minPasswordLength: 8 });

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "12345");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("calls onSubmit with email and password when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm({ onSubmit });

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledWith("test@example.com", "password123");
  });

  it("displays general error from onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({ error: "Invalid credentials" });
    renderForm({ onSubmit });

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("displays unexpected error when onSubmit throws", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Network error"));
    renderForm({ onSubmit });

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => { resolveSubmit = resolve; }),
    );
    renderForm({ onSubmit });

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled();

    resolveSubmit();
    await screen.findByRole("button", { name: "Sign in" });
    expect(screen.getByRole("button", { name: "Sign in" })).not.toBeDisabled();
  });

  it("renders footer content", () => {
    renderForm({ footer: <a href="/signup">Sign up</a> });
    expect(screen.getByText("Sign up")).toHaveAttribute("href", "/signup");
  });
});
