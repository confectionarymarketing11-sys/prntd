"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "forgot-password";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
  initialMessage?: string;
};

const authCopy = {
  login: {
    title: "Welcome Back",
    subtitle: "Sign in to manage orders, designs, QR tools, and account settings.",
    button: "Sign In",
    footer: "Need an account?",
    footerHref: "/signup",
    footerLabel: "Create one",
  },
  signup: {
    title: "Create Account",
    subtitle: "Start your PRNTD account for saved designs, order history, and customer tools.",
    button: "Create Account",
    footer: "Already have an account?",
    footerHref: "/login",
    footerLabel: "Sign in",
  },
  "forgot-password": {
    title: "Reset Password",
    subtitle: "Enter your email and we will send a secure password reset link.",
    button: "Send Reset Link",
    footer: "Remembered it?",
    footerHref: "/login",
    footerLabel: "Back to login",
  },
} satisfies Record<AuthMode, Record<string, string>>;

export default function AuthForm({ mode, nextPath = "/account", initialMessage = "" }: AuthFormProps) {
  const copy = authCopy[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) throw error;

        window.location.href = nextPath || "/account";
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(nextPath || "/account")}`,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        setMessage("Check your email to verify your PRNTD account.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${origin}/account/settings?mode=reset-password`,
      });

      if (error) throw error;

      setMessage("Password reset link sent. Check your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-74px)] max-w-6xl place-items-center px-5 py-12">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[32px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="bg-[#111827] p-8 text-white sm:p-10">
          <div className="mb-8 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white/70">
            PRNTD Account
          </div>
          <h1 className="text-[clamp(34px,4vw,56px)] font-black leading-none tracking-normal">{copy.title}</h1>
          <p className="mt-5 text-base leading-7 text-white/70">{copy.subtitle}</p>
        </div>
        <form onSubmit={submitAuth} className="grid gap-5 p-8 sm:p-10">
          {mode === "signup" && (
            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="portal-field" placeholder="Your name" autoComplete="name" />
            </label>
          )}
          <label className="grid gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} required className="portal-field" type="email" placeholder="you@company.com" autoComplete="email" />
          </label>
          {mode !== "forgot-password" && (
            <label className="grid gap-2">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="portal-field"
                type="password"
                placeholder="Minimum 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
          )}
          {mode === "login" && (
            <Link href="/forgot-password" className="justify-self-end text-sm font-extrabold text-[#4f46e5]">
              Forgot password?
            </Link>
          )}
          <button type="submit" disabled={isSubmitting} className="design-main-btn !mt-0">
            {isSubmitting ? "Working..." : copy.button}
          </button>
          {message && <p className="rounded-[18px] bg-[#eef2ff] px-4 py-3 text-sm font-bold text-[#4338ca]">{message}</p>}
          <p className="text-center text-sm font-semibold text-[#6b7280]">
            {copy.footer}{" "}
            <Link href={copy.footerHref} className="font-extrabold text-[#4f46e5]">
              {copy.footerLabel}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
