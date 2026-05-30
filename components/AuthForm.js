"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, signUp } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { formatAuthError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function AuthForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [authMode, setAuthMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (authMode === "signup") {
        await signUp(email.trim(), password);
        showToast("Account created! Welcome aboard.", "success");
      } else {
        await signIn(email.trim(), password);
        showToast("Signed in successfully.", "success");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      {!isFirebaseConfigured() && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            background: "var(--color-error-bg)",
            color: "var(--color-error)",
            fontSize: "0.875rem",
          }}
        >
          Firebase is not configured yet. Copy <code>.env.example</code> to{" "}
          <code>.env.local</code> and add your project credentials.
        </div>
      )}

      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={`auth-tab ${authMode === "signup" ? "is-active" : ""}`}
          onClick={() => setAuthMode("signup")}
          role="tab"
          aria-selected={authMode === "signup"}
        >
          Sign up
        </button>
        <button
          type="button"
          className={`auth-tab ${authMode === "login" ? "is-active" : ""}`}
          onClick={() => setAuthMode("login")}
          role="tab"
          aria-selected={authMode === "login"}
        >
          Log in
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            className="form-input"
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            className="form-input"
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="At least 6 characters"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: "100%" }}
          disabled={submitting}
        >
          {submitting
            ? "Please wait…"
            : authMode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
    </div>
  );
}
